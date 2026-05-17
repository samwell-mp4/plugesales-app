import { useState, useEffect } from 'react';
import { 
    Users, Percent, DollarSign, 
    Save, RefreshCw, User, 
    CheckCircle2, Clock, AlertCircle,
    ChevronDown, Edit3, TrendingUp
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

const FinanceCommissions = () => {
    const { user } = useAuth();
    const [salespeople, setSalespeople] = useState<any[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCommission, setEditingCommission] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [peopleData, salesData] = await Promise.all([
                dbService.getFinanceSalespeople(),
                dbService.getFinanceSales({ userId: user?.id, role: user?.role })
            ]);
            setSalespeople(peopleData);
            setSales(salesData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfig = async (userId: number, percentage: number) => {
        setIsSaving(true);
        try {
            await dbService.saveSalespersonConfig({ user_id: userId, commission_percentage: percentage });
            fetchData();
            setEditingCommission(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const calculateCommissionStats = (salespersonId: number) => {
        const personSales = sales.filter(s => s.salesperson_id === salespersonId);
        const totalCommission = personSales.reduce((acc, curr) => acc + parseFloat(curr.commission_value), 0);
        const paidCommission = personSales.filter(s => s.commission_status === 'PAGA').reduce((acc, curr) => acc + parseFloat(curr.commission_value), 0);
        const pendingCommission = totalCommission - paidCommission;
        return { totalCommission, paidCommission, pendingCommission, count: personSales.length };
    };

    const updateCommissionStatus = async (saleId: number, status: string) => {
        try {
            await dbService.saveFinanceSale({ id: saleId, commission_status: status });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="animate-fade-in finance-page" style={{ padding: '40px', paddingBottom: '80px' }}>
            <style>{`
                .finance-page h1 { font-weight: 900 !important; font-size: 2.5rem !important; letter-spacing: -1.5px !important; margin: 0 !important; color: white !important; }
                .finance-page .subtitle { margin: 0; color: var(--text-secondary); opacity: 0.7; font-size: 0.9rem; }
                
                .commission-card-finance {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 24px;
                    padding: 24px;
                    backdrop-filter: blur(20px);
                }

                .table-container-finance {
                    background: var(--card-bg-subtle, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--surface-border-subtle, rgba(255, 255, 255, 0.08));
                    border-radius: 24px;
                    overflow: hidden;
                    margin-top: 24px;
                }
                
                table { width: 100%; border-collapse: collapse; }
                th { 
                    padding: 16px 24px; 
                    background: rgba(255,255,255,0.02); 
                    color: var(--text-muted); 
                    font-size: 0.7rem; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: 1px;
                }
                td { padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }

                .input-percentage-finance {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--primary-color);
                    border-radius: 8px;
                    color: white;
                    font-weight: 900;
                    font-size: 0.8rem;
                    padding: 4px 8px;
                    width: 60px;
                    outline: none;
                }
            `}</style>

            <header className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                    <h1>Comissões & Incentivos</h1>
                    <p className="subtitle">Gestão de remuneração variável e performance comercial</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchData} 
                        disabled={isLoading}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', color: 'white', cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {salespeople.map((person) => (
                        <div key={person.id} className="commission-card-finance">
                            <div className="flex items-center gap-4 mb-6">
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontWeight: 900, color: 'white', fontSize: '1.1rem' }}>{person.name}</h4>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>COMERCIAL</span>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Comissão</span>
                                    {editingCommission === person.id ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                className="input-percentage-finance"
                                                defaultValue={person.commission_percentage || 0}
                                                id={`perc-${person.id}`}
                                            />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'white' }}>%</span>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '1.4rem', fontWeight: 950, color: 'var(--primary-color)' }}>{person.commission_percentage || 0}%</span>
                                    )}
                                </div>
                                
                                {editingCommission === person.id ? (
                                    <button 
                                        onClick={() => {
                                            const val = (document.getElementById(`perc-${person.id}`) as HTMLInputElement).value;
                                            handleSaveConfig(person.id, parseFloat(val));
                                        }}
                                        style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer' }}
                                    >
                                        <Save size={18} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setEditingCommission(person.id)}
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-12">
                {salespeople.map((person) => {
                    const stats = calculateCommissionStats(person.id);
                    if (stats.count === 0 && !isAdmin) return null;

                    return (
                        <div key={person.id}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(172, 248, 0, 0.1)', border: '1px solid rgba(172, 248, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                        <User size={18} />
                                    </div>
                                    <h3 style={{ margin: 0, fontWeight: 900, color: 'white', fontSize: '1.4rem' }}>{person.name}</h3>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ACUMULADO</span>
                                        <h4 style={{ margin: 0, fontWeight: 950, color: 'white' }}>R$ {stats.totalCommission.toLocaleString('pt-BR')}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>PAGO</span>
                                        <h4 style={{ margin: 0, fontWeight: 950, color: '#10b981' }}>R$ {stats.paidCommission.toLocaleString('pt-BR')}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase' }}>A PAGAR</span>
                                        <h4 style={{ margin: 0, fontWeight: 950, color: '#facc15' }}>R$ {stats.pendingCommission.toLocaleString('pt-BR')}</h4>
                                    </div>
                                </div>
                            </div>

                            <div className="table-container-finance">
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>DATA</th>
                                            <th style={{ textAlign: 'left' }}>CLIENTE</th>
                                            <th style={{ textAlign: 'right' }}>BASE VENDA</th>
                                            <th style={{ textAlign: 'right' }}>COMISSÃO</th>
                                            <th style={{ textAlign: 'center' }}>STATUS</th>
                                            <th style={{ textAlign: 'right' }}>AÇÕES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.filter(s => s.salesperson_id === person.id).map((sale) => (
                                            <tr key={sale.id}>
                                                <td style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{new Date(sale.sale_date).toLocaleDateString('pt-BR')}</td>
                                                <td>
                                                    <div className="flex flex-col">
                                                        <span style={{ fontWeight: 900, color: 'white', fontSize: '0.9rem' }}>{sale.client_name}</span>
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{sale.package_hired}</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>R$ {parseFloat(sale.total_value).toLocaleString('pt-BR')}</td>
                                                <td style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 950, color: 'var(--primary-color)' }}>R$ {parseFloat(sale.commission_value).toLocaleString('pt-BR')}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ 
                                                        fontSize: '0.65rem', 
                                                        fontWeight: 900, 
                                                        padding: '4px 8px', 
                                                        borderRadius: '6px', 
                                                        background: sale.commission_status === 'PAGA' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                                                        color: sale.commission_status === 'PAGA' ? '#10b981' : '#facc15',
                                                        border: `1px solid ${sale.commission_status === 'PAGA' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(250, 204, 21, 0.2)'}`
                                                    }}>
                                                        {sale.commission_status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {isAdmin && sale.commission_status !== 'PAGA' && (
                                                        <button 
                                                            onClick={() => updateCommissionStatus(sale.id, 'PAGA')}
                                                            style={{ background: 'var(--primary-color)', color: 'black', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                                                        >
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FinanceCommissions;
