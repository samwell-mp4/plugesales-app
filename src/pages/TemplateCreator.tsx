import { useState, useEffect } from 'react';
import { Send, Smartphone, Layers, Settings2, Image as ImageIcon, Video, Link, MessageSquareReply, Plus, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type ButtonDef = {
    type: 'url' | 'reply';
    text: string;
    url?: string;
};

const TemplateCreator = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'MODEL' | 'BULK'>('MODEL');

    // --- API / CONFIG STATE ---
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('infobip_key') || '5b90ba4e71d2c00cdb1784f476b59c1e-a0338025-abdc-46e6-8b90-0b2b2d62d5c8');
    const [senderNumber, setSenderNumber] = useState(() => localStorage.getItem('infobip_sender') || '5511997625247');

    useEffect(() => {
        localStorage.setItem('infobip_key', apiKey);
        localStorage.setItem('infobip_sender', senderNumber);
    }, [apiKey, senderNumber]);

    // --- MODEL STATE ---
    const [modelName, setModelName] = useState('pagamento_confirmado');
    const [category, setCategory] = useState('UTILITY');
    const [language, setLanguage] = useState('pt_BR');

    const [headerType, setHeaderType] = useState<'none' | 'image' | 'video'>('none');
    const [headerExampleUrl] = useState('https://i.postimg.cc/xC34d8pf/efdb084f-a76e-45e8-8849-92c7d8c5c2c9.jpg');

    const [bodyText, setBodyText] = useState('Oi {{1}}! Informamos que {{2}}\n\n{{3}}\n\nPara {{4}}, clique no botão abaixo 👇');
    const [footerText, setFooterText] = useState('Digite "sair" para não receber mais mensagens');

    const defaultVars = ['Leandro', 'recebemos a confirmação do pagamento referente ao protocolo nº 7164427, realizado em 12/10/2025', 'O comprovante digital já se encontra disponível para conferência', 'acessar o comprovante digital #54333 e verificar a entrega'];
    const [variablesExample, setVariablesExample] = useState(defaultVars);

    const [buttons, setButtons] = useState<ButtonDef[]>([
        { type: 'url', text: 'Clique Aqui', url: 'https://site.com' }
    ]);

    // --- BULK STATE ---
    const [bulkPrefix, setBulkPrefix] = useState('pagamento_');
    const [bulkQuantity, setBulkQuantity] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);

    // --- HELPER: MAP TO INFOBIP STRUCTURE ---
    const buildInfobipPayload = (nameOverride?: string) => {
        const varMatches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
        const varCount = varMatches.length;
        const examples = variablesExample.slice(0, varCount);
        while (examples.length < varCount) {
            examples.push("Exemplo");
        }

        const structure: any = {
            body: {
                text: bodyText,
                examples: examples
            }
        };

        if (headerType !== 'none') {
            structure.header = {
                format: headerType.toUpperCase(),
                example: headerExampleUrl
            };
        }

        if (footerText) {
            structure.footer = { text: footerText };
        }

        if (buttons.length > 0) {
            structure.buttons = buttons.map(btn => ({
                type: btn.type === 'url' ? 'URL' : 'QUICK_REPLY',
                text: btn.text,
                ...(btn.type === 'url' ? { url: btn.url } : {})
            }));
        }

        return {
            name: nameOverride || modelName,
            language: language,
            category: category,
            structure: structure
        };
    };

    const callInfobipAPI = async (payload: any) => {
        try {
            const response = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/2/senders/${senderNumber}/templates`, {
                method: 'POST',
                headers: {
                    'Authorization': `App ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (response.ok) {
                return { success: true, data: result };
            } else {
                console.error('Infobip API Error:', result);
                const apiError = result.requestError?.serviceException?.text ||
                    result.requestError?.serviceException?.message ||
                    result.errorMessage ||
                    JSON.stringify(result);
                return { success: false, error: apiError };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    const sendToWebhook = async (payload: any) => {
        console.log('Enviando para Webhook:', payload);
        try {
            const response = await fetch("https://db-n8n.msely6.easypanel.host/webhook-test/quick-dispatch", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log('Resposta Webhook:', response.status);
        } catch (err) {
            console.error('Erro de Rede no Webhook:', err);
        }
    };

    const getPreviewHtml = () => {
        let text = bodyText;
        variablesExample.forEach((val, index) => {
            const regex = new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g');
            text = text.replace(regex, `<span style="color:var(--primary-color); font-weight:700;">${val || `{{${index + 1}}}`}</span>`);
        });
        return text.replace(/\n/g, '<br />');
    };

    const handleAddButton = () => {
        if (buttons.length < 3) setButtons([...buttons, { type: 'reply', text: 'NOVO BOTÃO' }]);
        else alert('A Meta permite no máximo 3 botões em templates padrão.');
    };

    const handleUpdateButton = (index: number, field: keyof ButtonDef, value: string) => {
        const newButtons = [...buttons];
        newButtons[index] = { ...newButtons[index], [field]: value } as ButtonDef;
        setButtons(newButtons);
    };

    const handleRemoveButton = (index: number) => {
        setButtons(buttons.filter((_, i) => i !== index));
    };

    const handleCreateModel = async () => {
        if (!modelName) return alert("Defina um nome para o template.");
        setIsGenerating(true);
        const payload = buildInfobipPayload();
        const res = await callInfobipAPI(payload);
        setIsGenerating(false);

        if (res.success) {
            // Track for admin control
            const templateLog = JSON.parse(localStorage.getItem('admin_template_logs') || '[]');
            templateLog.push({
                name: modelName,
                author: user?.name,
                timestamp: new Date().toISOString(),
                type: 'SINGLE'
            });
            localStorage.setItem('admin_template_logs', JSON.stringify(templateLog));
            
            // Send to Webhook
            await sendToWebhook(payload);

            alert(`✅ Template "${modelName}" criado com sucesso!`);
        }
        else alert(`❌ Erro: ${res.error}`);
    };

    const handleGenerateBulk = async () => {
        if (!bulkPrefix) return alert("Forneça um prefixo base.");
        const confirmBulk = window.confirm(`Isso irá disparar ${bulkQuantity} chamadas de API. Continuar?`);
        if (!confirmBulk) return;

        setIsGenerating(true);
        let successCount = 0;
        let errors = [];

        for (let i = 1; i <= bulkQuantity; i++) {
            const name = `${bulkPrefix}${String(i).padStart(3, '0')}`;
            const payload = buildInfobipPayload(name);
            const res = await callInfobipAPI(payload);
            if (res.success) {
                successCount++;
                const templateLog = JSON.parse(localStorage.getItem('admin_template_logs') || '[]');
                templateLog.push({
                    name: name,
                    author: user?.name,
                    timestamp: new Date().toISOString(),
                    type: 'BULK'
                });
                localStorage.setItem('admin_template_logs', JSON.stringify(templateLog));
                await sendToWebhook(payload);
            }
            else errors.push(`${name}: ${res.error}`);
            await new Promise(r => setTimeout(r, 400));
        }

        setIsGenerating(false);
        alert(`Finalizado!\nSucesso: ${successCount}\nErros: ${errors.length}`);
    };

    return (
        <div className="animate-fade-in creator-page" style={{ paddingBottom: '80px' }}>
            <style>{`
                .creator-layout { display: grid; grid-template-columns: 1fr 400px; gap: 32px; align-items: start; }
                .config-bar { background: rgba(172, 248, 0, 0.03); border: 1px solid rgba(172, 248, 0, 0.1); border-radius: 20px; padding: 24px; display: flex; gap: 24px; }
                .var-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
                .button-editor { background: rgba(0,0,0,0.2); padding: 16px; border: 1px solid var(--surface-border); border-radius: 12px; display: flex; gap: 12px; align-items: center; }
                .preview-sticky { position: sticky; top: 24px; }
                .wp-bubble { background: #0b141a; border-radius: 12px; padding: 10px; border: 1px solid #1f2c34; max-width: 320px; margin: 0 auto; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
                .wp-content { background: #202c33; border-radius: 10px; position: relative; overflow: hidden; }
                
                @media (max-width: 1100px) {
                    .creator-layout { grid-template-columns: 1fr; }
                    .preview-sticky { position: static; margin-top: 32px; }
                }
                @media (max-width: 768px) {
                    .config-bar { flex-direction: column; }
                    .header-grid { grid-template-columns: 1fr !important; }
                    .tab-btns { flex-direction: column; }
                }
            `}</style>

            <div className="flex flex-col mb-6">
                <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', letterSpacing: '-1px' }}>Templates WhatsApp</h1>
                <p className="subtitle">Criação oficial de modelos para aprovação da Meta via Infobip Cloud</p>
            </div>

            {/* API Settings Bar */}
            <div className="config-bar mb-8 animate-fade-in">
                <div className="input-group" style={{ flex: 1.5 }}>
                    <label style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.7rem' }}>CHAVE DE API (INFOBIP)</label>
                    <input className="input-field" type="password" style={{ borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }} value={apiKey} onChange={e => setApiKey(e.target.value)} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                    <label style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.7rem' }}>NÚMERO DO REMETENTE</label>
                    <input className="input-field" style={{ borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }} value={senderNumber} onChange={e => setSenderNumber(e.target.value)} />
                </div>
            </div>

            <div className="creator-layout">
                {/* Form Column */}
                <div className="flex-col gap-8">
                    <div className="flex gap-3 tab-btns">
                        <button className={`btn ${activeTab === 'MODEL' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('MODEL')} style={{ flex: 1, borderRadius: '14px', height: '54px' }}>
                            <Layers size={18} /> MODELO PADRÃO
                        </button>
                        <button className={`btn ${activeTab === 'BULK' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('BULK')} style={{ flex: 1, borderRadius: '14px', height: '54px' }}>
                            <Settings2 size={18} /> GERADOR BULK
                        </button>
                    </div>

                    {activeTab === 'MODEL' ? (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <div className="glass-card flex-col gap-6" style={{ padding: '32px', borderRadius: '24px' }}>
                                <div className="flex items-center gap-3">
                                    <Settings2 size={24} color="var(--primary-color)" />
                                    <h3 style={{ margin: 0, fontWeight: 900 }}>Estrutura Básica</h3>
                                </div>

                                <div className="grid header-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '20px' }}>
                                    <div className="input-group">
                                        <label>Nome Técnico (sem espaços)</label>
                                        <input className="input-field" style={{ borderRadius: '12px' }} value={modelName} onChange={e => setModelName(e.target.value.toLowerCase().replace(/\s/g, '_'))} />
                                    </div>
                                    <div className="input-group">
                                        <label>Categoria</label>
                                        <select className="input-field" style={{ borderRadius: '12px' }} value={category} onChange={e => setCategory(e.target.value)}>
                                            <option value="MARKETING">Marketing</option>
                                            <option value="UTILITY">Utilidade</option>
                                            <option value="AUTHENTICATION">Autenticação</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Idioma</label>
                                        <select className="input-field" style={{ borderRadius: '12px' }} value={language} onChange={e => setLanguage(e.target.value)}>
                                            <option value="pt_BR">Português (BR)</option>
                                            <option value="en_US">Inglês (US)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card flex-col gap-6" style={{ padding: '32px', borderRadius: '24px' }}>
                                <div className="flex items-center justify-between">
                                    <label style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>Tipo de Cabeçalho</label>
                                    <div className="flex gap-2">
                                        {(['none', 'image', 'video'] as const).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setHeaderType(type)}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    background: headerType === type ? 'rgba(172, 248, 0, 0.1)' : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${headerType === type ? 'var(--primary-color)' : 'var(--surface-border)'}`,
                                                    color: headerType === type ? 'var(--primary-color)' : 'var(--text-muted)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {type === 'none' ? 'SEM' : type.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {headerType !== 'none' && (
                                    <div className="input-group animate-fade-in" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <label style={{ color: 'var(--primary-color)', fontSize: '0.7rem' }}>URL DE EXEMPLO ({headerType.toUpperCase()})</label>
                                        <div className="flex gap-2">
                                            <input
                                                className="input-field"
                                                style={{ borderRadius: '10px', opacity: 0.7, cursor: 'not-allowed' }}
                                                value={headerExampleUrl}
                                                readOnly
                                                placeholder="https://i.postimg.cc/xC34d8pf/efdb084f-a76e-45e8-8849-92c7d8c5c2c9.jpg"
                                            />
                                            {headerType === 'image' && <ImageIcon size={20} style={{ alignSelf: 'center', opacity: 0.5 }} />}
                                            {headerType === 'video' && <Video size={20} style={{ alignSelf: 'center', opacity: 0.5 }} />}
                                        </div>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.65rem', color: 'var(--text-muted)' }}>* A Meta exige uma URL válida para aprovar o template.</p>
                                    </div>
                                )}

                                <div className="input-group">
                                    <label>Corpo da Mensagem</label>
                                    <textarea className="input-field" rows={5} style={{ borderRadius: '16px', padding: '16px' }} value={bodyText} onChange={e => setBodyText(e.target.value)} placeholder="Use {{1}}, {{2}} para variáveis..." />
                                </div>

                                <div className="var-grid">
                                    {variablesExample.map((v, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 800 }}>{`VAR {{${i + 1}}}`}</span>
                                            <input className="input-field" style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem' }} value={v} onChange={e => {
                                                const newVars = [...variablesExample];
                                                newVars[i] = e.target.value;
                                                setVariablesExample(newVars);
                                            }} />
                                        </div>
                                    ))}
                                </div>

                                <div className="input-group">
                                    <label>Rodapé (Opcional)</label>
                                    <input className="input-field" style={{ borderRadius: '12px' }} value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="Sair..." />
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle size={18} color="#f87171" />
                                    <h4 style={{ margin: 0, color: '#f87171', fontWeight: 800 }}>Guia Anti-Rejeição Meta</h4>
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><b>Nomes de Teste:</b> Evite usar "test", "samwell" ou nomes genéricos. Use algo real: "venda_concluida_v1".</li>
                                    <li><b>Botões em UTILITY:</b> A Meta rejeita botões como "Clique Aqui" em categoria Utilitária. Tente usar "Ver Pedido" ou "Baixar Boleto".</li>
                                    <li><b>Categoria Marketing:</b> Se o template tiver links de site geral ou ofertas, mude a Categoria para <b>MARKETING</b>.</li>
                                    <li><b>Variáveis em Botões:</b> Iniciar ou terminar mensagens com variáveis {'{{1}}'} sem texto ao redor causa rejeição.</li>
                                </ul>
                            </div>

                            <div className="glass-card flex-col gap-6" style={{ padding: '32px', borderRadius: '24px' }}>
                                <div className="flex justify-between items-center">
                                    <h3 style={{ margin: 0, fontWeight: 900 }}>Botões Interativos</h3>
                                    <button className="btn btn-secondary" onClick={handleAddButton} style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '0.75rem' }}><Plus size={16} /> ADICIONAR</button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {buttons.map((btn, index) => (
                                        <div key={index} className="button-editor">
                                            <select className="input-field" style={{ width: '140px', padding: '8px', borderRadius: '8px' }} value={btn.type} onChange={e => handleUpdateButton(index, 'type', e.target.value as any)}>
                                                <option value="url">Link Externo</option>
                                                <option value="reply">Resposta</option>
                                            </select>
                                            <input className="input-field" style={{ padding: '8px', flex: 1, borderRadius: '8px' }} value={btn.text} onChange={e => handleUpdateButton(index, 'text', e.target.value)} placeholder="Texto" />
                                            {btn.type === 'url' && (
                                                <input className="input-field" style={{ padding: '8px', flex: 1.5, borderRadius: '8px' }} value={btn.url || ''} onChange={e => handleUpdateButton(index, 'url', e.target.value)} placeholder="https://" />
                                            )}
                                            <button onClick={() => handleRemoveButton(index)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px' }}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="btn btn-primary" onClick={handleCreateModel} disabled={isGenerating} style={{ padding: '18px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 900, color: 'black' }}>
                                {isGenerating ? <Activity className="animate-spin" /> : <><Send size={20} /> PUBLICAR NA INFOBIP</>}
                            </button>
                        </div>
                    ) : (
                        <div className="glass-card flex-col gap-8 animate-fade-in" style={{ padding: '40px', borderRadius: '24px' }}>
                            <h2 style={{ fontWeight: 900, marginBottom: 0 }}>Clone em Massa</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Crie múltiplas variações do template acima para saturar campanhas.</p>

                            <div className="flex flex-col gap-6">
                                <div className="input-group">
                                    <label>Prefixo Base</label>
                                    <input className="input-field" style={{ borderRadius: '12px', padding: '14px' }} value={bulkPrefix} onChange={e => setBulkPrefix(e.target.value)} placeholder="ex: black_friday_" />
                                </div>

                                <div className="input-group">
                                    <div className="flex justify-between items-center mb-4">
                                        <label>Quantidade Total</label>
                                        <span style={{ color: 'var(--primary-color)', fontSize: '1.8rem', fontWeight: 900 }}>{bulkQuantity}</span>
                                    </div>
                                    <input type="range" min="1" max="50" value={bulkQuantity} onChange={e => setBulkQuantity(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary-color)' }} />
                                    <div className="flex justify-between mt-2" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        <span>1 un</span>
                                        <span>50 un (MAX)</span>
                                    </div>
                                </div>

                                <button className="btn btn-primary" style={{ padding: '20px', fontSize: '1.2rem', fontWeight: 900, color: 'black', borderRadius: '20px' }} onClick={handleGenerateBulk} disabled={isGenerating}>
                                    {isGenerating ? `Subindo (${bulkQuantity})...` : 'EXECUTAR CRIAÇÃO EM MASSA'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Sticky */}
                <div className="preview-sticky">
                    <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--primary-color)', background: 'rgba(172, 248, 0, 0.02)' }}>
                        <div className="flex items-center gap-2 mb-6">
                            <Smartphone size={20} color="var(--primary-color)" />
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Preview Real</h3>
                        </div>

                        <div className="wp-bubble">
                            <div className="wp-content">
                                {headerType !== 'none' && (
                                    <div style={{ height: '140px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {headerType === 'image' ? <ImageIcon size={40} color="#9ca3af" /> : <Video size={40} color="#9ca3af" />}
                                    </div>
                                )}
                                <div style={{ padding: '14px' }}>
                                    <div style={{ color: '#e9edef', fontSize: '0.9rem', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
                                    {footerText && <div style={{ marginTop: '10px', color: '#8696a0', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>{footerText}</div>}
                                </div>
                                {buttons.length > 0 && (
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                                        {buttons.map((b, i) => (
                                            <div key={i} style={{ borderBottom: i !== buttons.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', padding: '12px', textAlign: 'center', color: '#53bdeb', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                                {b.type === 'url' ? <Link size={14} /> : <MessageSquareReply size={14} />} {b.text}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Payload Técnico API</h4>
                            <div style={{ background: '#020617', padding: '20px', borderRadius: '16px', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
                                <pre style={{ margin: 0, fontSize: '0.7rem', color: 'var(--primary-color)', opacity: 0.8, overflowX: 'auto' }}>
                                    <code>{JSON.stringify(buildInfobipPayload(), null, 2)}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateCreator;
