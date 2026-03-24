import { useState, useEffect, Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Smartphone, Layers, Settings2, Image as ImageIcon, Video, Link, MessageSquareReply, Plus, Activity, Copy, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';

type ButtonDef = {
    type: 'url' | 'reply';
    text: string;
    url?: string;
};

type BulkRow = {
    suffix: string;
    sender: string;
    headerType: 'none' | 'image' | 'video';
    mediaUrl: string;
    hasButtons: boolean;
    buttonUrl?: string;
    buttonUrls: string[];
    buttonTexts: string[];
};

const TemplateCreator = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Added useLocation hook
    const [activeTab, setActiveTab] = useState<'MODEL' | 'BULK'>('MODEL');

    // --- API / CONFIG STATE ---
    const [apiKey, setApiKey] = useState(user?.infobip_key || '');
    const [senderNumbers, setSenderNumbers] = useState(user?.infobip_sender || '');
    const [isUploading, setIsUploading] = useState(false);

    // --- CLIENT SELECTION STATE ---
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | number>('');
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', email: '', phone: '', password: '' });

    useEffect(() => {
        console.log('DEBUG: Current User:', user);
        if (user?.role === 'ADMIN') {
            dbService.getClients().then(data => {
                console.log('DEBUG: Fetched Clients:', data);
                setClients(data);
            });
        } else {
            console.log('DEBUG: User is not ADMIN, setting id:', user?.id);
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
        // Prioritize values from location state if available
        if (location.state?.key) {
            setApiKey(location.state.key);
        } else if (user?.infobip_key) {
            setApiKey(user.infobip_key);
        }

        if (location.state?.sender) {
            setSenderNumbers(location.state.sender);
        } else if (user?.infobip_sender) {
            setSenderNumbers(user.infobip_sender);
        }

        if (location.state?.preFillData) {
            const data = location.state.preFillData;
            if (data.templateName) setModelName(data.templateName);
            if (data.senderNumber) setSenderNumbers(data.senderNumber);
            if (data.rows && data.rows.length > 0) {
                // Ensure rows are initialized with correct types if pre-filled
                const initializedRows = data.rows.map((row: any) => ({
                    ...row,
                    headerType: row.headerType || data.templateType || 'none',
                    buttonUrls: row.buttonUrls || (row.buttonUrl ? [row.buttonUrl] : []),
                    buttonTexts: row.buttonTexts || (row.buttonUrl ? ['Clique Aqui'] : [])
                }));
                setBulkRows(initializedRows);
                
                // Also set initial media and button from first row if available
                if (initializedRows[0].mediaUrl) setHeaderMediaUrl(initializedRows[0].mediaUrl);
                if (initializedRows[0].buttonUrl) {
                    setButtons([{ type: 'url', text: 'Clique Aqui', url: initializedRows[0].buttonUrl }]);
                }
                // Pre-fill variable examples with Leandro, Plug Sales, etc as requested
                _setVariablesExample([
                    initializedRows[0].var1 || 'Leandro',
                    initializedRows[0].var2 || 'recebemos a confirmação do pagamento referente ao protocolo nº 7164427, realizado em 12/10/2025',
                    initializedRows[0].var3 || 'O comprovante digital já se encontra disponível para conferência',
                    initializedRows[0].var4 || 'acessar o comprovante digital #54333 e verificar a entrega'
                ]);
            }
        }
    }, [location.state, user]); // Depend on location.state and user to re-run if navigation state or user profile changes

    // Reverted: removed fetchSenders logic as requested

    // --- MODEL STATE ---
    const [modelName, setModelName] = useState('pagamento_confirmado');
    const [language, setLanguage] = useState('pt_BR');

    const [headerType, setHeaderType] = useState<'none' | 'image' | 'video'>('none');
    const [headerMediaUrl, setHeaderMediaUrl] = useState('https://iili.io/qv5OXja.jpg');

    const [bodyText, _setBodyText] = useState('Oi {{1}}! Informamos que {{2}}\n\n{{3}}\n\nPara {{4}}, clique no botão abaixo 👇');
    const [footerText, _setFooterText] = useState('Digite "sair" para não receber mais mensagens');

    const defaultVars = ['Leandro', 'recebemos a confirmação do pagamento referente ao protocolo nº 7164427, realizado em 12/10/2025', 'O comprovante digital já se encontra disponível para conferência', 'acessar o comprovante digital #54333 e verificar a entrega'];
    const [variablesExample, _setVariablesExample] = useState(defaultVars);

    const [buttons, setButtons] = useState<ButtonDef[]>([
        { type: 'url', text: 'Clique Aqui', url: 'https://site.com' }
    ]);

    const [copyCount, setCopyCount] = useState(1);

    // --- BULK STATE ---
    const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0, msg: '' });
    const [campaignPrefix, setCampaignPrefix] = useState('PAGAMENTO_');
    const [queueSize, setQueueSize] = useState(5);

    const handleGenerateRows = () => {
        autoGenerateRows(queueSize);
    };

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
            const format = effectiveHeaderType.toUpperCase();
            const mediaUrlValue = (mediaUrl || headerMediaUrl)?.trim() || "https://iili.io/qv5OXja.jpg";

            if (mediaUrlValue.includes("placeholder_for_approval")) {
                console.warn(`[TemplateCreator] Header format is ${format} but using placeholder.`);
            }

            structure.header = {
                format: format,
                // The correct 'padrao' for this project is a direct string URL for the example, NOT an array or object
                example: mediaUrlValue
            };
        }

        if (footerText && footerText.trim()) {
            structure.footer = { text: footerText.trim() };
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
            category: 'UTILITY',
            structure: structure
        };
    };

    const callInfobipAPI = async (payload: any, overrideSender?: string) => {
        try {
            const effectiveSender = (overrideSender && overrideSender.trim()) || senderNumbers.split(/[\n,]/)[0]?.trim() || 'SENDER_ID';
            const encodedSender = encodeURIComponent(effectiveSender);
            const payloadStr = JSON.stringify(payload, null, 2);
            console.log('🚀 [INFOBIP_REQUEST] Payload:', payloadStr);

            const response = await fetch(`https://8k6xv1.api-us.infobip.com/whatsapp/2/senders/${encodedSender}/templates`, {
                method: 'POST',
                headers: {
                    'Authorization': `App ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: payloadStr
            });

            const result = await response.json();
            console.log('📬 [INFOBIP_RESPONSE]:', result);
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
        const targetUrl = "https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/template-aprovado";
        console.log('Enfileirando para Webhook (via Backend):', targetUrl);
        try {
            const response = await fetch("/api/webhook-push", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUrl,
                    payload: {
                        to: user?.notification_number || '',
                        mensagem: `🆕 *Novo Template Criado!* 🛠️\n\n📌 *Nome*: ${payload.name}\n📂 *Categoria*: ${payload.category}\n🌐 *Idioma*: ${payload.language}\n\nO template foi enviado para análise da Meta e o monitoramento já foi iniciado.`,
                        template: payload.name,
                        status: 'PENDING'
                    }
                })
            });
            const result = await response.json();
            console.log('Resposta Fila Webhook:', result);
        } catch (err) {
            console.error('Erro ao enfileirar Webhook:', err);
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

        const sanitizedBaseName = modelName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const targetNumbers = senderNumbers.split(/[\n,]/).map(n => n.trim()).filter(n => n.length > 5);
        if (targetNumbers.length === 0) return alert("Por favor, insira pelo menos um remetente oficial.");

        setIsGenerating(true);

        let totalSuccess = 0;
        let lastError = '';
        const totalOps = targetNumbers.length * copyCount;
        let currentOp = 0;

        for (const sender of targetNumbers) {
            for (let i = 1; i <= copyCount; i++) {
                currentOp++;
                const currentName = copyCount > 1 ? `${sanitizedBaseName}_${String(i).padStart(3, '0')}` : sanitizedBaseName;

                setGeneratingProgress({
                    current: currentOp,
                    total: totalOps,
                    msg: `Publicando "${currentName}" no remetente ${sender}...`
                });

                const payload = buildInfobipPayload(currentName);

                const res = await callInfobipAPI(payload, sender);
                if (res.success) {
                    totalSuccess++;
                    if (user?.id) {
                        await dbService.trackTemplate(currentName, user.id);
                    }

                    // Track in DB (log once per creation)
                    dbService.addLog({
                        logType: 'TEMPLATE',
                        name: currentName,
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
                        profile_name: currentName,
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
                            ad_name: currentName,
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
                } else {
                    lastError = res.error || 'Erro desconhecido';
                    console.error(`Error on sender ${sender} for ${currentName}:`, lastError);
                }

                // Safety Delay
                if (currentOp < totalOps) {
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        }

        setIsGenerating(false);

        if (totalSuccess > 0) {
            alert(`✅ ${totalSuccess} template(s) criado(s) com sucesso!`);
            navigate('/accounts');
        } else {
            alert(`❌ Erro: ${lastError}`);
        }
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
            const name = `${campaignPrefix}${row.suffix}`;
            setGeneratingProgress({ current: i + 1, total: bulkRows.length, msg: `Processando ${name}...` });

            // 1. Process and shorten links if necessary
            // Fallback for buttonUrl (singular) if buttonUrls is missing or empty
            let finalButtonUrls = row.buttonUrls && row.buttonUrls.length > 0 
                ? [...row.buttonUrls] 
                : (row.buttonUrl ? [row.buttonUrl] : []);
            
            const finalButtonTexts = row.buttonTexts && row.buttonTexts.length > 0 
                ? [...row.buttonTexts] 
                : [];

            if (row.hasButtons !== false && finalButtonUrls.length > 0) {
                setGeneratingProgress({ current: i + 1, total: bulkRows.length, msg: `Encurtando links para ${name}...` });
                for (let urlIdx = 0; urlIdx < finalButtonUrls.length; urlIdx++) {
                    const originalUrl = finalButtonUrls[urlIdx];
                    if (originalUrl && (originalUrl.startsWith('http') || originalUrl.includes('.'))) {
                        try {
                            const shortRes = await dbService.createShortLink({
                                user_id: user?.id,
                                client_id: Number(selectedClientId),
                                original_url: originalUrl,
                                title: `Bulk: ${name} - B${urlIdx + 1}`
                            });
                            if (shortRes.shortUrl) {
                                finalButtonUrls[urlIdx] = shortRes.shortUrl;
                            }
                        } catch (err) {
                            console.error(`Shortener error for ${name}:`, err);
                        }
                    }
                }
            }

            // 2. Build payload with potentially shortened URLs
            const payload: any = buildInfobipPayload(name, row.headerType, row.mediaUrl, finalButtonUrls, row.hasButtons);

            // 3. Inject correct button texts from the bulk table
            if (payload.structure?.buttons && finalButtonTexts.length > 0) {
                payload.structure.buttons = payload.structure.buttons.map((btn: any, idx: number) => {
                    if (finalButtonTexts[idx]) {
                        return { ...btn, text: finalButtonTexts[idx] };
                    }
                    return btn;
                });
            }

            // Inject sender into payload for tracking/webhooks
            const rowSender = row.sender && row.sender.trim() ? row.sender : (senderNumbers.split(/[\n,]/)[0]?.trim() || 'SENDER_ID');
            const extendedPayload = { ...payload, sender: rowSender };

            console.log(`[BULK] Creating template "${name}" on sender "${rowSender}"...`, extendedPayload);

            const res = await callInfobipAPI(payload, rowSender);
            if (res.success) {
                successCount++;
                if (user?.id) {
                    await dbService.trackTemplate(name, user.id);
                }
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
                    button_link: (finalButtonUrls && finalButtonUrls.length > 0) ? finalButtonUrls[0] : '',
                    variables: variablesExample || [],
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
                profile_name: `Lote: ${campaignPrefix}*`,
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
        if (successCount > 0) navigate('/client-submissions');
    };

    const autoGenerateRows = (qty: number) => {
        const urlButtons = buttons.filter(b => b.type === 'url');
        const startIdx = bulkRows.length + 1;
        const newRows: BulkRow[] = [];

        const firstSender = senderNumbers.split(/[\n,]/)[0]?.trim() || '';

        for (let i = 0; i < qty; i++) {
            const currentNum = startIdx + i;
            newRows.push({
                suffix: String(currentNum).padStart(3, '0'),
                sender: firstSender,
                headerType: headerType,
                mediaUrl: headerType !== 'none' ? headerMediaUrl : '',
                hasButtons: buttons.length > 0,
                buttonUrl: urlButtons[0]?.url || '',
                buttonUrls: urlButtons.map(b => b.url || ''),
                buttonTexts: urlButtons.map(b => b.text || '')
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
        const sourceRow = bulkRows[index];
        const copiesStr = window.prompt("Quantas cópias deseja criar?", "1");
        const copies = parseInt(copiesStr || "0");
        
        if (isNaN(copies) || copies <= 0) return;

        // Find the highest current numeric suffix to continue the sequence
        const highestSuffix = bulkRows.reduce((max, row) => {
            const num = parseInt(row.suffix);
            return isNaN(num) ? max : Math.max(max, num);
        }, 0);

        const newRows: BulkRow[] = [];
        for (let i = 1; i <= copies; i++) {
            newRows.push({
                ...sourceRow,
                suffix: String(highestSuffix + i).padStart(3, '0'),
                buttonUrls: [...sourceRow.buttonUrls],
                buttonTexts: sourceRow.buttonTexts ? [...sourceRow.buttonTexts] : []
            });
        }

        setBulkRows(prev => [
            ...prev.slice(0, index + 1),
            ...newRows,
            ...prev.slice(index + 1)
        ]);
    };

    // --- UTILITY SHORTENER STATE ---
    const [utilityLinkOriginal, setUtilityLinkOriginal] = useState('');
    const [utilityLinkShort, setUtilityLinkShort] = useState('');
    const [isShorteningUtility, setIsShorteningUtility] = useState(false);

    const handleUtilityShorten = async () => {
        if (!utilityLinkOriginal || (!utilityLinkOriginal.startsWith('http') && !utilityLinkOriginal.includes('.'))) {
            return alert("Insira um link válido para encurtar.");
        }
        if (!selectedClientId) return alert("Selecione um cliente primeiro.");

        setIsShorteningUtility(true);
        try {
            const res = await dbService.createShortLink({
                user_id: user?.id,
                client_id: Number(selectedClientId),
                original_url: utilityLinkOriginal,
                title: `Utility: ${campaignPrefix}*`
            });
            if (res.shortUrl) {
                setUtilityLinkShort(res.shortUrl);
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao encurtar link.");
        } finally {
            setIsShorteningUtility(false);
        }
    };

    const applyUtilityLinkToAll = (btnIdx: number) => {
        if (!utilityLinkShort) return alert("Encurte um link primeiro.");
        const confirmApply = window.confirm(`Deseja aplicar o link curto a todos os botões ${btnIdx + 1} da tabela?`);
        if (!confirmApply) return;

        setBulkRows(prev => prev.map(row => {
            const newUrls = [...row.buttonUrls];
            newUrls[btnIdx] = utilityLinkShort;
            return { ...row, buttonUrls: newUrls };
        }));
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
                    background: var(--card-bg-subtle);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--surface-border-subtle);
                    box-shadow: var(--shadow-md);
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
                    background: var(--card-bg-subtle); 
                    padding: 16px; 
                    border: 1px solid var(--surface-border-subtle); 
                    border-radius: 14px; 
                    display: flex; 
                    gap: 12px; 
                    align-items: center; 
                    flex-wrap: wrap;
                }

                .preview-sticky { position: sticky; top: 32px; }
                .wp-bubble { 
                    background: var(--wp-bubble-bg); 
                    border-radius: 20px; 
                    padding: 12px; 
                    border: 1px solid var(--wp-bubble-border); 
                    max-width: 100%; 
                    margin: 0 auto; 
                    box-shadow: var(--shadow-md); 
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
                    .bulk-table-container { padding: 2px !important; border-radius: 6px !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; width: 100% !important; border: 1px solid var(--surface-border-subtle) !important; }

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
                    background: var(--overlay-bg);
                    backdrop-filter: blur(12px);
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 32px;
                    color: var(--text-primary);
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

                .bulk-field-input {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(172, 248, 0, 0.15) !important;
                    border-radius: 12px !important;
                    padding: 12px 16px !important;
                    color: white !important;
                    font-size: 0.9rem !important;
                    outline: none !important;
                    transition: all 0.2s !important;
                    width: 100%;
                }
                .bulk-field-input:focus {
                    background: rgba(255, 255, 255, 0.08) !important;
                    border-color: var(--primary-color) !important;
                    box-shadow: 0 0 15px rgba(172, 248, 0, 0.1) !important;
                }
                .global-tile-btn {
                    border-radius: 16px !important;
                    font-weight: 900 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1.5px !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 10px !important;
                    cursor: pointer !important;
                    border: 1px solid transparent !important;
                    font-size: 0.75rem !important;
                }
                .global-tile-btn {
                    transition: all 0.2s ease !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 8px !important;
                    cursor: pointer !important;
                    border: 1px solid transparent !important;
                    font-size: 0.7rem !important;
                    padding: 8px 16px !important;
                    height: 38px !important;
                    border-radius: 8px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                .global-tile-btn-primary {
                    background: var(--primary-color) !important;
                    color: black !important;
                    box-shadow: none !important;
                }
                .global-tile-btn-primary:hover {
                    box-shadow: 0 4px 12px rgba(172, 248, 0, 0.2) !important;
                    filter: brightness(1.05) !important;
                }
                .global-tile-btn-ghost {
                    background: rgba(255, 255, 255, 0.02) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                .global-tile-btn-ghost:hover {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                }
                .global-tile-btn-danger {
                    background: rgba(239, 68, 68, 0.05) !important;
                    border: 1px solid rgba(239, 68, 68, 0.2) !important;
                    color: #f87171 !important;
                }
                .global-tile-btn-danger:hover {
                    background: #ef4444 !important;
                    color: white !important;
                }
                .global-tile-panel {
                    background: rgba(15, 23, 42, 0.3) !important;
                    border-radius: 16px !important;
                    border: 1px solid var(--surface-border-subtle) !important;
                    backdrop-filter: blur(8px);
                }
                .global-input-wrapper {
                    background: rgba(0, 0, 0, 0.3) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 10px !important;
                    padding: 0 12px !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                    height: 42px !important;
                    transition: border-color 0.2s !important;
                }
                .global-input-wrapper input {
                    color: white !important;
                    background: transparent !important;
                    border: none !important;
                    outline: none !important;
                }
                .global-input-wrapper:focus-within {
                    border-color: var(--primary-color) !important;
                    background: rgba(0, 0, 0, 0.4) !important;
                }
                .bulk-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    padding: 24px;
                }
                .bulk-input-container {
                    display: flex;
                    gap: 24px;
                    align-items: flex-end;
                }
                
                .bulk-table-container {
                    max-height: 500px;
                    overflow-x: auto;
                    overflow-y: auto;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 8px;
                }
                .bulk-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .bulk-table th {
                    padding: 16px;
                    background: var(--card-bg-subtle);
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
                .input-field {
                    background: rgba(255, 255, 255, 0.04) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    color: white !important;
                    border-radius: 10px !important;
                    padding: 8px 12px !important;
                    outline: none !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    width: 100%;
                }
                .input-field:focus {
                    border-color: var(--primary-color) !important;
                    background: rgba(172, 248, 0, 0.05) !important;
                    box-shadow: 0 0 10px rgba(172, 248, 0, 0.1) !important;
                }
                .input-field::placeholder {
                    color: rgba(255, 255, 255, 0.2);
                }
                .bulk-row:hover {
                    background: rgba(172, 248, 0, 0.04) !important;
                }
                select.input-field option {
                    background: #0f172a;
                    color: white;
                }
                .btn-secondary {
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: white !important;
                }
                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.08) !important;
                    border-color: var(--primary-color) !important;
                    color: var(--primary-color) !important;
                }
                label { 
                    color: var(--primary-color) !important;
                    opacity: 0.8 !important;
                    font-weight: 900 !important;
                    letter-spacing: 0.5px !important;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>

            <div className="p-4 md:p-8 creator-page min-h-screen">
                <div className="flex flex-col mb-4">
                    <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.4rem, 6vw, 2.4rem)', letterSpacing: '-1.5px', lineHeight: 1 }}>Templates WhatsApp</h1>
                    <p className="subtitle" style={{ fontSize: 'clamp(0.75rem, 3.5vw, 1rem)', opacity: 0.6 }}>Criação oficial via Infobip Cloud</p>
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

                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col" style={{ marginBottom: '10px' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.7 }}>Remetentes Oficiais (Manual)</span>
                                            <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Insira um ou mais números separados por vírgula ou linha</span>
                                        </div>
                                        <textarea
                                            value={senderNumbers}
                                            onChange={e => setSenderNumbers(e.target.value)}
                                            placeholder="Ex: 5511999999999, 5511888888888"
                                            style={{
                                                background: 'rgba(0,0,0,0.2)',
                                                border: '1px solid rgba(172, 248, 0, 0.1)',
                                                borderRadius: '12px',
                                                padding: '12px',
                                                color: 'white',
                                                fontSize: '0.85rem',
                                                minHeight: '80px',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                    </div>

                                    {/* CLIENT SELECTION */}
                                    {user?.role === 'ADMIN' && (
                                        <div className="space-y-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px', marginTop: '10px' }}>
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
                                                        <input required className="input-field" style={{ flex: 1.5, borderRadius: '10px', padding: '10px' }} placeholder="Nome do Cliente" value={newClientData.name} onChange={e => setNewClientData({ ...newClientData, name: e.target.value })} />
                                                        <input required className="input-field" style={{ flex: 1, borderRadius: '10px', padding: '10px' }} placeholder="Telefone (com DDD)" value={newClientData.phone} onChange={e => setNewClientData({ ...newClientData, phone: e.target.value })} />
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <input required type="email" className="input-field" style={{ flex: 1.5, borderRadius: '10px', padding: '10px' }} placeholder="Email de Login" value={newClientData.email} onChange={e => setNewClientData({ ...newClientData, email: e.target.value })} />
                                                        <input required type="password" className="input-field" style={{ flex: 1, borderRadius: '10px', padding: '10px' }} placeholder="Senha Inicial" value={newClientData.password} onChange={e => setNewClientData({ ...newClientData, password: e.target.value })} />
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
                                            <label>Categoria (Fixa)</label>
                                            <select className="input-field" style={{ borderRadius: '12px', opacity: 0.7, cursor: 'not-allowed' }} value="UTILITY" disabled>
                                                <option value="UTILITY">Utilidade (Padrão)</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label>Idioma</label>
                                            <select className="input-field" style={{ borderRadius: '12px' }} value={language} onChange={e => setLanguage(e.target.value)}>
                                                <option value="pt_BR">Português (BR)</option>
                                                <option value="en_US">Inglês (US)</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label>Número de Cópias</label>
                                            <input type="number" min="1" max="50" className="input-field" style={{ borderRadius: '12px' }} value={copyCount} onChange={e => setCopyCount(Math.max(1, parseInt(e.target.value) || 1))} />
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
                                                    <div className="flex-1 bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <CheckCircle size={20} className="text-primary" />
                                                            <span className="font-mono text-[10px] truncate">Mídia Selecionada</span>
                                                        </div>
                                                        <button onClick={() => setHeaderMediaUrl('')} className="text-danger hover:text-danger-dark transition-colors">
                                                            <X size={16} />
                                                        </button>
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
                            <div className="glass-card animate-fade-in" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '32px', borderRadius: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <div>
                                        <h2 style={{ fontWeight: 900, marginBottom: '4px' }}>Gerador Bulk High-Speed</h2>
                                    </div>
                                    <button className="btn btn-secondary" onClick={() => setBulkRows([])} style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem' }}>LIMPAR TUDO</button>
                                </div>

                                <div className="global-tile-panel" style={{ padding: '24px', marginBottom: '32px', border: '2px solid var(--surface-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                        <div style={{ background: 'var(--primary-color)', color: 'black', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Link size={20} /></div>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary-color)' }}>Ferramenta de Encurtamento</h4>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '32px' }}>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '300px' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '4px' }}>Link Original para Encurtar</label>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <input
                                                    className="bulk-field-input"
                                                    style={{ flex: 1 }}
                                                    placeholder="https://sua-url-longa.com/pagina?id=123"
                                                    value={utilityLinkOriginal}
                                                    onChange={e => setUtilityLinkOriginal(e.target.value)}
                                                />
                                                <button
                                                    className="global-tile-btn global-tile-btn-primary"
                                                    style={{ height: '52px', minWidth: '180px' }}
                                                    onClick={handleUtilityShorten}
                                                    disabled={isShorteningUtility || !utilityLinkOriginal}
                                                >
                                                    {isShorteningUtility ? 'ENCURTANDO...' : 'ENCURTAR AGORA'}
                                                </button>
                                                {utilityLinkShort && (
                                                    <button
                                                        className="global-tile-btn global-tile-btn-ghost"
                                                        style={{ height: '52px', width: '52px', padding: 0 }}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(utilityLinkShort);
                                                            alert("Link copiado!");
                                                        }}
                                                    >
                                                        <Copy size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {utilityLinkShort && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '32px' }}>
                                                <label style={{ fontSize: '10px', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '4px' }}>Aplicar Globalmente:</label>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                                    {buttons.filter(b => b.type === 'url').map((btn, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => applyUtilityLinkToAll(idx)}
                                                            className="global-tile-btn global-tile-btn-ghost"
                                                            style={{ fontSize: '10px', padding: '8px 16px', minWidth: '100px' }}
                                                        >
                                                            {idx + 1}. {btn.text || 'LINK'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bulk-card" style={{ marginBottom: '32px' }}>
                                    <div className="bulk-input-container">
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, opacity: 0.5, marginBottom: '8px' }}>Fixo da Campanha (Ex: OBRIGADO_)</label>
                                            <input
                                                value={campaignPrefix}
                                                onChange={e => setCampaignPrefix(e.target.value.replace(/\s/g, '_'))}
                                                className="bulk-field-input"
                                                placeholder="PREFIXO_FIXO_"
                                            />
                                        </div>
                                        <div style={{ width: '260px' }}>
                                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, opacity: 0.5, marginBottom: '8px' }}>Tamanho Fila</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="number"
                                                    value={queueSize}
                                                    onChange={e => setQueueSize(parseInt(e.target.value) || 1)}
                                                    className="bulk-field-input"
                                                    style={{ textAlign: 'center' }}
                                                />
                                                <button
                                                    className="global-tile-btn global-tile-btn-primary"
                                                    style={{ height: '52px', padding: '0 24px', whiteSpace: 'nowrap' }}
                                                    onClick={handleGenerateRows}
                                                >
                                                    <Plus size={20} /> CRIAR LOTE
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {bulkRows.length > 0 && (
                                    <>
                                        <div className="global-tile-panel animate-fade-in" style={{ padding: '20px', marginBottom: '32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                                                <div style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', padding: '8px', borderRadius: '10px' }}><Settings2 size={18} /></div>
                                                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PAINEL DE AÇÃO GLOBAL</h3>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>1. TIPO DE MÍDIA</span>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {(['none', 'image', 'video'] as const).map(t => (
                                                            <button
                                                                key={t}
                                                                onClick={() => applyGlobalHeaderType(t)}
                                                                className={`global-tile-btn ${headerType === t ? 'global-tile-btn-primary' : 'global-tile-btn-ghost'}`}
                                                                style={{ flex: 1 }}
                                                            >
                                                                {t === 'none' ? 'SEM MÍDIA' : t.toUpperCase()}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>2. BOTÕES</span>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => applyGlobalButtons(true)}
                                                            className="global-tile-btn global-tile-btn-primary"
                                                            style={{ flex: 1 }}
                                                        >
                                                            ATIVAR TDS
                                                        </button>
                                                        <button
                                                            onClick={() => applyGlobalButtons(false)}
                                                            className="global-tile-btn global-tile-btn-danger"
                                                            style={{ flex: 1 }}
                                                        >
                                                            REMOVER
                                                        </button>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>3. REMETENTE GERAL</span>
                                                    <div className="global-input-wrapper">
                                                        <Smartphone size={16} style={{ color: 'var(--primary-color)', opacity: 0.8 }} />
                                                        <input
                                                            onChange={(e) => applyGlobalSender(e.target.value)}
                                                            className="font-bold text-xs w-full"
                                                            style={{ letterSpacing: '1px' }}
                                                            placeholder="DIGITE O NÚMERO DE DISPARO"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-8 animate-fade-in">
                                            <div className="bulk-table-container shadow-2xl bg-black/20 p-2 rounded-3xl border border-white/10 overflow-hidden">
                                                <table className="bulk-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>SUFIXO</th>
                                                            <th>SENDER</th>
                                                            <th>TIPO</th>
                                                            {buttons.length > 0 && <th>BOTÕES</th>}
                                                            {buttons.filter(b => b.type === 'url').map((_, urlIdx) => (
                                                                <Fragment key={urlIdx}>
                                                                    <th key={`label-${urlIdx}`}>LABEL B{urlIdx + 1}</th>
                                                                    <th key={`link-${urlIdx}`}>LINK {urlIdx + 1}</th>
                                                                </Fragment>
                                                            ))}
                                                            <th style={{ width: '60px' }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {bulkRows.map((row, i) => (
                                                            <tr key={i} className="bulk-row">
                                                                <td>
                                                                    <input className="input-field" style={{ padding: '8px', borderRadius: '10px', fontSize: '0.81rem', fontWeight: 700 }} value={row.suffix} onChange={(e: any) => {
                                                                        const n = [...bulkRows];
                                                                        n[i].suffix = e.target.value.toLowerCase().replace(/\s/g, '_');
                                                                        setBulkRows(n);
                                                                    }} />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        className="input-field"
                                                                        style={{ padding: '8px', borderRadius: '10px', fontSize: '0.81rem', fontWeight: 800 }}
                                                                        value={row.sender || ''}
                                                                        placeholder={senderNumbers.split(/[\n,]/)[0] || ''}
                                                                        onChange={(e: any) => {
                                                                            const n = [...bulkRows];
                                                                            n[i].sender = e.target.value;
                                                                            setBulkRows(n);
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <select className="input-field" style={{ padding: '8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }} value={row.headerType} onChange={(e: any) => {
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
                                                                        <select className="input-field" style={{ padding: '8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }} value={row.hasButtons !== false ? 'yes' : 'no'} onChange={(e: any) => {
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
                                                                    <Fragment key={urlIdx}>
                                                                        <td key={`label-td-${urlIdx}`}>
                                                                            <input className="input-field" disabled={row.hasButtons === false} style={{ padding: '8px', borderRadius: '10px', fontSize: '0.81rem', opacity: row.hasButtons === false ? 0.3 : 1, fontWeight: 600 }} value={row.buttonTexts?.[urlIdx] || ''} onChange={(e: any) => {
                                                                                const n = [...bulkRows];
                                                                                if (!n[i].buttonTexts) n[i].buttonTexts = [];
                                                                                n[i].buttonTexts[urlIdx] = e.target.value;
                                                                                setBulkRows(n);
                                                                            }} />
                                                                        </td>
                                                                        <td key={`link-td-${urlIdx}`}>
                                                                            <input className="input-field" disabled={row.hasButtons === false} style={{ padding: '8px', borderRadius: '10px', fontSize: '0.81rem', opacity: row.hasButtons === false ? 0.3 : 1 }} value={row.buttonUrls?.[urlIdx] || ''} onChange={e => {
                                                                                const n = [...bulkRows];
                                                                                if (!n[i].buttonUrls) n[i].buttonUrls = [];
                                                                                n[i].buttonUrls[urlIdx] = e.target.value;
                                                                                setBulkRows(n);
                                                                            }} />
                                                                        </td>
                                                                    </Fragment>
                                                                ))}
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                                                        <button onClick={() => duplicateRow(i)} title="Duplicar" style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                                                                            <Copy size={18} />
                                                                        </button>
                                                                        <button onClick={() => setBulkRows(bulkRows.filter((_, idx) => idx !== i))} title="Remover" style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <button className="btn btn-primary shadow-xl mt-6 w-full" style={{ minHeight: '74px', fontSize: '1.2rem', fontWeight: 900, color: 'black', borderRadius: '24px', textTransform: 'uppercase', letterSpacing: '1px' }} onClick={handleGenerateBulk} disabled={isGenerating}>
                                                {isGenerating ? `PROCESSANDO (${generatingProgress.current}/${generatingProgress.total})...` : '🚀 LANÇAR CAMPANHA EM MASSA'}
                                            </button>
                                        </div>
                                    </>
                                )}
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
                                        <span style={{ color: '#8696a0', fontSize: '0.7rem' }}>disparando como {senderNumbers.split(/[\n,]/)[0] || '...'}</span>
                                        <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
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
                                <div style={{ background: 'var(--code-bg)', padding: '12px', borderRadius: '16px', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
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
