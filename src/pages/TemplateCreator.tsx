import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Smartphone, Layers, Settings2, Image as ImageIcon, Video, Link, MessageSquareReply, Plus, Activity, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';

type ButtonDef = {
    type: 'url' | 'reply';
    text: string;
    url?: string;
};

const TemplateCreator = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'MODEL' | 'BULK'>('MODEL');

    // --- API / CONFIG STATE ---
    const [apiKey, setApiKey] = useState('5b90ba4e71d2c00cdb1784f476b59c1e-a0338025-abdc-46e6-8b90-0b2b2d62d5c8');
    const [senderNumber, setSenderNumber] = useState('5511997625247');
    const [senders, setSenders] = useState<any[]>([]);
    const [isLoadingSenders, setIsLoadingSenders] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // --- CLIENT SELECTION STATE ---
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | number>('');
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', email: '', phone: '', password: '' });

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            dbService.getClients().then(setClients);
        } else {
            setSelectedClientId(user?.id || '');
        }
    }, [user]);

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await dbService.register({ ...newClientData, role: 'CLIENT' });
            if (result.error) {
                alert(result.error);
            } else {
                setClients(prev => [...prev, result.user]);
                setSelectedClientId(result.user.id);
                setIsCreatingClient(false);
                setNewClientData({ name: '', email: '', phone: '', password: '' });
                alert("Cliente criado com sucesso!");
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao criar cliente");
        }
    };

    useEffect(() => {
        dbService.getSettings().then(settings => {
            if (settings['infobip_key']) setApiKey(settings['infobip_key']);
            if (settings['infobip_sender']) setSenderNumber(settings['infobip_sender']);
        });
    }, []);

    useEffect(() => {
        if (apiKey) {
            fetchSenders();
        }
    }, [apiKey]);

    const fetchSenders = async () => {
        setIsLoadingSenders(true);
        try {
            const response = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/1/senders`, {
                headers: {
                    'Authorization': `App ${apiKey}`,
                    'Accept': 'application/json'
                }
            });
            const result = await response.json();
            if (response.ok && result.senders) {
                setSenders(result.senders);
            }
        } catch (err) {
            console.error('Error fetching senders:', err);
        } finally {
            setIsLoadingSenders(false);
        }
    };

    // --- MODEL STATE ---
    const [modelName, setModelName] = useState('pagamento_confirmado');
    const [category, setCategory] = useState('UTILITY');
    const [language, setLanguage] = useState('pt_BR');

    const [headerType, setHeaderType] = useState<'none' | 'image' | 'video'>('none');
    const [headerMediaUrl, setHeaderMediaUrl] = useState('');

    const [bodyText, _setBodyText] = useState('Oi {{1}}! Informamos que {{2}}\n\n{{3}}\n\nPara {{4}}, clique no botão abaixo 👇');
    const [footerText, _setFooterText] = useState('Digite "sair" para não receber mais mensagens');

    const defaultVars = ['Leandro', 'recebemos a confirmação do pagamento referente ao protocolo nº 7164427, realizado em 12/10/2025', 'O comprovante digital já se encontra disponível para conferência', 'acessar o comprovante digital #54333 e verificar a entrega'];
    const [variablesExample, _setVariablesExample] = useState(defaultVars);

    const [buttons, setButtons] = useState<ButtonDef[]>([
        { type: 'url', text: 'Clique Aqui', url: 'https://site.com' }
    ]);

    // --- BULK STATE ---
    const [bulkPrefix, setBulkPrefix] = useState('pagamento_');
    const [bulkRows, setBulkRows] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0, msg: '' });

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            setIsUploading(true);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (result.success) {
                setHeaderMediaUrl(result.url);
            } else {
                alert("Upload falhou: " + (result.error || "Erro desconhecido"));
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao enviar arquivo.");
        } finally {
            setIsUploading(false);
        }
    };

    const buildInfobipPayload = (name: string, overrideHeaderType?: 'none' | 'image' | 'video', mediaUrl?: string, buttonUrlOverrides?: string[], overrideHasButtons?: boolean) => {
        const varMatches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
        const varCount = varMatches.length;
        const examples = variablesExample.slice(0, varCount);
        while (examples.length < varCount) {
            examples.push("Exemplo");
        }

        const structure: any = {
            body: {
                text: bodyText
            }
        };

        if (examples.length > 0) {
            structure.body.examples = examples;
        }

        const effectiveHeaderType = overrideHeaderType || headerType;

        if (effectiveHeaderType !== 'none') {
            structure.header = {
                format: effectiveHeaderType.toUpperCase(),
                example: mediaUrl || headerMediaUrl
            };
        }

        if (footerText) {
            structure.footer = { text: footerText };
        }

        const effectiveHasButtons = overrideHasButtons !== undefined ? overrideHasButtons : (buttons.length > 0);

        if (effectiveHasButtons && buttons.length > 0) {
            structure.buttons = buttons.map((btn: any, idx: number) => {
                const bPayload: any = {
                    type: btn.type === 'url' ? 'URL' : 'QUICK_REPLY',
                    text: btn.text,
                };
                if (btn.type === 'url') {
                    // Use override if available for this specific button index
                    const finalUrl = (buttonUrlOverrides && buttonUrlOverrides[idx]) || btn.url;
                    if (finalUrl) {
                        bPayload.url = finalUrl;
                    } else {
                        // Infobip requires a URL for URL type buttons. 
                        // If empty, we fallback to a placeholder or skip? 
                        // Skipping might cause 400 elsewhere, so we use a safe fallback if possible, 
                        // but better to warn or use what's there.
                        bPayload.url = 'https://site.com'; 
                    }
                }
                return bPayload;
            });
        }

        return {
            name: name,
            language: language,
            category: category,
            structure: structure
        };
    };

    const callInfobipAPI = async (payload: any, overrideSender?: string) => {
        try {
            const effectiveSender = (overrideSender && overrideSender.trim()) || senderNumber;
            const encodedSender = encodeURIComponent(effectiveSender);
            const response = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/2/senders/${encodedSender}/templates`, {
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
                console.error('Infobip API Error Full Response:', result);
                const apiError = result.requestError?.serviceException?.text ||
                    result.requestError?.serviceException?.message ||
                    (result.requestError?.serviceException?.validationErrors ? JSON.stringify(result.requestError.serviceException.validationErrors) : null) ||
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
        variablesExample.forEach((val: any, index: number) => {
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
        setButtons(buttons.filter((_: any, i: number) => i !== index));
    };

    const handleCreateModel = async () => {
        if (!modelName) return alert("Defina um nome para o template.");
        if (!selectedClientId) return alert("Selecione ou cadastre um cliente primeiro na Estrutura Básica.");
        
        const sanitizedName = modelName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (sanitizedName !== modelName) {
            setModelName(sanitizedName);
        }
        
        setIsGenerating(true);
        setGeneratingProgress({ current: 1, total: 1, msg: `Criando template "${sanitizedName}"...` });

        const payload = buildInfobipPayload(sanitizedName);
        const res = await callInfobipAPI(payload);

        setIsGenerating(false);

        if (res.success) {
            // Track in DB
            dbService.addLog({
                logType: 'TEMPLATE',
                name: modelName,
                author: user?.name,
                mode: 'SINGLE'
            });

            // Send to Webhook
            await sendToWebhook(payload);

            // Create Client Submission
            const client = clients.find(c => String(c.id) === String(selectedClientId));
            await dbService.addClientSubmission({
                user_id: selectedClientId,
                client_name: client?.name || '',
                profile_name: modelName,
                ddd: client?.phone?.substring(0, 2) || '11', 
                template_type: headerType,
                media_url: headerType !== 'none' ? headerMediaUrl : '',
                ad_copy: bodyText,
                button_link: buttons.find(b => b.type === 'url')?.url || '',
                spreadsheet_url: '',
                status: 'GERADO',
                submitted_by: user?.name,
                timestamp: new Date().toISOString(),
                ads: [{
                    ad_name: modelName,
                    template_type: headerType,
                    message_mode: 'manual',
                    media_url: headerType !== 'none' ? headerMediaUrl : '',
                    ad_copy: bodyText,
                    button_link: buttons.find(b => b.type === 'url')?.url || '',
                    variables: variablesExample,
                    delivered_leads: 0,
                    price_per_msg: 0.04
                }]
            });

            alert(`✅ Template "${modelName}" criado com sucesso!`);
            navigate('/accounts');
        }
        else alert(`❌ Erro: ${res.error}`);
    };

    const handleGenerateBulk = async () => {
        if (bulkRows.length === 0) return alert("Adicione pelo menos uma linha no gerador.");
        if (!selectedClientId) return alert("Selecione ou cadastre um cliente primeiro na Estrutura Básica.");
        const confirmBulk = window.confirm(`Isso irá disparar ${bulkRows.length} chamadas de API. Continuar?`);
        if (!confirmBulk) return;

        setIsGenerating(true);
        let successCount = 0;
        let errors = [];
        const generatedAds = [];

        for (let i = 0; i < bulkRows.length; i++) {
            const row = bulkRows[i];
            const name = `${bulkPrefix}${row.suffix}`;
            setGeneratingProgress({ current: i + 1, total: bulkRows.length, msg: `Processando ${name}...` });

            const payload = buildInfobipPayload(name, row.headerType, row.mediaUrl, row.buttonUrls, row.hasButtons);

            // Inject sender into payload for tracking/webhooks
            const rowSender = row.sender && row.sender.trim() ? row.sender : senderNumber;
            const extendedPayload = { ...payload, sender: rowSender };

            console.log(`[BULK] Creating template "${name}" on sender "${rowSender}"...`, extendedPayload);

            const res = await callInfobipAPI(payload, rowSender);
            if (res.success) {
                successCount++;
                dbService.addLog({
                    logType: 'TEMPLATE',
                    name: name,
                    author: user?.name,
                    mode: 'BULK'
                });
                await sendToWebhook(extendedPayload);

                // Collect for Client Submission
                generatedAds.push({
                    ad_name: name,
                    template_type: row.headerType,
                    message_mode: 'manual',
                    media_url: row.headerType !== 'none' ? row.mediaUrl : '',
                    ad_copy: bodyText,
                    button_link: row.buttonUrls?.[0] || '',
                    variables: variablesExample,
                    delivered_leads: 0,
                    price_per_msg: 0.04
                });
            }
            else {
                errors.push(`${name}: ${res.error}`);
                // LOG ERROR TO BACKEND
                await fetch('/api/logs/template-error', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        error: res.error,
                        author: user?.name
                    })
                }).catch(e => console.error('Failed to log error to backend:', e));
            }

            // Safety Delay: 2.5 seconds for Meta/Infobip stability
            if (i < bulkRows.length - 1) {
                await new Promise(r => setTimeout(r, 2500));
            }
        }

        if (generatedAds.length > 0) {
            const client = clients.find(c => String(c.id) === String(selectedClientId));
            await dbService.addClientSubmission({
                user_id: selectedClientId,
                client_name: client?.name || '',
                profile_name: `Lote: ${bulkPrefix}*`,
                ddd: client?.phone?.substring(0, 2) || '11', 
                template_type: 'none',
                media_url: '',
                ad_copy: bodyText,
                button_link: '',
                spreadsheet_url: '',
                status: 'GERADO',
                submitted_by: user?.name,
                timestamp: new Date().toISOString(),
                ads: generatedAds
            });
        }

        setIsGenerating(false);
        alert(`Finalizado!\nSucesso: ${successCount}\nErros: ${errors.length}`);
        if (successCount > 0) navigate('/client-submissions'); // Redirecionando para as submissões ao invés de /accounts para que o admin veja o card
    };

    const autoGenerateRows = (qty: number) => {
        const urlButtons = buttons.filter(b => b.type === 'url');
        const startIdx = bulkRows.length + 1;
        const newRows = [];
        for (let i = 0; i < qty; i++) {
            const currentNum = startIdx + i;
            newRows.push({
                suffix: String(currentNum).padStart(3, '0'),
                sender: senderNumber, // Default to current global sender
                headerType: headerType,
                mediaUrl: headerType !== 'none' ? headerMediaUrl : '',
                hasButtons: buttons.length > 0,
                buttonUrls: urlButtons.map(b => b.url || '')
            });
        }
        setBulkRows([...bulkRows, ...newRows]);
    };

    const applyGlobalSender = (sender: string) => {
        setBulkRows(prev => prev.map(r => ({ ...r, sender })));
    };

    const applyGlobalHeaderType = (type: 'none' | 'image' | 'video') => {
        setBulkRows(bulkRows.map(row => ({
            ...row,
            headerType: type,
            mediaUrl: type !== 'none' ? (row.mediaUrl || headerMediaUrl) : ''
        })));
    };

    const applyGlobalButtons = (hasButtons: boolean) => {
        setBulkRows(prev => prev.map(r => ({ ...r, hasButtons })));
    };

    const duplicateRow = (index: number) => {
        const qtyStr = window.prompt("Quantas cópias deseja criar?", "1");
        const qty = parseInt(qtyStr || "0");
        if (isNaN(qty) || qty <= 0) return;

        const sourceRow = bulkRows[index];
        const newRows: any[] = [];

        // Helper to find and increment the numeric part of a string
        const incrementSuffix = (base: string, count: number) => {
            const match = base.match(/(\d+)$/);
            if (match) {
                const numStr = match[1];
                const prefixStr = base.slice(0, -numStr.length);
                const nextNum = parseInt(numStr) + count;
                // Preserve leading zeros if any
                return prefixStr + nextNum.toString().padStart(numStr.length, '0');
            } else {
                return `${base}_${count}`;
            }
        };

        for (let i = 1; i <= qty; i++) {
            newRows.push({
                ...sourceRow,
                suffix: incrementSuffix(sourceRow.suffix, i),
                buttonUrls: [...sourceRow.buttonUrls] // deep copy array
            });
        }

        setBulkRows(prev => [
            ...prev.slice(0, index + 1),
            ...newRows,
            ...prev.slice(index + 1)
        ]);
    };

    return (
        <div className="animate-fade-in creator-page" style={{ paddingBottom: '80px' }}>
            {isGenerating && (
                <div className="loading-overlay">
                    <div className="pulse-loader">
                        <Activity size={40} className="animate-spin" />
                    </div>
                    <div className="flex-col items-center gap-1 animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="loading-text" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px', textAlign: 'center' }}>
                            {generatingProgress.total > 1
                                ? "CRIANDO TEMPLATES EM MASSA"
                                : "PUBLICANDO NA INFOBIP"}
                        </div>
                        <div className="loading-subtext" style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: 500 }}>
                            {generatingProgress.total > 1
                                ? `${generatingProgress.current} de ${generatingProgress.total} - ${generatingProgress.msg}`
                                : "Aguarde a validação da Meta..."}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                * { box-sizing: border-box !important; }
                .creator-page { overflow-x: hidden !important; width: 100% !important; max-width: 100vw !important; }
                h1 { font-size: clamp(1.4rem, 6vw, 2.4rem) !important; }
                h2 { font-size: clamp(1.1rem, 5vw, 1.6rem) !important; }
                h3 { font-size: clamp(0.95rem, 4.5vw, 1.2rem) !important; }
                .creator-layout { display: grid; grid-template-columns: 1fr 420px; gap: 48px; align-items: start; }
                .config-bar { 
                    background: rgba(172, 248, 0, 0.03); 
                    border: 1px solid rgba(172, 248, 0, 0.1); 
                    border-radius: 24px; 
                    padding: 24px 32px; 
                    display: flex; 
                    align-items: center;
                    justify-content: space-between;
                    backdrop-filter: blur(16px);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.4);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .glass-card:hover {
                    border-color: rgba(172, 248, 0, 0.15);
                    transform: translateY(-2px);
                }
                .tab-btns { display: flex; gap: 12px; margin-bottom: 32px; }
                .tab-btns .btn { flex: 1; border-radius: 14px; height: 54px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 800; transition: all 0.2s; }
                .var-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
                .button-editor { 
                    background: rgba(255,255,255,0.02); 
                    padding: 16px; 
                    border: 1px solid rgba(255,255,255,0.06); 
                    border-radius: 14px; 
                    display: flex; 
                    gap: 12px; 
                    align-items: center; 
                    flex-wrap: wrap;
                }
                .preview-sticky { position: sticky; top: 32px; }
                .wp-bubble { 
                    background: #0b141a; 
                    border-radius: 20px; 
                    padding: 12px; 
                    border: 1px solid #1f2c34; 
                    max-width: 100%; 
                    margin: 0 auto; 
                    box-shadow: 0 15px 60px rgba(0,0,0,0.8); 
                }
                .sender-display {
                    background: rgba(172, 248, 0, 0.08);
                    border: 1px solid rgba(172, 248, 0, 0.3);
                    border-radius: 16px;
                    padding: 10px 18px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    min-width: 280px;
                }
                .sender-input {
                    background: transparent;
                    border: none;
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: var(--primary-color);
                    letter-spacing: 0.5px;
                    width: 100%;
                    outline: none;
                }
                
                @media (max-width: 1280px) {
                    .creator-layout { grid-template-columns: 1fr; gap: 40px; }
                    .preview-sticky { position: static; margin-top: 32px; }
                }
                @media (max-width: 768px) {
                    .creator-layout { grid-template-columns: 1fr !important; gap: 16px !important; width: 100% !important; margin: 0 !important; }
                    .config-bar { flex-direction: column !important; padding: 12px !important; gap: 12px !important; align-items: stretch !important; width: 100% !important; border-radius: 16px !important; }
                    .header-grid { grid-template-columns: 1fr !important; gap: 10px !important; width: 100% !important; }
                    .header-grid > * { min-width: 0 !important; }
                    .tab-btns { display: flex !important; flex-direction: column !important; gap: 8px !important; width: 100% !important; margin-bottom: 20px !important; }
                    .tab-btns .btn { 
                        padding: 8px !important; 
                        height: auto !important; 
                        min-height: 40px !important;
                        font-size: 0.72rem !important; 
                        flex-direction: row !important; 
                        justify-content: center !important;
                        gap: 8px !important;
                        width: 100% !important;
                    }
                    .tab-btns .btn svg { width: 14px !important; height: 14px !important; }
                    .sender-display { width: 100% !important; min-width: 0 !important; padding: 8px !important; flex-wrap: wrap !important; gap: 8px !important; }
                    .sender-input { font-size: 0.8rem !important; width: 100% !important; min-width: 0 !important; }
                    .glass-card { padding: 12px !important; border-radius: 12px !important; width: 100% !important; max-width: 100% !important; overflow: hidden !important; border-width: 1px !important; }
                    .button-editor { flex-direction: column !important; align-items: stretch !important; padding: 10px !important; gap: 8px !important; }
                    .bulk-table-container { padding: 2px !important; border-radius: 6px !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; width: 100% !important; border: 1px solid rgba(255,255,255,0.1) !important; }
                    .bulk-table { min-width: 550px !important; }
                    .bulk-table th { font-size: 0.5rem !important; padding: 6px 3px !important; }
                    .bulk-table td { padding: 4px !important; }
                    .bulk-row input, .bulk-row select { font-size: 0.65rem !important; height: 30px !important; padding: 4px 6px !important; }
                    .wp-bubble { padding: 8px !important; border-radius: 14px !important; }
                    .preview-sticky { margin-top: 16px !important; }
                    .bulk-form-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
                    .glass-card { padding: 20px !important; }
                }
                @media (max-width: 480px) {
                    .tab-btns { flex-direction: column; }
                    .var-grid { grid-template-columns: 1fr; }
                    .config-bar h3 { font-size: 1rem !important; }
                    .sender-display { gap: 8px; }
                }

                .loading-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(2, 6, 23, 0.85);
                    backdrop-filter: blur(12px);
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 32px;
                    color: white;
                }
                .pulse-loader {
                    width: 100px;
                    height: 100px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: black;
                    box-shadow: 0 0 60px rgba(172, 248, 0, 0.5);
                    animation: pulse-ring 2s infinite ease-in-out;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(172, 248, 0, 0.5); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 30px rgba(172, 248, 0, 0); }
                    100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(172, 248, 0, 0); }
                }

                .bulk-table-container {
                    max-height: 450px; 
                    overflow-y: auto; 
                    border: 1px solid rgba(255,255,255,0.08); 
                    border-radius: 20px; 
                    padding: 8px; 
                    background: rgba(0,0,0,0.3);
                }
                .bulk-table th {
                    padding: 16px;
                    background: rgba(0,0,0,0.2);
                    color: var(--primary-color);
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .bulk-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }
                .bulk-row:hover {
                    background: rgba(172, 248, 0, 0.02);
                }
            `}</style>

            <div className="p-4 md:p-8 creator-page min-h-screen">
                <div className="flex flex-col mb-4">
                    <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.4rem, 6vw, 2.4rem)', letterSpacing: '-1.5px', lineHeight: 1 }}>Templates WhatsApp</h1>
                    <p className="subtitle" style={{ fontSize: 'clamp(0.75rem, 3.5vw, 1rem)', opacity: 0.6 }}>Criação oficial via Infobip Cloud</p>
                </div>

                {/* API Settings Bar Redesigned */}
                <div className="config-bar mb-10 animate-fade-in shadow-xl mb-4">
                    <div className="flex flex-col">
                        <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.2rem' }}>Configuração do Canal</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>A chave da API está ativa e oculta por segurança.</p>
                    </div>

                    <div className="sender-display shadow-lg group relative">
                        <Smartphone size={24} color={isLoadingSenders ? "#9ca3af" : "var(--primary-color)"} className={isLoadingSenders ? "animate-pulse" : ""} />
                        <div className="flex flex-col flex-1">
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.7, color: 'var(--primary-color)', textTransform: 'uppercase' }}>Remetente Oficial</span>
                            <input
                                list="senders-list"
                                className="sender-input"
                                value={senderNumber}
                                onChange={e => {
                                    setSenderNumber(e.target.value);
                                    dbService.saveSetting('infobip_sender', e.target.value);
                                }}
                                placeholder="Escolha ou Digite..."
                            />
                            <datalist id="senders-list">
                                {senders.map((s: any) => (
                                    <option key={s.sender} value={s.sender}>{s.senderName || s.sender}</option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                </div>

                <div className="creator-layout mt-4">
                    {/* Form Column */}
                    <div className="flex-col gap-8 ">
                        <div className="tab-btns">
                            <button className={`btn ${activeTab === 'MODEL' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('MODEL')}>
                                <Layers size={18} /> GERAR INDIVIDUALMENTE
                            </button>
                            <button className={`btn ${activeTab === 'BULK' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('BULK')}>
                                <Settings2 size={18} /> GERAR EM MASSA
                            </button>
                        </div>

                        {activeTab === 'MODEL' ? (
                            <div className="flex flex-col gap-6 animate-fade-in">
                                <div className="glass-card flex-col gap-8 shadow-2xl">
                                    <div className="flex items-center gap-4">
                                        <div style={{ background: 'rgba(172, 248, 0, 0.1)', padding: '12px', borderRadius: '16px' }}>
                                            <Settings2 size={28} color="var(--primary-color)" />
                                        </div>
                                        <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>Estrutura Básica</h3>
                                    </div>

                                    {/* CLIENT SELECTION */}
                                    {user?.role === 'ADMIN' && (
                                        <div className="space-y-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>VINCULAR A UM CLIENTE</h4>
                                            </div>
                                            {!isCreatingClient ? (
                                                <div className="flex flex-col gap-3">
                                                    <select
                                                        className="input-field"
                                                        style={{ borderRadius: '12px', padding: '14px' }}
                                                        value={selectedClientId || ''}
                                                        onChange={e => setSelectedClientId(e.target.value)}
                                                    >
                                                        <option value="">-- SELECIONAR CLIENTE --</option>
                                                        {clients.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                                                        ))}
                                                    </select>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase' }}>OU</span>
                                                        <button 
                                                            onClick={() => setIsCreatingClient(true)}
                                                            className="text-[11px] font-black uppercase tracking-wider hover:underline"
                                                            style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0 }}
                                                        >
                                                            + CADASTRAR NOVO CLIENTE
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleCreateClient} className="flex flex-col gap-4 animate-fade-in">
                                                    <div className="flex gap-4">
                                                        <input required className="input-field" style={{ flex: 1.5, borderRadius: '10px', padding: '10px' }} placeholder="Nome do Cliente" value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} />
                                                        <input required className="input-field" style={{ flex: 1, borderRadius: '10px', padding: '10px' }} placeholder="Telefone (com DDD)" value={newClientData.phone} onChange={e => setNewClientData({...newClientData, phone: e.target.value})} />
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <input required type="email" className="input-field" style={{ flex: 1.5, borderRadius: '10px', padding: '10px' }} placeholder="Email de Login" value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})} />
                                                        <input required type="password" className="input-field" style={{ flex: 1, borderRadius: '10px', padding: '10px' }} placeholder="Senha Inicial" value={newClientData.password} onChange={e => setNewClientData({...newClientData, password: e.target.value})} />
                                                    </div>
                                                    <div className="flex gap-3 mt-2">
                                                        <button type="submit" className="btn btn-primary" style={{ flex: 1, color: 'black', borderRadius: '10px', padding: '10px', fontSize: '12px' }}>SALVAR CLIENTE</button>
                                                        <button type="button" onClick={() => setIsCreatingClient(false)} className="btn btn-secondary" style={{ flex: 1, borderRadius: '10px', padding: '10px', fontSize: '12px' }}>CANCELAR</button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    )}

                                    <div className="header-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '20px' }}>
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
                                        <div className="flex-col gap-3 mt-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase' }}>Mídia do Cabeçalho ({headerType === 'image' ? 'Imagem' : 'Vídeo'})</h4>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                {headerMediaUrl ? (
                                                    <div className="relative group w-32 h-32 rounded-xl overflow-hidden border-2 border-primary/30">
                                                        {headerType === 'image' ? (
                                                            <img src={headerMediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div className="w-full h-full bg-black flex items-center justify-center">
                                                                <Video size={32} className="text-primary" />
                                                            </div>
                                                        )}
                                                        <div 
                                                            onClick={() => setHeaderMediaUrl('')}
                                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                                                        >
                                                            <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div 
                                                        className="flex-1 border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer bg-white/[0.02]"
                                                        onClick={() => document.getElementById('header-upload')?.click()}
                                                    >
                                                        {isUploading ? (
                                                            <Activity className="animate-spin text-primary mx-auto" size={32} />
                                                        ) : (
                                                            <>
                                                                <ImageIcon size={32} className="opacity-20 mx-auto mb-2" />
                                                                <p style={{ fontSize: '11px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase' }}>Clique para enviar {headerType === 'image' ? 'Imagem' : 'Vídeo'}</p>
                                                            </>
                                                        )}
                                                        <input 
                                                            id="header-upload" 
                                                            type="file" 
                                                            hidden 
                                                            accept={headerType === 'image' ? 'image/*' : 'video/*'} 
                                                            onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
                                                        />
                                                    </div>
                                                )}
                                                
                                                {headerMediaUrl && (
                                                    <div className="flex-1">
                                                        <p style={{ fontSize: '10px', fontWeight: 700, opacity: 0.5, marginBottom: '4px' }}>Arquivo carregado no servidor:</p>
                                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 font-mono text-[10px] truncate">
                                                            {headerMediaUrl}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="input-group" style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)' }}>CONTEÚDO PADRÃO ATIVO</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Corpo da mensagem e variáveis serão enviados automaticamente.</span>
                                            </div>
                                            <div className="badge badge-success" style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', fontSize: '0.65rem' }}>Otimizado</div>
                                        </div>
                                    </div>
                                </div>


                                <div className="glass-card flex-col gap-6" style={{ padding: '32px', borderRadius: '24px' }}>
                                    <div className="flex justify-between items-center">
                                        <h3 style={{ margin: 0, fontWeight: 900 }}>Botões Interativos</h3>
                                        <button className="btn btn-secondary" onClick={handleAddButton} style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '0.75rem' }}><Plus size={16} /> ADICIONAR</button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {buttons.map((btn: any, index: number) => (
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
                                    {isGenerating ? <Activity className="animate-spin" /> : <><Send size={20} /> CRIAR TEMPLATE</>}
                                </button>
                            </div>
                        ) : (
                            <div className="glass-card flex-1 relative overflow-hidden animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 style={{ fontWeight: 900, marginBottom: '4px' }}>Gerador Bulk High-Speed</h2>

                                    </div>
                                    <button className="btn btn-secondary" onClick={() => setBulkRows([])} style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem' }}>LIMPAR TUDO</button>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="bulk-form-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '20px' }}>
                                        <div className="input-group">
                                            <label>Prefixo Base</label>
                                            <input className="input-field" style={{ borderRadius: '12px' }} value={bulkPrefix} onChange={e => setBulkPrefix(e.target.value.toLowerCase())} placeholder="ex: v1_" />
                                        </div>
                                        <div className="input-group">
                                            <label>Adicionar à Fila</label>
                                            <div className="flex gap-2">
                                                <input type="number" className="input-field" style={{ borderRadius: '12px', width: '80px' }} defaultValue={5} id="bulk_qty" />
                                                <button className="btn btn-primary" style={{ flex: 1, borderRadius: '12px', color: 'black' }} onClick={() => {
                                                    const qty = Number((document.getElementById('bulk_qty') as HTMLInputElement)?.value || 0);
                                                    autoGenerateRows(qty);
                                                }}>+ ADICIONAR LINHAS</button>
                                            </div>
                                        </div>
                                    </div>

                                    {bulkRows.length > 0 && (
                                        <div className="animate-fade-in p-5 rounded-2xl border border-primary-color/20 bg-primary-color/5 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex flex-col">
                                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-color)', textTransform: 'uppercase' }}>Editar Todos ({bulkRows.length})</span>
                                                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Aplica a mudança em todas as linhas da fila abaixo</span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 items-center">
                                                <div className="flex flex-col gap-1">
                                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>Mídia Geral</span>
                                                    <div className="flex bg-black/20 p-1 rounded-lg">
                                                        {(['none', 'image', 'video'] as const).map(t => (
                                                            <button key={t} onClick={() => applyGlobalHeaderType(t)} className="px-2 py-1 text-[10px] font-bold rounded-md hover:text-white transition-colors uppercase" style={{ color: 'var(--text-muted)' }}>{t === 'none' ? 'SEM' : t}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>Botões Geral</span>
                                                    <div className="flex bg-black/20 p-1 rounded-lg">
                                                        <button onClick={() => applyGlobalButtons(true)} className="px-3 py-1 text-[10px] font-bold rounded-md hover:text-white transition-colors uppercase" style={{ color: 'var(--text-muted)' }}>COM</button>
                                                        <button onClick={() => applyGlobalButtons(false)} className="px-3 py-1 text-[10px] font-bold rounded-md hover:text-white transition-colors uppercase" style={{ color: 'var(--text-muted)' }}>SEM</button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>Sender Geral</span>
                                                    <div className="flex bg-black/20 p-1 rounded-lg">
                                                        <input
                                                            list="senders-list-global"
                                                            onChange={(e) => applyGlobalSender(e.target.value)}
                                                            className="px-2 py-1 text-[10px] font-bold rounded-md bg-transparent border-none outline-none uppercase"
                                                            style={{ color: 'var(--text-muted)', cursor: 'pointer', width: '100px' }}
                                                            placeholder="MUDAR TODOS"
                                                        />
                                                        <datalist id="senders-list-global">
                                                            {senders.map((s: any) => (
                                                                <option key={s.sender} value={s.sender}>{s.senderName || s.sender}</option>
                                                            ))}
                                                        </datalist>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {bulkRows.length > 0 && (
                                        <div className="flex flex-col gap-6">
                                            <div className="bulk-table-container shadow-inner">
                                                <table className="bulk-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Sufixo</th>
                                                            <th>Sender (BM)</th>
                                                            <th>Tipo Mídia</th>
                                                            {buttons.length > 0 && <th>Botões</th>}
                                                            {buttons.filter(b => b.type === 'url').map((_, urlIdx) => (
                                                                <th key={urlIdx}>Link {urlIdx + 1}</th>
                                                            ))}
                                                            <th style={{ width: '40px' }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {bulkRows.map((row, i) => (
                                                            <tr key={i} className="bulk-row">
                                                                <td>
                                                                    <input className="input-field" style={{ padding: '8px', borderRadius: '10px', fontSize: '0.85rem' }} value={row.suffix} onChange={e => {
                                                                        const n = [...bulkRows];
                                                                        n[i].suffix = e.target.value.toLowerCase().replace(/\s/g, '_');
                                                                        setBulkRows(n);
                                                                    }} />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        list="senders-list-row"
                                                                        className="input-field"
                                                                        style={{ padding: '8px', borderRadius: '10px', fontSize: '0.81rem', fontWeight: 700 }}
                                                                        value={row.sender || ''}
                                                                        placeholder={senderNumber}
                                                                        onChange={e => {
                                                                            const n = [...bulkRows];
                                                                            n[i].sender = e.target.value;
                                                                            setBulkRows(n);
                                                                        }}
                                                                    />
                                                                    <datalist id="senders-list-row">
                                                                        {senders.map((s: any) => (
                                                                            <option key={s.sender} value={s.sender}>{s.senderName || s.sender}</option>
                                                                        ))}
                                                                    </datalist>
                                                                </td>
                                                                <td>
                                                                    <select className="input-field" style={{ padding: '8px', borderRadius: '10px', fontSize: '0.85rem' }} value={row.headerType} onChange={e => {
                                                                        const n = [...bulkRows];
                                                                        n[i].headerType = e.target.value;
                                                                        if (e.target.value === 'none') n[i].mediaUrl = '';
                                                                        else if (!n[i].mediaUrl) n[i].mediaUrl = headerMediaUrl;
                                                                        setBulkRows(n);
                                                                    }}>
                                                                        <option value="none">SEM</option>
                                                                        <option value="image">IMAGE</option>
                                                                        <option value="video">VIDEO</option>
                                                                    </select>
                                                                </td>
                                                                {buttons.length > 0 && (
                                                                    <td>
                                                                        <select className="input-field" style={{ padding: '8px', borderRadius: '10px', fontSize: '0.85rem' }} value={row.hasButtons !== false ? 'yes' : 'no'} onChange={e => {
                                                                            const n = [...bulkRows];
                                                                            n[i].hasButtons = e.target.value === 'yes';
                                                                            setBulkRows(n);
                                                                        }}>
                                                                            <option value="yes">COM</option>
                                                                            <option value="no">SEM</option>
                                                                        </select>
                                                                    </td>
                                                                )}
                                                                {buttons.filter(b => b.type === 'url').map((_, urlIdx) => (
                                                                    <td key={urlIdx}>
                                                                        <input className="input-field" disabled={row.hasButtons === false} style={{ padding: '8px', borderRadius: '10px', fontSize: '0.85rem', opacity: row.hasButtons === false ? 0.3 : 1 }} value={row.buttonUrls[urlIdx]} onChange={e => {
                                                                            const n = [...bulkRows];
                                                                            n[i].buttonUrls[urlIdx] = e.target.value;
                                                                            setBulkRows(n);
                                                                        }} />
                                                                    </td>
                                                                ))}
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <div className="flex gap-2 justify-center">
                                                                        <button onClick={() => duplicateRow(i)} title="Duplicar esta linha" style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '1rem', opacity: 0.7 }}>
                                                                            <Copy size={16} />
                                                                        </button>
                                                                        <button onClick={() => setBulkRows(bulkRows.filter((_, idx) => idx !== i))} title="Excluir" style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <button className="btn btn-primary shadow-lg mt-4 w-full" style={{ minHeight: '60px', fontSize: '1.1rem', fontWeight: 900, color: 'black', borderRadius: '20px', textTransform: 'uppercase' }} onClick={handleGenerateBulk} disabled={isGenerating}>
                                                {isGenerating ? `Publicando ${generatingProgress.current}/${generatingProgress.total}...` : 'CRIAR TEMPLATE EM MASSA'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Sticky */}
                    <div className="preview-sticky">
                        <div className="glass-card" style={{ border: '1px solid var(--primary-color)', background: 'rgba(172, 248, 0, 0.02)' }}>
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
                                            {buttons.map((b: any, i: number) => (
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
                                <div style={{ background: '#020617', padding: '12px', borderRadius: '16px', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
                                    <pre style={{ margin: 0, fontSize: '0.65rem', color: 'var(--primary-color)', opacity: 0.8, overflowX: 'auto' }}>
                                        <code>{JSON.stringify(buildInfobipPayload(modelName), null, 2)}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateCreator;
