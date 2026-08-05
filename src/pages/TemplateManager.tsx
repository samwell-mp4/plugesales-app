import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Search, Settings, Save, Edit, RefreshCw, X, Plus, Play, ExternalLink, ArrowRight, Layers, Link as LinkIcon, Database } from 'lucide-react';
import { dbService } from '../services/dbService';

interface InfobipTemplate {
    name: string;
    language: string;
    category: string;
    status: string;
    structure?: {
        body?: { text: string; example?: any; examples?: any };
        header?: { format: string; text?: string; example?: any };
        buttons?: any[];
    };
    components?: any[];
}

const TemplateManager = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [templates, setTemplates] = useState<InfobipTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Global settings credentials (Sidão/Padrão)
    const [sidaoConfig, setSidaoConfig] = useState<any>(null);

    // Credentials toggle (Sidão vs Luiz)
    const [useLuis, setUseLuis] = useState(false);
    const LUIS_KEY = '35a1621fff9a97453d02b0dbe043467e-9501a6c3-3289-4fb9-90b4-d16b18b48d47';
    const LUIS_BASE = '4k3e4p.api-us.infobip.com';
    const LUIS_SENDER = '5511922034701';

    // Editing State
    const [editingTemplate, setEditingTemplate] = useState<InfobipTemplate | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        bodyText: '',
        category: 'MARKETING',
        headerText: '',
        headerFormat: 'NONE',
        buttonUrl: ''
    });

    // Reconcile Card State
    const [selectedTemplateForCard, setSelectedTemplateForCard] = useState<InfobipTemplate | null>(null);
    const [cards, setCards] = useState<any[]>([]);
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [reconcileModalOpen, setReconcileModalOpen] = useState(false);

    // Variables binding for transmission
    const [varBindings, setVarBindings] = useState<string[]>([]);
    const [rotatorLinks, setRotatorLinks] = useState<any[]>([]);
    const [selectedRotator, setSelectedRotator] = useState<string>('');

    const loadClients = async () => {
        try {
            const res = await fetch(`/api/admin/users`);
            const data = await res.json();
            const infobipClients = data.filter((u: any) => u.infobip_key && u.infobip_sender);
            setClients(infobipClients);
        } catch (err) {
            console.error("Error loading clients for templates:", err);
        }
    };

    const loadSettings = async () => {
        try {
            const settings = await dbService.getSettings(user?.role);
            if (settings) {
                setSidaoConfig({
                    infobip_key: settings['infobip_key'] || '',
                    infobip_sender: settings['infobip_sender'] || '',
                    infobip_url: settings['infobip_url'] || '8k6xv1.api-us.infobip.com'
                });
            }
        } catch (err) {
            console.error("Error loading global settings:", err);
        }
    };

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            let apiKey = '';
            let baseUrl = '8k6xv1.api-us.infobip.com';
            let sender = '';

            if (useLuis) {
                apiKey = LUIS_KEY;
                baseUrl = LUIS_BASE;
                sender = LUIS_SENDER;
            } else if (selectedClient) {
                apiKey = selectedClient.infobip_key;
                baseUrl = selectedClient.infobip_url || '8k6xv1.api-us.infobip.com';
                sender = selectedClient.infobip_sender;
            } else if (sidaoConfig) {
                apiKey = sidaoConfig.infobip_key;
                baseUrl = sidaoConfig.infobip_url || '8k6xv1.api-us.infobip.com';
                sender = sidaoConfig.infobip_sender;
            }

            if (!apiKey || !sender) {
                setTemplates([]);
                return;
            }

            const response = await fetch(`https://${baseUrl}/whatsapp/2/senders/${sender}/templates`, {
                headers: { 'Authorization': `App ${apiKey}` }
            });
            const data = await response.json();
            setTemplates(data.templates || []);
        } catch (err) {
            console.error("Error fetching templates from Infobip:", err);
            setTemplates([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRotators = async () => {
        try {
            const linksData = await dbService.getShortLinks(user?.role, user?.id);
            setRotatorLinks(linksData?.links || []);
        } catch (err) {
            console.error("Error loading rotators:", err);
        }
    };

    useEffect(() => {
        loadClients();
        loadSettings();
        loadRotators();
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [selectedClient, useLuis, sidaoConfig]);

    const handleOpenEdit = (template: InfobipTemplate) => {
        setEditingTemplate(template);
        let bodyVal = '';
        let headText = '';
        let headFormat = 'NONE';
        let btnUrl = '';

        if (template.structure) {
            bodyVal = template.structure.body?.text || '';
            headText = template.structure.header?.text || '';
            headFormat = template.structure.header?.format || 'NONE';
            const urlBtn = template.structure.buttons?.find((b: any) => b.type === 'URL');
            if (urlBtn) btnUrl = urlBtn.url || '';
        } else if (template.components) {
            const bodyComp = template.components.find((c: any) => c.type === 'BODY');
            if (bodyComp) bodyVal = bodyComp.text || '';
            const headComp = template.components.find((c: any) => c.type === 'HEADER');
            if (headComp) {
                headText = headComp.text || '';
                headFormat = headComp.format || 'NONE';
            }
            const btnComp = template.components.find((c: any) => c.type === 'BUTTONS');
            if (btnComp && btnComp.buttons) {
                const urlBtn = btnComp.buttons.find((b: any) => b.type === 'URL');
                if (urlBtn) btnUrl = urlBtn.url || '';
            }
        }

        setEditForm({
            bodyText: bodyVal,
            category: template.category || 'MARKETING',
            headerText: headText,
            headerFormat: headFormat,
            buttonUrl: btnUrl
        });
        setEditModalOpen(true);
    };

    const handleSaveTemplate = async () => {
        if (!editingTemplate) return;
        try {
            let apiKey = '';
            let baseUrl = '8k6xv1.api-us.infobip.com';
            let sender = '';

            if (useLuis) {
                apiKey = LUIS_KEY;
                baseUrl = LUIS_BASE;
                sender = LUIS_SENDER;
            } else if (selectedClient) {
                apiKey = selectedClient.infobip_key;
                baseUrl = selectedClient.infobip_url || '8k6xv1.api-us.infobip.com';
                sender = selectedClient.infobip_sender;
            } else if (sidaoConfig) {
                apiKey = sidaoConfig.infobip_key;
                baseUrl = sidaoConfig.infobip_url || '8k6xv1.api-us.infobip.com';
                sender = sidaoConfig.infobip_sender;
            }

            if (!apiKey || !sender) return alert("Parâmetros do remetente ausentes.");

            const payload: any = {
                category: editForm.category,
                structure: {
                    body: {
                        text: editForm.bodyText
                    }
                }
            };

            if (editForm.headerFormat !== 'NONE') {
                payload.structure.header = {
                    format: editForm.headerFormat
                };
                if (editForm.headerFormat === 'TEXT' && editForm.headerText) {
                    payload.structure.header.text = editForm.headerText;
                }
            }

            if (editForm.buttonUrl) {
                payload.structure.buttons = [
                    {
                        type: 'URL',
                        text: 'Acessar Link',
                        url: editForm.buttonUrl
                    }
                ];
            }

            const res = await fetch(`https://${baseUrl}/whatsapp/2/senders/${sender}/templates/${editingTemplate.name}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `App ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Template editado e enviado para aprovação na Meta com sucesso!");
                setEditModalOpen(false);
                fetchTemplates();
            } else {
                const errData = await res.json();
                alert("Erro ao editar template: " + (errData.error?.description || "Resposta inválida da API."));
            }
        } catch (err) {
            alert("Erro de conexão ao salvar template.");
        }
    };

    const handleOpenReconcile = async (template: InfobipTemplate) => {
        setSelectedTemplateForCard(template);
        setReconcileModalOpen(true);
        
        const targetUserId = useLuis ? (clients[0]?.id || user?.id) : (selectedClient?.id || user?.id);
        try {
            const subs = await dbService.getClientSubmissionsByUserId(targetUserId);
            setCards(subs || []);
            if (subs && subs.length > 0) {
                setSelectedCard(subs[0]);
            }
        } catch (e) {
            console.error("Error loading submissions:", e);
        }

        // Count variables in template body
        let bodyText = '';
        if (template.structure) bodyText = template.structure.body?.text || '';
        else if (template.components) {
            const bodyComp = template.components.find((c: any) => c.type === 'BODY');
            if (bodyComp) bodyText = bodyComp.text || '';
        }

        const matchVars = bodyText.match(/\{\{\d+\}\}/g) || [];
        const uniqueVarsCount = new Set(matchVars).size;
        setVarBindings(Array(uniqueVarsCount).fill(''));
    };

    const handleLaunchCampaign = () => {
        if (!selectedTemplateForCard || !selectedCard) return;

        const bindingsQuery = varBindings.map((val, idx) => `var_${idx + 1}=${encodeURIComponent(val)}`).join('&');
        const sender = useLuis ? LUIS_SENDER : (selectedClient?.infobip_sender || sidaoConfig?.infobip_sender);
        
        window.location.href = `/dispatch?from=${sender}&template=${selectedTemplateForCard.name}&card_id=${selectedCard.id}&${bindingsQuery}&rotator=${encodeURIComponent(selectedRotator)}`;
    };

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const effectiveSender = useLuis ? LUIS_SENDER : (selectedClient?.infobip_sender || sidaoConfig?.infobip_sender);

    return (
        <div className="crm-container" style={{ minHeight: '100vh', padding: '32px' }}>
            <div className="crm-header-premium mb-8">
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <FileText size={12} /> GERENCIADOR DE TEMPLATES INFOBIP
                    </div>
                    <h1 className="crm-main-title">WhatsApp Template Manager</h1>
                </div>
            </div>

            {/* Switch Credentials */}
            <div className="crm-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border-subtle)' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--primary-color)' }}>Selecione a Credencial de Acesso</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Escolha qual conta da Infobip você deseja gerenciar os templates</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => setUseLuis(false)}
                        className="action-btn"
                        style={{ 
                            height: '42px', 
                            minWidth: '130px', 
                            background: !useLuis ? 'var(--primary-color)' : 'transparent', 
                            color: !useLuis ? 'black' : 'white',
                            borderColor: !useLuis ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        Sidão (Padrão)
                    </button>
                    <button 
                        onClick={() => setUseLuis(true)}
                        className="action-btn"
                        style={{ 
                            height: '42px', 
                            minWidth: '130px', 
                            background: useLuis ? 'var(--primary-color)' : 'transparent', 
                            color: useLuis ? 'black' : 'white',
                            borderColor: useLuis ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        Luiz
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ minWidth: '280px', opacity: useLuis ? 0.4 : 1, pointerEvents: useLuis ? 'none' : 'auto' }}>
                    <label className="field-label" style={{ marginBottom: '8px' }}>Selecione o Cliente / Remetente Alternativo</label>
                    <select 
                        className="field-input" 
                        value={selectedClient ? selectedClient.id : ''} 
                        onChange={e => setSelectedClient(clients.find(c => String(c.id) === e.target.value))}
                        style={{ height: '58px', background: 'var(--card-bg)' }}
                        disabled={useLuis}
                    >
                        <option value="">Selecione...</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.infobip_sender})</option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: 1, minWidth: '250px', marginTop: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                        <input 
                            className="field-input" 
                            placeholder="Buscar templates por nome..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ height: '58px', paddingLeft: '60px' }}
                        />
                    </div>
                </div>

                <button 
                    onClick={fetchTemplates} 
                    className="action-btn ghost-btn" 
                    style={{ height: '58px', marginTop: '24px', padding: '0 20px' }}
                    title="Recarregar do Servidor Infobip"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {effectiveSender && (
                <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8', padding: '12px 20px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.85rem', fontWeight: 800 }}>
                    ℹ️ Remetente Ativo: {effectiveSender} ({useLuis ? 'Conta do Luiz' : selectedClient ? 'Cliente ' + selectedClient.name : 'Configuração Padrão do Sidão'})
                </div>
            )}

            {isLoading ? (
                <div style={{ color: 'var(--text-muted)' }}>Buscando templates na Infobip...</div>
            ) : filteredTemplates.length === 0 ? (
                <div className="crm-card" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
                    Nenhum template encontrado para este remetente.
                </div>
            ) : (
                <div className="crm-card" style={{ padding: '0', overflowX: 'auto', border: '1px solid var(--surface-border-subtle)', background: 'rgba(10,15,24,0.3)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Nome do Template</th>
                                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Categoria</th>
                                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Idioma</th>
                                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Status Meta</th>
                                <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTemplates.map(template => {
                                let statusColor = '#f59e0b';
                                let statusBg = 'rgba(245,158,11,0.08)';
                                if (template.status === 'APPROVED') {
                                    statusColor = '#acf800';
                                    statusBg = 'rgba(172,248,0,0.08)';
                                } else if (template.status === 'REJECTED') {
                                    statusColor = '#ef4444';
                                    statusBg = 'rgba(239,68,68,0.08)';
                                }

                                return (
                                    <tr key={template.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ fontWeight: 950, color: 'white', fontSize: '0.95rem' }}>{template.name}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {template.category}
                                        </td>
                                        <td style={{ padding: '20px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {template.language}
                                        </td>
                                        <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', background: statusBg, color: statusColor, textTransform: 'uppercase', border: `1px solid ${statusColor}33` }}>
                                                {template.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => handleOpenEdit(template)} 
                                                    className="action-btn ghost-btn" 
                                                    style={{ padding: '0 14px', fontSize: '0.8rem', height: '36px', borderColor: '#38bdf8', color: '#38bdf8' }}
                                                >
                                                    <Edit size={14} /> EDITAR
                                                </button>
                                                {template.status === 'APPROVED' && (
                                                    <button 
                                                        onClick={() => handleOpenReconcile(template)} 
                                                        className="action-btn ghost-btn" 
                                                        style={{ padding: '0 14px', fontSize: '0.8rem', height: '36px', borderColor: '#acf800', color: '#acf800' }}
                                                    >
                                                        <LinkIcon size={14} /> CONCILIAR CARD
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Template Modal */}
            {editModalOpen && editingTemplate && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>Editar Template</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Template: {editingTemplate.name}</p>
                            </div>
                            <button onClick={() => setEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div className="flex-col gap-4">
                            <div>
                                <label className="field-label">Categoria do Template</label>
                                <select 
                                    className="field-input" 
                                    value={editForm.category}
                                    onChange={e => setEditForm({...editForm, category: e.target.value})}
                                    style={{ background: 'var(--card-bg)' }}
                                >
                                    <option value="MARKETING">MARKETING (Envio comercial)</option>
                                    <option value="UTILITY">UTILITY (Mensagens de serviço/transacionais)</option>
                                </select>
                            </div>

                            {editForm.headerFormat === 'TEXT' && (
                                <div>
                                    <label className="field-label">Texto do Cabeçalho (Opcional)</label>
                                    <input className="field-input" value={editForm.headerText} onChange={e => setEditForm({...editForm, headerText: e.target.value})} placeholder="Ex: IMPORTANTE" />
                                </div>
                            )}

                            <div>
                                <label className="field-label">Corpo do Texto (Use {"{{1}}"}, {"{{2}}"} para variáveis)</label>
                                <textarea 
                                    className="field-input" 
                                    value={editForm.bodyText} 
                                    onChange={e => setEditForm({...editForm, bodyText: e.target.value})} 
                                    style={{ height: '140px', padding: '12px', resize: 'vertical' }}
                                    placeholder="Escreva a sua mensagem..."
                                />
                            </div>

                            <div>
                                <label className="field-label">Link do Botão de URL (Opcional)</label>
                                <input className="field-input" value={editForm.buttonUrl} onChange={e => setEditForm({...editForm, buttonUrl: e.target.value})} placeholder="https://encurtado.com/{{1}}" />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Deixe em branco se o template não possuir botão de link.</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button onClick={handleSaveTemplate} className="action-btn primary-btn" style={{ flex: 1, height: '48px' }}><Save size={18} /> SALVAR ALTERAÇÕES</button>
                            <button onClick={() => setEditModalOpen(false)} className="action-btn ghost-btn" style={{ flex: 1, height: '48px' }}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reconcile Card & Launch Modal */}
            {reconcileModalOpen && selectedTemplateForCard && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card" style={{ width: '100%', maxWidth: '650px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>Conciliar Card e Lançar Campanha</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Template: {selectedTemplateForCard.name}</p>
                            </div>
                            <button onClick={() => setReconcileModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div className="flex-col gap-4">
                            <div>
                                <label className="field-label">Selecione o Card do Cliente (Upload de Contatos/Campanha)</label>
                                <select 
                                    className="field-input" 
                                    value={selectedCard ? selectedCard.id : ''} 
                                    onChange={e => setSelectedCard(cards.find(c => String(c.id) === e.target.value))}
                                    style={{ background: 'var(--card-bg)' }}
                                >
                                    <option value="">Selecione um card ativo...</option>
                                    {cards.map(c => (
                                        <option key={c.id} value={c.id}>{c.profile_name} (DDD: {c.ddd})</option>
                                    ))}
                                </select>
                            </div>

                            {selectedCard && (
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--primary-color)', display: 'block', marginBottom: '8px' }}>DADOS VINCULADOS DO CARD:</span>
                                    <div>Planilha: <strong style={{ color: 'white' }}>{selectedCard.spreadsheet_url || 'Nenhuma'}</strong></div>
                                    <div>Link de Mídia/Imagem: <strong style={{ color: 'white' }}>{selectedCard.media_url || 'Nenhuma'}</strong></div>
                                    <div>Cópia do Anúncio: <span style={{ color: 'white', fontStyle: 'italic' }}>{selectedCard.ad_copy || 'Sem cópia'}</span></div>
                                </div>
                            )}

                            <div>
                                <label className="field-label">Selecione o Link do Encurtador/Rotador</label>
                                <select 
                                    className="field-input" 
                                    value={selectedRotator}
                                    onChange={e => setSelectedRotator(e.target.value)}
                                    style={{ background: 'var(--card-bg)' }}
                                >
                                    <option value="">Selecione um link do encurtador...</option>
                                    {rotatorLinks.map(l => (
                                        <option key={l.id} value={l.destination_url}>{l.title} ({l.short_code})</option>
                                    ))}
                                </select>
                            </div>

                            {varBindings.length > 0 && (
                                <div>
                                    <label className="field-label" style={{ marginBottom: '12px' }}>Vincular Variáveis do Template (Body)</label>
                                    <div className="flex flex-col gap-3">
                                        {varBindings.map((val, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary-color)', minWidth: '40px' }}>{"{{"}{idx + 1}{"}}"}:</span>
                                                <select 
                                                    className="field-input"
                                                    value={val}
                                                    onChange={e => {
                                                        const copy = [...varBindings];
                                                        copy[idx] = e.target.value;
                                                        setVarBindings(copy);
                                                    }}
                                                    style={{ flex: 1, height: '42px', fontSize: '0.85rem', background: 'var(--card-bg)' }}
                                                >
                                                    <option value="">Vincular a...</option>
                                                    <option value="name">Nome do Cliente</option>
                                                    <option value={selectedCard?.media_url || ''}>Link da Imagem (do Card)</option>
                                                    <option value={selectedRotator || ''}>Link do Encurtador (Selecionado acima)</option>
                                                    <option value="custom">Preenchimento Manual / Planilha</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button 
                                onClick={handleLaunchCampaign} 
                                className="action-btn primary-btn" 
                                style={{ flex: 1, height: '48px', gap: '8px' }}
                                disabled={!selectedCard}
                            >
                                IR PARA DISPAROS <Play size={16} />
                            </button>
                            <button onClick={() => setReconcileModalOpen(false)} className="action-btn ghost-btn" style={{ flex: 1, height: '48px' }}>CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateManager;
