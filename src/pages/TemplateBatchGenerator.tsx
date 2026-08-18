import React, { useState, useEffect } from 'react';
import { 
    Layers, 
    Plus, 
    Trash2, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    Image as ImageIcon, 
    Video, 
    MousePointer2, 
    FileText, 
    RefreshCw,
    ExternalLink,
    Smartphone,
    Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';

// --- LEANDRO STANDARD CONSTANTS ---
const LEANDRO_BODY_4 = 'Olá {{1}}\n\nEstamos informando {{2}}\n\n{{3}}\n\nPara {{4}} Clique no botão abaixo!';
const LEANDRO_BODY_5 = 'Olá {{1}}, tudo bem? \n\nEstamos passando por aqui para informar que {{2}}.\n\nMais detalhes: {{3}}\n\nObservação importante: {{4}}\n\nPara {{5}}, clique no botão abaixo 👇';
const LEANDRO_EXAMPLES = [
    "Leandro", // {{1}}
    "recebemos a confirmação do pagamento referente ao protocolo nº 7164427, realizado em 12/10/2025", // {{2}}
    "O comprovante digital já se encontra disponível para conferência", // {{3}}
    "acessar o comprovante digital #54333 e verificar a entrega", // {{4}}
    "ver o comprovante digital #76632353 e verificar a entrega"   // {{5}}
];

const TemplateBatchGenerator = () => {
    const { user } = useAuth();

    // --- Luis Credentials Constants ---
    const LUIS_KEY = '35a1621fff9a97453d02b0dbe043467e-9501a6c3-3289-4fb9-90b4-d16b18b48d47';
    const LUIS_BASE = '4k3e4p.api-us.infobip.com';

    // --- Infobip Config States ---
    const [apiKey, setApiKey] = useState('');
    const [sender, setSender] = useState('');
    const [infobipUrl, setInfobipUrl] = useState('');
    const [useLuis, setUseLuis] = useState(false);

    // --- Client Selection State ---
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | number>('');

    // --- Template Form States ---
    const [baseName, setBaseName] = useState('pagamento_confirmado');
    const [category, setCategory] = useState<'UTILITY' | 'MARKETING'>('UTILITY');
    const [language, setLanguage] = useState('pt_BR');
    const [isFiveVars, setIsFiveVars] = useState(false);
    
    const [headerType, setHeaderType] = useState<'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO'>('NONE');
    const [headerText, setHeaderText] = useState('Alerta de Atualização');
    const [headerTextExample, setHeaderTextExample] = useState('João');
    const [headerMediaUrl, setHeaderMediaUrl] = useState('https://i.imgur.com/gZLbY6p.jpeg');

    const [bodyText, setBodyText] = useState(LEANDRO_BODY_4);
    const [bodyExamples, setBodyExamples] = useState<string[]>(LEANDRO_EXAMPLES.slice(0, 4));

    const [footerText, setFooterText] = useState('Digite "sair" para não receber mais mensagens');
    
    const [buttonType, setButtonType] = useState<'NONE' | 'URL' | 'QUICK_REPLY'>('URL');
    const [buttonText, setButtonText] = useState('Clique Aqui');
    const [buttonUrl, setButtonUrl] = useState('');
    const [buttonUrlExample, setButtonUrlExample] = useState('https://exemplo.com');

    const [copiesCount, setCopiesCount] = useState<number>(20);

    // --- Action/Loading States ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);

    // Load credentials & clients
    useEffect(() => {
        if (user) {
            dbService.getSettings(user.role).then(settings => {
                setApiKey(user.infobip_key || settings['infobip_key'] || '');
                setSender(user.infobip_sender || settings['infobip_sender'] || '');
                setInfobipUrl(user.infobip_url || settings['infobip_url'] || '8k6xv1.api-us.infobip.com');
            });

            if (user.role === 'ADMIN' || user.role === 'EMPLOYEE') {
                dbService.getClients().then(data => {
                    setClients(data);
                });
            } else {
                setSelectedClientId(user.id || '');
            }
        }
    }, [user]);

    // Handle isFiveVars changes to reset bodyText and examples
    useEffect(() => {
        if (isFiveVars) {
            setBodyText(LEANDRO_BODY_5);
            setBodyExamples(LEANDRO_EXAMPLES.slice(0, 5));
        } else {
            setBodyText(LEANDRO_BODY_4);
            setBodyExamples(LEANDRO_EXAMPLES.slice(0, 4));
        }
    }, [isFiveVars]);

    // Dynamic variable detection to ensure bodyExamples has enough items
    const detectBodyVariables = () => {
        const matches = bodyText.match(/\{\{\d+\}\}/g);
        if (!matches) return 0;
        const unique = new Set(matches);
        return unique.size;
    };

    const varsCount = detectBodyVariables();

    // Resize body examples array when variables count changes
    useEffect(() => {
        if (bodyExamples.length < varsCount) {
            const newEx = [...bodyExamples];
            for (let i = bodyExamples.length; i < varsCount; i++) {
                newEx.push(LEANDRO_EXAMPLES[i] || '');
            }
            setBodyExamples(newEx);
        }
    }, [varsCount]);

    // Load and refresh jobs list
    const fetchJobs = async () => {
        if (!user) return;
        setIsLoadingJobs(true);
        try {
            const data = await dbService.getTemplateBatchJobs(user.role === 'CLIENT' ? user.id : undefined);
            setJobs(data);
        } catch (error) {
            console.error("Error loading batch jobs:", error);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [user]);

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { bg: 'rgba(172, 248, 0, 0.05)', color: '#acf800', border: 'rgba(172, 248, 0, 0.2)' };
            case 'PENDING_APPROVAL':
                return { bg: 'rgba(59, 130, 246, 0.05)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' };
            case 'APPROVED_CLONING':
                return { bg: 'rgba(234, 179, 8, 0.05)', color: '#eab308', border: 'rgba(234, 179, 8, 0.2)' };
            case 'FAILED':
                return { bg: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
            default:
                return { bg: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: 'rgba(255, 255, 255, 0.1)' };
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL':
                return 'Aguardando Aprovação Meta';
            case 'APPROVED_CLONING':
                return 'Clonando Templates (20 cópias)';
            case 'COMPLETED':
                return 'Concluído';
            case 'FAILED':
                return 'Falhou';
            default:
                return status;
        }
    };

    const handleAutoGenerateRotator = async () => {
        if (!user) return;
        const cleanName = baseName.toLowerCase().replace(/[\s\-*]+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (!cleanName) {
            alert("Preencha primeiro o Nome Base do Template.");
            return;
        }

        try {
            const finalSlug = cleanName;
            // Create pro rotator (link rotator)
            const res = await dbService.createProLink({
                user_id: Number(user.id),
                title: `Rotador ${baseName}`,
                slug: finalSlug,
                targets: [{ url: 'https://plugesales.com', weight: 1 }],
                client_id: selectedClientId ? Number(selectedClientId) : null
            });

            if (res && !res.error) {
                const protocol = window.location.protocol;
                const host = window.location.host;
                const fullUrl = `${protocol}//${host}/r/${finalSlug}`;
                setButtonUrl(fullUrl);
                alert(`Rotacionador criado com sucesso: ${fullUrl}`);
            } else {
                alert(res.error || "Erro ao gerar rotacionador. O slug já pode estar em uso.");
            }
        } catch (error: any) {
            console.error("Error creating auto rotator:", error);
            alert("Erro ao criar rotacionador.");
        }
    };

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const effectiveKey = useLuis ? LUIS_KEY : apiKey;
        const effectiveBaseUrl = useLuis ? LUIS_BASE : infobipUrl;

        if (!effectiveKey.trim() || !sender.trim() || !effectiveBaseUrl.trim()) {
            setMessage({ type: 'error', text: 'Credenciais da Infobip incompletas. Por favor, verifique seu perfil ou Contas.' });
            return;
        }

        const cleanName = baseName.toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (!cleanName) {
            setMessage({ type: 'error', text: 'Nome base do template inválido.' });
            return;
        }

        const finalUserId = selectedClientId || user?.id;
        if (!finalUserId) {
            setMessage({ type: 'error', text: 'Selecione um cliente para vincular o lote.' });
            return;
        }

        // Validate examples
        for (let i = 0; i < varsCount; i++) {
            if (!bodyExamples[i] || !bodyExamples[i].trim()) {
                setMessage({ type: 'error', text: `Preencha o exemplo para a variável {{${i + 1}}}` });
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const structure: any = {
                body: {
                    text: bodyText,
                    examples: bodyExamples.slice(0, varsCount)
                }
            };

            if (headerType === 'TEXT') {
                structure.header = {
                    format: 'TEXT',
                    text: headerText,
                    examples: headerTextExample ? [headerTextExample] : undefined
                };
            } else if (headerType === 'IMAGE') {
                structure.header = {
                    format: 'IMAGE',
                    example: headerMediaUrl || undefined
                };
            } else if (headerType === 'VIDEO') {
                structure.header = {
                    format: 'VIDEO',
                    example: headerMediaUrl || undefined
                };
            }

            if (footerText.trim()) {
                structure.footer = {
                    text: footerText.trim()
                };
            }

            if (buttonType === 'URL') {
                structure.buttons = [{
                    type: 'URL',
                    text: buttonText,
                    url: buttonUrl || 'https://exemplo.com',
                    example: buttonUrl.includes('{{1}}') ? [buttonUrlExample || 'https://exemplo.com'] : undefined
                }];
            } else if (buttonType === 'QUICK_REPLY') {
                structure.buttons = [{
                    type: 'QUICK_REPLY',
                    text: buttonText
                }];
            }

            const payload = {
                user_id: finalUserId,
                base_name: cleanName,
                sender: sender.trim(),
                api_key: effectiveKey.trim(),
                base_url: effectiveBaseUrl.trim(),
                category,
                language,
                structure,
                copies_count: copiesCount
            };

            const res = await dbService.createTemplateBatchJob(payload);

            if (res.error) {
                setMessage({ type: 'error', text: res.error });
            } else {
                setMessage({ type: 'success', text: `Lote iniciado com sucesso! O template base "${cleanName}" foi enviado para aprovação.` });
                fetchJobs();
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Erro ao conectar ao servidor.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="crm-container">
            <div className="crm-header-premium">
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <Layers size={12} /> BATCH AUTOMATION
                    </div>
                    <h1 className="crm-main-title">Gerar Em Lote</h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                        Submeta 1 template base, aguarde a aprovação da Meta e gere {copiesCount} clones prontos para uso imediatamente.
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
                <div className="crm-card" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 950, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Plus size={20} color="var(--primary-color)" /> Novo Gerador em Lote
                    </h2>

                    <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* --- SENDER CONFIG & CLIENT --- */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Configuração de Credenciais</label>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setUseLuis(!useLuis)}>
                                    <div style={{ width: '32px', height: '18px', background: useLuis ? 'var(--primary-color)' : 'var(--surface-border-subtle)', borderRadius: '9px', position: 'relative', transition: 'all 0.3s' }}>
                                        <div style={{ position: 'absolute', top: '3px', left: useLuis ? '17px' : '3px', width: '12px', height: '12px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 900, color: useLuis ? 'var(--primary-color)' : 'white' }}>CREDENCIAL DO LUIS</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="field-label">Remetente Oficial (WABA)</label>
                                    <input 
                                        className="field-input" 
                                        placeholder="5511999998888" 
                                        value={sender}
                                        onChange={e => setSender(e.target.value)}
                                        required 
                                    />
                                </div>

                                {(user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') && (
                                    <div>
                                        <label className="field-label">Vincular a Cliente</label>
                                        <select 
                                            className="field-input"
                                            value={selectedClientId}
                                            onChange={e => setSelectedClientId(e.target.value)}
                                            style={{ background: 'var(--card-bg-subtle)' }}
                                            required
                                        >
                                            <option value="">Selecione um cliente...</option>
                                            {clients.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- BASIC INFOS --- */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                            <div>
                                <label className="field-label">Nome Base do Template (Sem espaços/símbolos)</label>
                                <input 
                                    className="field-input" 
                                    placeholder="Ex: promo_final_dia" 
                                    value={baseName}
                                    onChange={e => setBaseName(e.target.value.toLowerCase().replace(/[\s\-*]+/g, '_').replace(/[^a-z0-9_]/g, ''))}
                                    required 
                                />
                            </div>
                            <div>
                                <label className="field-label">Categoria</label>
                                <select 
                                    className="field-input"
                                    value={category}
                                    onChange={e => setCategory(e.target.value as any)}
                                    style={{ background: 'var(--card-bg-subtle)' }}
                                >
                                    <option value="UTILITY">Utilidade (UTILITY)</option>
                                    <option value="MARKETING">Marketing (MARKETING)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="field-label">Idioma</label>
                                    <input 
                                        className="field-input" 
                                        placeholder="pt_BR" 
                                        value={language}
                                        onChange={e => setLanguage(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setIsFiveVars(!isFiveVars)}>
                                        <div style={{ width: '32px', height: '18px', background: isFiveVars ? 'var(--primary-color)' : 'var(--surface-border-subtle)', borderRadius: '9px', position: 'relative', transition: 'all 0.3s' }}>
                                            <div style={{ position: 'absolute', top: '3px', left: isFiveVars ? '17px' : '3px', width: '12px', height: '12px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
                                        </div>
                                        <span style={{ fontSize: '11px', fontWeight: 900 }}>MODO 5 VARS</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="field-label">Quantidade de Cópias</label>
                                <input 
                                    type="number"
                                    min="1"
                                    max="50"
                                    className="field-input" 
                                    value={copiesCount}
                                    onChange={e => setCopiesCount(parseInt(e.target.value) || 20)}
                                    required 
                                />
                            </div>
                        </div>

                        {/* --- HEADER --- */}
                        <div style={{ borderTop: '1px solid var(--surface-border-subtle)', paddingTop: '20px' }}>
                            <label className="field-label">Cabeçalho (Header)</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                {['NONE', 'IMAGE', 'VIDEO'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setHeaderType(type as any)}
                                        className={`action-btn ${headerType === type ? 'primary-btn' : 'secondary-btn'}`}
                                        style={{ height: '36px', padding: '0 16px', fontSize: '11px', flex: 1 }}
                                    >
                                        {type === 'NONE' && 'Texto'}
                                        {type === 'IMAGE' && 'Imagem'}
                                        {type === 'VIDEO' && 'Vídeo'}
                                    </button>
                                ))}
                            </div>

                            {headerType === 'TEXT' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label className="field-label">Texto do Cabeçalho</label>
                                        <input 
                                            className="field-input" 
                                            placeholder="Ex: Alerta de Atualização" 
                                            value={headerText}
                                            onChange={e => setHeaderText(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">Exemplo de Variável</label>
                                        <input 
                                            className="field-input" 
                                            placeholder="Ex: João" 
                                            value={headerTextExample}
                                            onChange={e => setHeaderTextExample(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {(headerType === 'IMAGE' || headerType === 'VIDEO') && (
                                <div>
                                    <label className="field-label">URL da Mídia (Exemplo Público)</label>
                                    <input 
                                        className="field-input" 
                                        placeholder="https://exemplo.com/media.png" 
                                        value={headerMediaUrl}
                                        onChange={e => setHeaderMediaUrl(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* --- BODY & EDITABLE VARIABLES --- */}
                        <div style={{ borderTop: '1px solid var(--surface-border-subtle)', paddingTop: '20px' }}>
                            <label className="field-label">Corpo do Texto (Body)</label>
                            <textarea 
                                className="field-input" 
                                placeholder="Olá {{1}}, seu protocolo é {{2}}." 
                                value={bodyText}
                                onChange={e => setBodyText(e.target.value)}
                                rows={4}
                                required
                                style={{ fontFamily: 'inherit', resize: 'vertical', marginBottom: '16px' }}
                            />

                            {varsCount > 0 && (
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--surface-border-subtle)' }}>
                                    <label style={{ fontSize: '10px', fontWeight: 900, color: 'var(--primary-color)', display: 'block', marginBottom: '16px', letterSpacing: '0.5px' }}>
                                        EXEMPLOS DE VARIÁVEIS (EDITÁVEIS)
                                    </label>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {Array.from({ length: varsCount }).map((_, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', minWidth: '40px' }}>
                                                    {`{{${i + 1}}}`}
                                                </span>
                                                <input 
                                                    className="field-input"
                                                    style={{ height: '38px', fontSize: '13px' }}
                                                    placeholder={`Exemplo da variável {{${i + 1}}}`}
                                                    value={bodyExamples[i] || ''}
                                                    onChange={e => {
                                                        const newEx = [...bodyExamples];
                                                        newEx[i] = e.target.value;
                                                        setBodyExamples(newEx);
                                                    }}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- FOOTER & BUTTONS --- */}
                        <div style={{ borderTop: '1px solid var(--surface-border-subtle)', paddingTop: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="field-label">Rodapé (Footer)</label>
                                    <input 
                                        className="field-input" 
                                        placeholder="Digite SAIR para cancelar" 
                                        value={footerText}
                                        onChange={e => setFooterText(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="field-label">Tipo de Botão</label>
                                    <select 
                                        className="field-input"
                                        value={buttonType}
                                        onChange={e => setButtonType(e.target.value as any)}
                                        style={{ background: 'var(--card-bg-subtle)' }}
                                    >
                                        <option value="NONE">Nenhum</option>
                                        <option value="URL">Botão de Link (URL)</option>
                                        <option value="QUICK_REPLY">Resposta Rápida (Quick Reply)</option>
                                    </select>
                                </div>
                            </div>

                            {buttonType !== 'NONE' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: buttonType === 'URL' ? '1fr 1fr' : '1fr', gap: '16px' }}>
                                        <div>
                                            <label className="field-label">Texto do Botão</label>
                                            <input 
                                                className="field-input" 
                                                placeholder="Ex: Acessar Painel" 
                                                value={buttonText}
                                                onChange={e => setButtonText(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {buttonType === 'URL' && (
                                            <div>
                                                <label className="field-label">Link de Redirecionamento (URL)</label>
                                                <input 
                                                    className="field-input" 
                                                    placeholder="https://exemplo.com/{{1}}" 
                                                    value={buttonUrl}
                                                    onChange={e => setButtonUrl(e.target.value)}
                                                    required
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={handleAutoGenerateRotator}
                                                    className="action-btn"
                                                    style={{ 
                                                        marginTop: '8px', 
                                                        height: '32px', 
                                                        padding: '0 12px', 
                                                        fontSize: '11px', 
                                                        background: 'rgba(172, 248, 0, 0.05)', 
                                                        color: 'var(--primary-color)',
                                                        border: '1px solid rgba(172,248,0,0.1)'
                                                    }}
                                                >
                                                    ⚡ Gerar Link Inteligente (/r/{baseName.toLowerCase().replace(/[\s\-*]+/g, '_').replace(/[^a-z0-9_]/g, '') || 'nome_slug'})
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {buttonType === 'URL' && buttonUrl.includes('{{1}}') && (
                                        <div>
                                            <label className="field-label">Exemplo de Variável do Link</label>
                                            <input 
                                                className="field-input" 
                                                placeholder="Ex: painel" 
                                                value={buttonUrlExample}
                                                onChange={e => setButtonUrlExample(e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {message.text && (
                            <div className="animate-slide-in" style={{ 
                                padding: '16px', 
                                borderRadius: '14px', 
                                background: message.type === 'error' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(172, 248, 0, 0.05)',
                                border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(172, 248, 0, 0.2)'}`,
                                color: message.type === 'error' ? '#ef4444' : 'var(--primary-color)',
                                fontSize: '13px', 
                                fontWeight: 800, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px' 
                            }}>
                                {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                {message.text}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="action-btn primary-btn" 
                            disabled={isSubmitting} 
                            style={{ height: '54px', fontSize: '13px', letterSpacing: '0.5px' }}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> PROCESSANDO...
                                </>
                            ) : (
                                <>
                                    <Layers size={16} /> SUBMETER E GERAR EM LOTE
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="crm-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Visualização Prévia (WhatsApp)</h3>
                        
                        <div style={{ 
                            background: '#0b141a', 
                            borderRadius: '16px', 
                            padding: '16px', 
                            border: '1px solid var(--surface-border-subtle)',
                            fontFamily: 'sans-serif'
                        }}>
                            <div style={{ 
                                background: '#1f2c34', 
                                borderRadius: '12px', 
                                padding: '12px', 
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                fontSize: '14px',
                                maxWidth: '300px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                            }}>
                                {headerType === 'TEXT' && headerText && (
                                    <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                        {headerText.replace(/\{\{1\}\}/g, headerTextExample || '[Var]')}
                                    </div>
                                )}
                                {headerType === 'IMAGE' && (
                                    <div style={{ width: '100%', height: '120px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {headerMediaUrl ? (
                                            <img src={headerMediaUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                        ) : (
                                            <ImageIcon size={28} style={{ opacity: 0.3 }} />
                                        )}
                                    </div>
                                )}
                                {headerType === 'VIDEO' && (
                                    <div style={{ width: '100%', height: '120px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Video size={28} style={{ opacity: 0.3 }} />
                                    </div>
                                )}

                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                    {bodyText ? (
                                        bodyText.replace(/\{\{(\d+)\}\}/g, (match, number) => {
                                            const idx = parseInt(number) - 1;
                                            return bodyExamples[idx] ? `*${bodyExamples[idx]}*` : match;
                                        })
                                    ) : (
                                        <span style={{ opacity: 0.4 }}>Insira o texto do corpo...</span>
                                    )}
                                </div>

                                {footerText && (
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                                        {footerText}
                                    </div>
                                )}

                                {buttonType !== 'NONE' && buttonText && (
                                    <div style={{ 
                                        marginTop: '4px',
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        paddingTop: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        color: '#34b7f1',
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}>
                                        {buttonType === 'URL' ? <ExternalLink size={14} /> : <MousePointer2 size={14} />}
                                        {buttonText}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="crm-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 950, margin: 0 }}>Geradores Ativos / Histórico</h3>
                            <button 
                                onClick={fetchJobs} 
                                className="icon-button" 
                                disabled={isLoadingJobs}
                                style={{ width: '32px', height: '32px' }}
                            >
                                <RefreshCw size={14} className={isLoadingJobs ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                            {jobs.length === 0 ? (
                                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    <FileText size={24} style={{ opacity: 0.2, marginBottom: '8px' }} />
                                    Nenhum lote de template criado.
                                </div>
                            ) : (
                                jobs.map(job => {
                                    const badge = getStatusBadgeStyle(job.status);
                                    return (
                                        <div key={job.id} style={{ 
                                            background: 'rgba(255,255,255,0.01)', 
                                            border: '1px solid var(--surface-border-subtle)', 
                                            padding: '16px', 
                                            borderRadius: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontWeight: 800, fontSize: '14px' }}>{job.base_name}</div>
                                                <span 
                                                    className="status-badge-premium" 
                                                    style={{ 
                                                        '--bg': badge.bg, 
                                                        '--color': badge.color, 
                                                        '--border': badge.border,
                                                        fontSize: '10px'
                                                    } as any}
                                                >
                                                    {getStatusText(job.status)}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                <span>Remetente: <strong>{job.sender}</strong></span>
                                                <span>Cópias: <strong>{job.copies_count}</strong></span>
                                                <span>Categoria: <strong>{job.category}</strong></span>
                                            </div>

                                            {job.error_message && (
                                                <div style={{ fontSize: '11px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                                    <strong>Erro:</strong> {job.error_message}
                                                </div>
                                            )}

                                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', opacity: 0.6, textAlign: 'right' }}>
                                                Submetido em: {new Date(job.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateBatchGenerator;
