import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Route, Plus, Save, PlayCircle, Play, Settings2, Trash2, Smartphone, Database, Activity } from 'lucide-react';
import { dbService } from '../services/dbService';

type Step = {
    id: number;
    wabaId: string;
    listTag: string;
    templateInstance: string;
    delay: number;
    meta?: any;
};

const CampaignPlanner = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we came from Upload with a specific tag
    const queryParams = new URLSearchParams(location.search);
    const initialTag = queryParams.get('tag') || '';

    const [campaignName, setCampaignName] = useState('Campanha Escalável #1');
    const [steps, setSteps] = useState<Step[]>([
        { id: 1, wabaId: '', listTag: initialTag, templateInstance: '', delay: 5 }
    ]);

    const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
    const [availableLists, setAvailableLists] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    const apiKey = '5b90ba4e71d2c00cdb1784f476b59c1e-a0338025-abdc-46e6-8b90-0b2b2d62d5c8';
    const fromNumber = '5511997625247';

    const loadData = async () => {
        setIsFetching(true);
        try {
            // Load Lists from DB
            const contactsList = await dbService.getContacts();
            setAvailableLists(contactsList.map((c: any) => ({ tag: c.tag, count: c.count })));

            // Load Templates from Infobip
            const tResponse = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/2/senders/${fromNumber}/templates`, {
                headers: { 'Authorization': `App ${apiKey}` }
            });
            const tData = await tResponse.json();
            setAvailableTemplates(tData.templates || []);

        } catch (error) {
            console.error('Erro ao carregar dados para a Dashboard:', error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        loadData();

        // Load Drafts from TemplateDispatch (stored in DB)
        dbService.getPlannerDrafts().then(drafts => {
            if (drafts && drafts.length > 0) {
                const mappedDrafts = drafts.map((d: any, idx: number) => ({
                    id: d.id || Date.now() + idx,
                    wabaId: d.wabaId,
                    listTag: d.listTag,
                    templateInstance: d.templateName || d.templateInstance,
                    delay: d.delay || 5,
                    meta: {
                        placeholders: d.placeholders || d.meta?.placeholders,
                        headerType: d.headerType || d.meta?.headerType,
                        mediaUrl: d.mediaUrl || d.meta?.mediaUrl,
                        includeButton: d.includeButton || d.meta?.includeButton,
                        buttonPayload: d.buttonPayload || d.meta?.buttonPayload,
                        language: d.language || d.meta?.language
                    }
                }));
                setSteps(mappedDrafts);
            }
        });
    }, []);

    const saveStrategy = async () => {
        const campaign = await dbService.saveCampaign(campaignName, steps);
        if (campaign) {
            alert('Estratégia salva com sucesso no banco de dados!');
        }
    };

    const addStep = () => {
        const newId = steps.length > 0 ? Math.max(...steps.map(s => s.id)) + 1 : 1;
        setSteps([...steps, { id: newId, wabaId: fromNumber, listTag: '', templateInstance: '', delay: 5 }]);
    };

    const removeStep = (id: number) => {
        if (steps.length > 1) {
            setSteps(steps.filter(s => s.id !== id));
        }
    };

    const updateStep = (index: number, field: keyof Step, value: any) => {
        const updatedSteps = [...steps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        setSteps(updatedSteps);
    };

    const totalVolume = steps.reduce((acc, step) => {
        const list = availableLists.find(l => l.tag === step.listTag);
        return acc + (list ? list.count : 0);
    }, 0);

    const runEngine = (idx?: number) => {
        saveStrategy();
        if (idx !== undefined) {
            navigate(`/engine?start=single&idx=${idx}`);
        } else {
            navigate('/engine?start=all');
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
            <style>{`
                .planner-layout { display: grid; grid-template-columns: 350px 1fr; gap: 32px; align-items: start; }
                .summary-card { padding: 32px; border-radius: 24px; background: var(--card-bg-subtle); border: 1px solid var(--surface-border-subtle); }
                .step-card { 
                    padding: 24px; 
                    border-radius: 20px; 
                    background: var(--card-bg-subtle); 
                    border: 1px solid var(--surface-border-subtle);
                    transition: all 0.3s ease;
                }
                .step-card:hover { border-color: var(--primary-color); background: var(--card-bg-subtle); opacity: 0.9; }
                .step-number {
                    width: 32px; height: 32px; border-radius: 50%; background: var(--primary-color); color: black;
                    display: flex; alignItems: center; justifyContent: center; font-weight: 900; font-size: 0.9rem;
                    box-shadow: 0 0 15px var(--primary-color); z-index: 2;
                }
                .connector-line {
                    position: absolute; left: 16px; top: 32px; bottom: -32px; width: 2px;
                    background: linear-gradient(to bottom, var(--primary-color), transparent);
                    z-index: 1; opacity: 0.3;
                }

                @media (max-width: 1000px) {
                    .planner-layout { grid-template-columns: 1fr; }
                    .header-row { flex-direction: column; align-items: flex-start !important; gap: 16px; }
                    .header-actions { width: 100%; }
                    .header-actions button { flex: 1; }
                }
            `}</style>

            <div className="flex items-center justify-between mb-2 header-row">
                <div className="flex flex-col">
                    <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', letterSpacing: '-1px' }}>Scale Planner</h1>
                    <p className="subtitle">Configure o sequenciamento inteligente de disparo em massa</p>
                </div>
                <div className="flex gap-3 header-actions">
                    <button className="btn btn-secondary" style={{ borderRadius: '12px', padding: '12px 20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={() => { dbService.clearPlannerDrafts(); setSteps([{ id: 1, wabaId: fromNumber, listTag: '', templateInstance: '', delay: 5 }]); }}><Trash2 size={18} /> Limpar</button>
                    <button className="btn btn-secondary" style={{ borderRadius: '12px', padding: '12px 20px' }} onClick={saveStrategy}><Save size={18} /> Salvar</button>
                    <button className="btn btn-primary" style={{ borderRadius: '12px', padding: '12px 20px', color: 'black', fontWeight: 800 }} onClick={() => runEngine()}><PlayCircle size={18} /> Iniciar Motor</button>
                </div>
            </div>

            <div className="planner-layout mt-8">
                {/* Statistics & Global Info */}
                <div className="flex flex-col gap-6">
                    <div className="summary-card flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <Settings2 size={24} color="var(--primary-color)" />
                            <h3 style={{ margin: 0, fontWeight: 900 }}>Estratégia</h3>
                        </div>

                        <div className="input-group">
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)' }}>NOME DA CAMPANHA</label>
                            <input className="input-field" style={{ borderRadius: '12px', background: 'var(--card-bg-subtle)', color: 'var(--text-primary)' }} value={campaignName} onChange={e => setCampaignName(e.target.value)} />
                        </div>

                        <div className="flex flex-col gap-4 mt-2">
                            <div className="flex justify-between items-center p-4" style={{ background: 'var(--card-bg-subtle)', borderRadius: '14px', border: '1px solid var(--surface-border-subtle)' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Escopos (WABAs)</span>
                                <b style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{new Set(steps.map(s => s.wabaId).filter(Boolean)).size}</b>
                            </div>
                            <div className="flex justify-between items-center p-4" style={{ background: 'var(--card-bg-subtle)', borderRadius: '14px', border: '1px solid var(--surface-border-subtle)' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fatias de Lote</span>
                                <b style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{steps.length}</b>
                            </div>
                            <div className="flex flex-col p-4" style={{ background: 'rgba(172, 248, 0, 0.05)', borderRadius: '14px', border: '1px solid rgba(172, 248, 0, 0.1)' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase' }}>Volume Total Estimado</span>
                                <b style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginTop: '4px' }}>{totalVolume.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>Contatos</span></b>
                            </div>
                        </div>
                    </div>

                    {isFetching && (
                        <div className="glass-card flex items-center justify-center p-4 gap-3" style={{ border: '1px dashed var(--primary-color)' }}>
                            <Activity size={18} className="animate-spin" color="var(--primary-color)" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>Sincronizando Meta...</span>
                        </div>
                    )}
                </div>

                {/* Step Builder */}
                <div className="flex flex-col gap-6 relative">
                    <div className="flex items-center gap-3 mb-2">
                        <Route size={24} color="var(--primary-color)" />
                        <h3 style={{ margin: 0, fontWeight: 900 }}>Fluxo Sequencial</h3>
                    </div>

                    <div className="flex flex-col gap-8 relative" style={{ paddingLeft: '8px' }}>
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex gap-6 relative group animate-fade-in">
                                {index < steps.length - 1 && <div className="connector-line"></div>}

                                <div className="step-number" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</div>

                                <div className="step-card flex-1">
                                    <div className="flex justify-between items-center mb-6" style={{ borderBottom: '1px solid var(--surface-border-subtle)', paddingBottom: '12px' }}>
                                        <div className="flex items-center gap-2">
                                            <Database size={16} color="var(--primary-color)" />
                                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Lote #{index + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => runEngine(index)}
                                                className="flex items-center justify-center"
                                                style={{ background: 'rgba(172, 248, 0, 0.1)', border: '1px solid rgba(172, 248, 0, 0.2)', color: 'var(--primary-color)', padding: '6px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseOver={e => e.currentTarget.style.background = 'var(--primary-color)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'rgba(172, 248, 0, 0.1)'}
                                            >
                                                <Play size={14} fill="var(--primary-color)" />
                                            </button>
                                            <button onClick={() => removeStep(step.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ff4d4d'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid step-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                        <div className="input-group">
                                            <label>Lista de Contatos</label>
                                            <select className="input-field" style={{ borderRadius: '12px' }} value={step.listTag} onChange={(e) => updateStep(index, 'listTag', e.target.value)}>
                                                <option value="">Selecionar lote...</option>
                                                {availableLists.map((l: any) => (
                                                    <option key={l.tag} value={l.tag}>{l.tag} ({l.count} contatos)</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <label>Remetente (WABA)</label>
                                            <select className="input-field" style={{ borderRadius: '12px' }} value={step.wabaId} onChange={(e) => updateStep(index, 'wabaId', e.target.value)}>
                                                <option value={fromNumber}>{fromNumber} (Default)</option>
                                                <option value="">Multichat (Auto)</option>
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <label>Template</label>
                                            <select className="input-field" style={{ borderRadius: '12px' }} value={step.templateInstance} onChange={(e) => updateStep(index, 'templateInstance', e.target.value)}>
                                                <option value="">Escolher Modelo...</option>
                                                {availableTemplates.map((t: any) => (
                                                    <option key={t.name} value={t.name}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="input-group" style={{ maxWidth: '120px' }}>
                                            <label>Delay (s)</label>
                                            <input type="number" className="input-field" style={{ borderRadius: '12px' }} value={step.delay} onChange={(e) => updateStep(index, 'delay', Number(e.target.value))} />
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 flex items-center gap-3" style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <Smartphone size={14} color="var(--primary-color)" />
                                        <span>Este lote será processado pelo motor de escala vinculado ao canal {step.wabaId || 'principal'}.</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center gap-4 mt-4" style={{ paddingLeft: '44px' }}>
                            <button
                                onClick={addStep}
                                className="flex items-center justify-center"
                                style={{
                                    width: 40, height: 40, borderRadius: '50%', border: '2px dashed var(--primary-color)',
                                    background: 'rgba(172, 248, 0, 0.05)', color: 'var(--primary-color)', cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.color = 'black'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(172, 248, 0, 0.05)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                            >
                                <Plus size={20} />
                            </button>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Adicionar novo passo ao fluxo</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignPlanner;
