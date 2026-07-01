import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { Search, Plus, X, Users, MapPin, Phone, Mail, Building, Landmark, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import SupremeLoading from '../components/SupremeLoading';

interface Supplier {
    id: number;
    name: string;
    document: string;
    email: string;
    phone: string;
    address: string;
    pix_key: string;
    bank: string;
    agency: string;
    account: string;
    notes: string;
}

const rowStyle = { borderBottom: '1px solid rgba(255,255,255,0.05)' };
const cellStyle = { padding: '16px 24px' };
const labelStyle: React.CSSProperties = { fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' as const, paddingLeft: '4px' };
const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontWeight: 700, padding: '12px', width: '100%', outline: 'none' };
const btnPrimary: React.CSSProperties = { background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '14px', padding: '16px 24px', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };

const FinanceSuppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Supplier>>({});

    const fetchSuppliers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('finance_suppliers')
            .select('*')
            .order('name', { ascending: true });

        if (!error && data) {
            setSuppliers(data as Supplier[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        let error;
        if (formData.id) {
            const { error: updateError } = await supabase.from('finance_suppliers').update(formData).eq('id', formData.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('finance_suppliers').insert([formData]);
            error = insertError;
        }
        
        if (!error) {
            setIsModalOpen(false);
            setFormData({});
            fetchSuppliers();
        } else {
            alert('Erro ao salvar fornecedor: ' + error.message);
            setLoading(false);
        }
    };

    const handleEdit = (supplier: Supplier) => {
        setFormData(supplier);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.')) return;
        setLoading(true);
        const { error } = await supabase.from('finance_suppliers').delete().eq('id', id);
        if (!error) {
            fetchSuppliers();
        } else {
            alert('Erro ao excluir: ' + error.message);
            setLoading(false);
        }
    };

    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        (s.document && s.document.includes(search))
    );

    if (loading) return <SupremeLoading />;

    return (
        <div className="finance-page animate-fade-in" style={{ padding: "40px", paddingBottom: "80px" }}>
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                .finance-page tr:hover .actions-cell { opacity: 1 !important; }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
                    <h1>Fornecedores & Prestadores</h1>
                    <p className="subtitle">Gestão de entidades cadastradas</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' as const }}>
                    <div className="finance-search-box-premium">
                        <Search size={16} className="text-white/40" />
                        <input 
                            type="text" 
                            placeholder="Buscar fornecedor..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setIsModalOpen(true)} style={btnPrimary}>
                        <Plus size={18} /> Novo Cadastro
                    </button>
                </div>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "24px", backdropFilter: "blur(20px)", overflowX: 'auto' as const, marginTop: '24px' }}>
                <table style={{ width: '100%', textAlign: 'left' as const, fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', borderCollapse: 'collapse' as const }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase' as const, fontSize: '10px', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)' }}>
                            <th style={{ padding: '16px 24px', fontWeight: 500 }}>Nome / Razão Social</th>
                            <th style={{ padding: '16px 24px', fontWeight: 500 }}>Documento</th>
                            <th style={{ padding: '16px 24px', fontWeight: 500 }}>Contato</th>
                            <th style={{ padding: '16px 24px', fontWeight: 500, textAlign: 'right' as const }}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.map(s => (
                            <tr key={s.id} style={{ ...rowStyle, transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => handleEdit(s)} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                <td style={cellStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                            <Building size={18} />
                                        </div>
                                        <span style={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>{s.name}</span>
                                    </div>
                                </td>
                                <td style={cellStyle}>{s.document || '-'}</td>
                                <td style={cellStyle}>
                                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
                                        {s.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}><Phone size={12}/> {s.phone}</span>}
                                        {s.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}><Mail size={12}/> {s.email}</span>}
                                    </div>
                                </td>
                                <td style={{ ...cellStyle, textAlign: 'right' as const }}>
                                    <div className="actions-cell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', opacity: 0, transition: 'opacity 0.2s' }}>
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: '8px', color: '#60a5fa', cursor: 'pointer', transition: 'all 0.2s' }} title="Editar">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }} title="Excluir">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredSuppliers.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center' as const, color: 'rgba(255,255,255,0.4)' }}>
                                    Nenhum fornecedor encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', padding: '5vh 16px', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', overflowY: 'auto' }}>
                    <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column' as const, margin: 'auto', maxHeight: 'none' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users style={{ color: 'var(--primary-color)' }} /> Novo Fornecedor / Prestador
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            <form id="supplierForm" onSubmit={handleSave}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                        <label style={labelStyle}>Nome / Razão Social *</label>
                                        <input required type="text" style={inputStyle} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                        <label style={labelStyle}>CPF / CNPJ</label>
                                        <input type="text" style={inputStyle} value={formData.document || ''} onChange={e => setFormData({...formData, document: e.target.value})} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                        <label style={labelStyle}>E-mail</label>
                                        <input type="email" style={inputStyle} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                        <label style={labelStyle}>Telefone</label>
                                        <input type="text" style={inputStyle} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', marginBottom: '24px' }}>
                                    <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> Endereço Completo</label>
                                    <input type="text" style={inputStyle} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                                </div>
                                
                                <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Landmark size={16} style={{ color: 'var(--primary-color)' }}/> Dados Bancários</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                            <label style={labelStyle}>Chave PIX</label>
                                            <input type="text" style={inputStyle} value={formData.pix_key || ''} onChange={e => setFormData({...formData, pix_key: e.target.value})} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                            <label style={labelStyle}>Banco</label>
                                            <input type="text" style={inputStyle} value={formData.bank || ''} onChange={e => setFormData({...formData, bank: e.target.value})} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                            <label style={labelStyle}>Agência</label>
                                            <input type="text" style={inputStyle} value={formData.agency || ''} onChange={e => setFormData({...formData, agency: e.target.value})} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                            <label style={labelStyle}>Conta</label>
                                            <input type="text" style={inputStyle} value={formData.account || ''} onChange={e => setFormData({...formData, account: e.target.value})} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                                    <label style={labelStyle}>Observações</label>
                                    <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                                </div>
                            </form>
                        </div>
                        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                                Cancelar
                            </button>
                            <button type="submit" form="supplierForm" style={btnPrimary}>
                                Salvar Cadastro
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default FinanceSuppliers;
