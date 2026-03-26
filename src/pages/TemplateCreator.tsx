import { useState, useEffect, Fragment, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Smartphone, Layers, Plus, Activity, Image as ImageIcon, Video, Link, MessageSquareReply, Copy, Trash2, ChevronRight, ChevronDown, Edit2 } from 'lucide-react';
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
    headerType: 'TEXT' | 'IMAGE' | 'VIDEO';
    mediaUrl: string;
    hasButtons: boolean;
    buttonUrl?: string; // Legacy field, kept for safety
    buttonUrls: string[];
    buttonTexts: string[];
    originalButtonUrls?: string[];
};

interface CampaignBatch {
    id: string;
    prefix: string;
    rows: BulkRow[];
    collapsed?: boolean;
}

const TemplateCreator = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'MODEL' | 'BULK'>(location.state?.activeTab || 'MODEL');

    // --- API / CONFIG STATE ---
    const [apiKey, setApiKey] = useState(user?.infobip_key || '');
    const [senderNumbers, setSenderNumbers] = useState(user?.infobip_sender || '');
    const [isUploading, setIsUploading] = useState(false);

    // --- CLIENT SELECTION STATE ---
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | number>('');

    useEffect(() => {
        if (user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') {
            dbService.getClients().then(data => {
                setClients(data);
            });
        }

        if (user?.role === 'CLIENT') {
            setSelectedClientId(user?.id || '');
        }
    }, [user]);


    useEffect(() => {
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
            if (data.clientId) setSelectedClientId(data.clientId);

            if (data.campaigns && data.campaigns.length > 0) {
                const initializedCampaigns = data.campaigns.map((camp: any) => ({
                    ...camp,
                    id: camp.id || Date.now().toString() + Math.random(),
                    rows: camp.rows.map((row: any) => ({
                        ...row,
                        headerType: row.headerType || data.templateType || 'TEXT',
                        buttonUrls: row.buttonUrls || (row.buttonUrl ? [row.buttonUrl] : []),
                        buttonTexts: row.buttonTexts || (row.buttonUrl ? ['Clique Aqui'] : [])
                    }))
                }));
                setCampaigns(initializedCampaigns);

                if (initializedCampaigns[0].rows[0]) {
                    const firstRow = initializedCampaigns[0].rows[0];
                    if (firstRow.mediaUrl) setHeaderMediaUrl(firstRow.mediaUrl);
                    if (firstRow.buttonUrl) {
                        setButtons([{ type: 'url', text: 'Clique Aqui', url: firstRow.buttonUrl }]);
                    }
                }
            } else if (data.rows && data.rows.length > 0) {
                const initializedRows = data.rows.map((row: any) => ({
                    ...row,
                    headerType: row.headerType || data.templateType || 'TEXT',
                    buttonUrls: row.buttonUrls || (row.buttonUrl ? [row.buttonUrl] : []),
                    buttonTexts: row.buttonTexts || (row.buttonUrl ? ['Clique Aqui'] : [])
                }));
                setCampaigns([{
                    id: Date.now().toString(),
                    prefix: data.campaignPrefix || 'nome_campanha_1_',
                    rows: initializedRows
                }]);

                if (initializedRows[0].mediaUrl) setHeaderMediaUrl(initializedRows[0].mediaUrl);
                if (initializedRows[0].buttonUrl) {
                    setButtons([{ type: 'url', text: 'Clique Aqui', url: initializedRows[0].buttonUrl }]);
                }
            }
        }
    }, [location.state, user]);

    // --- MODEL STATE ---
    const [modelName, setModelName] = useState('pagamento_confirmado');
    const [language, setLanguage] = useState('pt_BR');

    const [headerType, setHeaderType] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('TEXT');
    const [headerMediaUrl, setHeaderMediaUrl] = useState('https://iili.io/qLZLRgs.jpg');

    const [bodyText, _setBodyText] = useState('Oi {{1}}! Informamos que {{2}}\n\n{{3}}\n\nPara {{4}}, clique no botão abaixo 👇');
    const [footerText, _setFooterText] = useState('Digite "sair" para não receber mais mensagens');

    const defaultVars = ['Leandro', 'recebemos a confirmação do pagamento referente ao protocolo n° 7164427, realizado em 12/10/2025', 'O comprovante digital já se encontra disponível para conferência', 'acessar o comprovante digital #54333 e verificar a entrega'];
    const [variablesExample, _setVariablesExample] = useState(defaultVars);
    const [isFiveVars, setIsFiveVars] = useState(false);

    const [buttons, setButtons] = useState<ButtonDef[]>([
        { type: 'url', text: 'Clique Aqui', url: 'https://site.com' }
    ]);

    const [copyCount] = useState(1);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0, msg: '' });
    const [queueSize, setQueueSize] = useState(5);
    const [campaigns, setCampaigns] = useState<CampaignBatch[]>([{ id: Date.now().toString(), prefix: 'nome_campanha_1_', rows: [] }]);


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

    const buildInfobipPayload = (name: string, overrideHeaderType?: 'TEXT' | 'IMAGE' | 'VIDEO', mediaUrl?: string, buttonUrlOverrides?: string[], overrideHasButtons?: boolean, buttonTextOverrides?: string[]) => {
        const varMatches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
        const varCount = varMatches.length;
        
        let examples = [];
        if (isFiveVars && varCount === 5) {
            examples = [
                "Leandro",
                "recebemos a confirmação do pagamento referente ao protocolo n° 7164427, realizado em 12/10/2025",
                "Seu pedido foi processado com sucesso",
                "acessar o comprovante digital #54333 e verificar a entrega",
                "ver o comprovante digital #76632353 e verificar a entrega"
            ];
        } else {
            examples = [
                "Leandro",
                "recebemos a confirmação do pagamento referente ao protocolo n° 7164427, realizado em 12/10/2025",
                "O comprovante digital já se encontra disponível para conferência",
                "acessar o comprovante digital #54333 e verificar a entrega"
            ].slice(0, varCount);

            while (examples.length < varCount) {
                examples.push("Exemplo");
            }
        }

        const structure: any = {
            body: { text: bodyText }
        };

        if (examples.length > 0) {
            structure.body.examples = examples;
        }

        const effectiveHeaderType = overrideHeaderType || headerType;

        if (effectiveHeaderType !== 'TEXT') {
            const format = effectiveHeaderType.toUpperCase();
            const mediaUrlValue = (mediaUrl || headerMediaUrl)?.trim() || "https://iili.io/qLZLRgs.jpg";
            structure.header = {
                format: format,
                example: mediaUrlValue
            };
        }

        if (footerText && footerText.trim()) {
            structure.footer = { text: footerText.trim() };
        }

        const effectiveHasButtons = overrideHasButtons !== undefined ? overrideHasButtons : (buttons.length > 0);

        if (effectiveHasButtons && buttons.length > 0) {
            let urlIdxCount = 0;
            structure.buttons = buttons.map((btn: any) => {
                const bPayload: any = {
                    type: btn.type === 'url' ? 'URL' : 'QUICK_REPLY',
                    text: (btn.type === 'url' && buttonTextOverrides && buttonTextOverrides[urlIdxCount]) ? buttonTextOverrides[urlIdxCount] : btn.text,
                };
                if (btn.type === 'url') {
                    const finalUrl = (buttonUrlOverrides && buttonUrlOverrides[urlIdxCount]) || btn.url;
                    bPayload.url = finalUrl || 'https://site.com';
                    urlIdxCount++;
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
        const targetUrl = "https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/template-aprovado";
        try {
            await fetch("/api/webhook-push", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUrl,
                    payload: {
                        to: user?.notification_number || '',
                        mensagem: `🆕 *Novo Template Criado!* 🛠️\n\n📌 *Nome*: ${payload.name}\n📂 *Categoria*: ${payload.category}\n🌐 *Idioma*: ${payload.language}${payload.original_button_link ? `\n🔗 *Link Original*: ${payload.original_button_link}` : ''}\n\nO template foi enviado para análise da Meta e o monitoramento já foi iniciado.`,
                        template: payload.name,
                        status: 'PENDING',
                        original_button_link: payload.original_button_link
                    }
                })
            });
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

    const hasValidationErrors = useMemo(() => {
        const allFullNames: string[] = [];
        const allPrefixes: string[] = [];

        campaigns.forEach(c => {
            const p = c.prefix.trim().toLowerCase();
            if (p) allPrefixes.push(p);
            c.rows.forEach(r => {
                const full = `${c.prefix}${r.suffix}`.toLowerCase().trim();
                if (full) allFullNames.push(full);
            });
        });

        const hasDuplicatePrefix = campaigns.some(c => {
            const p = c.prefix.trim().toLowerCase();
            return p !== "" && allPrefixes.filter(x => x === p).length > 1;
        });

        const hasEmptyPrefix = campaigns.some(c => c.prefix.trim() === "");

        const hasDuplicateFullName = campaigns.some(c =>
            c.rows.some(r => {
                const full = `${c.prefix}${r.suffix}`.toLowerCase().trim();
                return full !== "" && allFullNames.filter(x => x === full).length > 1;
            })
        );

        return hasDuplicatePrefix || hasEmptyPrefix || hasDuplicateFullName;
    }, [campaigns]);

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
                setGeneratingProgress({ current: currentOp, total: totalOps, msg: `Publicando "${currentName}" no remetente ${sender}...` });

                const payload = buildInfobipPayload(currentName);
                const res = await callInfobipAPI(payload, sender);
                if (res.success) {
                    totalSuccess++;
                    if (user?.id) await dbService.trackTemplate(currentName, user.id);
                    dbService.addLog({ logType: 'TEMPLATE', name: currentName, author: user?.name, mode: 'SINGLE', userId: Number(selectedClientId) });
                    await sendToWebhook(payload);

                    const client = clients.find(c => String(c.id) === String(selectedClientId));
                    await dbService.addClientSubmission({
                        user_id: selectedClientId,
                        client_name: client?.name || '',
                        profile_name: currentName,
                        ddd: client?.phone?.substring(0, 2) || '11',
                        template_type: headerType,
                        media_url: headerType !== 'TEXT' ? headerMediaUrl : '',
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
                            media_url: headerType !== 'TEXT' ? headerMediaUrl : '',
                            ad_copy: bodyText,
                            button_link: buttons.find(b => b.type === 'url')?.url || '',
                            variables: variablesExample,
                            delivered_leads: 0,
                            price_per_msg: 0.04
                        }]
                    });
                } else {
                    lastError = res.error || 'Erro desconhecido';
                }

                if (currentOp < totalOps) await new Promise(r => setTimeout(r, 2000));
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
        if (campaigns.every(c => c.rows.length === 0)) return alert("Adicione pelo menos uma linha em alguma campanha.");
        if (!selectedClientId) return alert("Selecione ou cadastre um cliente primeiro na Estrutura Básica.");

        // Check for duplicate suffixes in each campaign
        for (const camp of campaigns) {
            const suffixes = camp.rows.map(r => r.suffix.trim());
            const duplicates = suffixes.filter((s, i) => suffixes.indexOf(s) !== i && s !== "");
            if (duplicates.length > 0) {
                return alert(`⚠️ Suffixos duplicados na Campanha "${camp.prefix}": ${[...new Set(duplicates)].join(', ')}. Por favor, corrija antes de prosseguir.`);
            }
        }

        const totalTotal = campaigns.reduce((acc, c) => acc + c.rows.length, 0);
        const confirmBulk = window.confirm(`Isso irá disparar ${totalTotal} chamadas de API em ${campaigns.length} campanhas. Continuar?`);
        if (!confirmBulk) return;

        setIsGenerating(true);
        let successCount = 0;
        let errors = [];
        // Map to store ads grouped by campaign ID
        const adsByCampaignId: { [key: string]: any[] } = {};
        campaigns.forEach(c => adsByCampaignId[c.id] = []);

        let currentOpTotal = 0;
        for (let cIdx = 0; cIdx < campaigns.length; cIdx++) {
            const campaign = campaigns[cIdx];
            for (let i = 0; i < campaign.rows.length; i++) {
                currentOpTotal++;
                const row = campaign.rows[i];
                const name = `${campaign.prefix}${row.suffix}`.replace(/[\s-@]/g, '_').replace(/__+/g, '_').toLowerCase();
                setGeneratingProgress({ current: currentOpTotal, total: totalTotal, msg: `Processando Campanha ${cIdx + 1}/${campaigns.length}: ${name}...` });

                let finalButtonUrls = row.buttonUrls && row.buttonUrls.length > 0 ? [...row.buttonUrls] : [];
                const finalButtonTexts = row.buttonTexts && row.buttonTexts.length > 0 ? [...row.buttonTexts] : [];

                if (row.hasButtons !== false && finalButtonUrls.length > 0) {
                    row.originalButtonUrls = [...finalButtonUrls]; // Preserve original
                    for (let urlIdx = 0; urlIdx < finalButtonUrls.length; urlIdx++) {
                        const originalUrl = finalButtonUrls[urlIdx];
                        if (originalUrl && (originalUrl.startsWith('http') || originalUrl.includes('.'))) {
                            try {
                                const shortRes = await dbService.createShortLink({
                                    user_id: user?.id,
                                    target_user_id: Number(selectedClientId),
                                    original_url: originalUrl,
                                    title: `Bulk: ${name} - B${urlIdx + 1}`
                                });
                                if (shortRes.shortUrl) finalButtonUrls[urlIdx] = shortRes.shortUrl;
                            } catch (err) { console.error(`Shortener error for ${name}:`, err); }
                        }
                    }
                }

                const payload = buildInfobipPayload(name, row.headerType, row.mediaUrl, finalButtonUrls, row.hasButtons, finalButtonTexts);

                const rowSender = row.sender && row.sender.trim() ? row.sender : (senderNumbers.split(/[\n,]/)[0]?.trim() || 'SENDER_ID');
                const extendedPayload = { 
                    ...payload, 
                    sender: rowSender,
                    original_button_link: (row.originalButtonUrls && row.originalButtonUrls.length > 0) ? row.originalButtonUrls[0] : ''
                };
                const res = await callInfobipAPI(payload, rowSender);
                if (res.success) {
                    successCount++;
                    if (user?.id) await dbService.trackTemplate(name, user.id);
                    dbService.addLog({ logType: 'TEMPLATE', name, author: user?.name, mode: 'BULK', userId: Number(selectedClientId) });
                    await sendToWebhook(extendedPayload);

                    adsByCampaignId[campaign.id].push({
                        ad_name: name,
                        template_type: row.headerType,
                        message_mode: 'manual',
                        media_url: row.headerType !== 'TEXT' ? (row.mediaUrl || headerMediaUrl || "https://iili.io/qLZLRgs.jpg") : '',
                        ad_copy: bodyText,
                        button_link: (row.hasButtons !== false && finalButtonUrls && finalButtonUrls.length > 0) ? (finalButtonUrls[0] || '') : '',
                        original_button_link: (row.hasButtons !== false && row.originalButtonUrls && row.originalButtonUrls.length > 0) ? (row.originalButtonUrls[0] || '') : '',
                        variables: variablesExample || [],
                        delivered_leads: 0,
                        price_per_msg: 0.04
                    });
                } else {
                    errors.push(`${name}: ${res.error}`);
                }

                if (currentOpTotal < totalTotal) await new Promise(r => setTimeout(r, 2500));
            }
        }

        // Finalize: Reconcile with existing submissions or create new ones
        const client = clients.find(c => String(c.id) === String(selectedClientId));
        
        for (const campaign of campaigns) {
            const campaignAds = adsByCampaignId[campaign.id];
            if (campaignAds.length === 0) continue;

            if (campaign.id.startsWith('sub_')) {
                // Reconcile with original card
                const subId = campaign.id.split('_')[1];
                try {
                    const existingSub = await dbService.getClientSubmissionById(Number(subId));
                    const currentLogs = existingSub?.logs || [];
                    const newLog = {
                        id: Date.now(),
                        type: 'info',
                        message: `🚀 Templates gerados com sucesso (${campaignAds.length} variações)`,
                        timestamp: new Date().toISOString(),
                        author: user?.name
                    };

                    await dbService.updateClientSubmission(Number(subId), {
                        ads: campaignAds,
                        status: 'GERADO',
                        logs: [...currentLogs, newLog]
                    });
                } catch (err) {
                    console.error(`Error updating submission ${subId}:`, err);
                }
            } else {
                // Creating a NEW submission Card
                await dbService.addClientSubmission({
                    user_id: String(selectedClientId),
                    client_name: client?.name || '',
                    profile_name: campaign.prefix.endsWith('_') ? campaign.prefix.slice(0, -1) : campaign.prefix,
                    ddd: client?.phone?.substring(0, 2) || '11',
                    template_type: 'TEXT',
                    media_url: '',
                    ad_copy: bodyText,
                    button_link: campaignAds.length > 0 ? (campaignAds[0].button_link || '') : '',
                    original_button_link: campaignAds.length > 0 ? (campaignAds[0].original_button_link || '') : '',
                    spreadsheet_url: '',
                    status: 'GERADO',
                    submitted_by: user?.name,
                    timestamp: new Date().toISOString(),
                    ads: campaignAds,
                    logs: [{
                        id: Date.now(),
                        type: 'info',
                        message: '🎉 Campanha criada via CREADOR',
                        timestamp: new Date().toISOString(),
                        author: user?.name
                    }]
                });
            }
        }

        setIsGenerating(false);
        alert(`Finalizado!\nSucesso: ${successCount}\nErros: ${errors.length}`);
        if (successCount > 0) navigate('/client-submissions');
    };

    const autoGenerateRows = (qty: number, campaignId: string) => {
        const urlButtons = buttons.filter(b => b.type === 'url');
        setCampaigns(prev => prev.map(c => {
            if (c.id !== campaignId) return c;
            const startIdx = c.rows.length + 1;
            const newRows: BulkRow[] = [];
            const firstSender = senderNumbers.split(/[\n,]/)[0]?.trim() || '';
            for (let i = 0; i < qty; i++) {
                const currentNum = startIdx + i;
                newRows.push({
                    suffix: String(currentNum).padStart(3, '0'),
                    sender: firstSender,
                    headerType: headerType,
                    mediaUrl: headerType !== 'TEXT' ? headerMediaUrl : '',
                    hasButtons: buttons.length > 0,
                    buttonUrls: urlButtons.map(b => b.url || ''),
                    buttonTexts: urlButtons.map(b => b.text || '')
                });
            }
            return { ...c, rows: [...c.rows, ...newRows] };
        }));
    };


    const applyGlobalSender = (sender: string, campaignId: string) => {
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, rows: c.rows.map(r => ({ ...r, sender })) } : c));
    };

    const applyGlobalHeaderType = (type: 'TEXT' | 'IMAGE' | 'VIDEO', campaignId: string) => {
        setCampaigns(prev => prev.map(c => c.id === campaignId ? {
            ...c, rows: c.rows.map(r => ({
                ...r,
                headerType: type,
                mediaUrl: type !== 'TEXT' ? (r.mediaUrl || headerMediaUrl) : ''
            }))
        } : c));
    };

    const applyGlobalButtons = (hasButtons: boolean, campaignId: string) => {
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, rows: c.rows.map(r => ({ ...r, hasButtons })) } : c));
    };

    const duplicateRow = (campaignId: string, rowIndex: number) => {
        const copiesStr = window.prompt("Quantas cópias deseja criar?", "1");
        const copiesCount = parseInt(copiesStr || "0");
        if (isNaN(copiesCount) || copiesCount <= 0) return;
        setCampaigns(prev => prev.map(c => {
            if (c.id !== campaignId) return c;
            const rowToCopy = c.rows[rowIndex];
            const newRows = Array(copiesCount).fill(null).map(() => ({
                ...rowToCopy,
                buttonTexts: [...rowToCopy.buttonTexts],
                buttonUrls: [...rowToCopy.buttonUrls]
            }));
            const finalRows = [...c.rows];
            finalRows.splice(rowIndex + 1, 0, ...newRows);
            return { ...c, rows: finalRows };
        }));
    };

    const deleteRow = (campaignId: string, rowIndex: number) => {
        setCampaigns(prev => prev.map(c => {
            if (c.id !== campaignId) return c;
            const nRows = [...c.rows];
            nRows.splice(rowIndex, 1);
            return { ...c, rows: nRows };
        }));
    };

    const [utilityLinkOriginal, setUtilityLinkOriginal] = useState('');
    const [utilityLinkShort, setUtilityLinkShort] = useState('');
    const [isShorteningUtility, setIsShorteningUtility] = useState(false);

    const handleUtilityShorten = async () => {
        if (!utilityLinkOriginal || (!utilityLinkOriginal.startsWith('http') && !utilityLinkOriginal.includes('.'))) return alert("Insira um link válido.");
        if (!selectedClientId) return alert("Selecione um cliente.");
        setIsShorteningUtility(true);
        try {
            const res = await dbService.createShortLink({
                user_id: user?.id,
                client_id: Number(selectedClientId),
                original_url: utilityLinkOriginal,
                title: `Utility: ${campaigns[0]?.prefix || 'Bulk'}`
            });
            if (res.shortUrl) setUtilityLinkShort(res.shortUrl);
        } catch (err) { alert("Erro ao encurtar link."); } finally { setIsShorteningUtility(false); }
    };

    const applyUtilityLinkToAll = (btnIdx: number) => {
        if (!utilityLinkShort) return alert("Encurte um link primeiro.");
        const confirmApply = window.confirm(`Aplicar no botão ${btnIdx + 1} de todas as campanhas?`);
        if (!confirmApply) return;
        setCampaigns(prev => prev.map(c => ({
            ...c,
            rows: c.rows.map(row => {
                const newUrls = [...row.buttonUrls];
                newUrls[btnIdx] = utilityLinkShort;
                return { ...row, buttonUrls: newUrls };
            })
        })));
    };

    return (
        <Fragment>
            {isGenerating && (
                <div className="loading-overlay">
                    <div className="pulse-loader">
                        <Activity size={40} className="animate-spin" />
                    </div>
                    <div className="flex flex-col items-center gap-1 animate-fade-in">
                        <div className="loading-text" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px', textAlign: 'center', color: 'white' }}>
                            {generatingProgress.total > 1 ? "CRIANDO TEMPLATES EM MASSA" : "PUBLICANDO NA INFOBIP"}
                        </div>
                        <div className="loading-subtext" style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: 500, color: 'white' }}>
                            {generatingProgress.total > 1 ? `${generatingProgress.current} de ${generatingProgress.total} - ${generatingProgress.msg}` : "Aguarde a validação da Meta..."}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                * { box-sizing: border-box !important; }
                .creator-page { overflow-x: hidden !important; width: 100% !important; max-width: 100vw !important; }
                .creator-layout { display: grid; grid-template-columns: 1fr 420px; gap: 48px; align-items: start; }
                
                @media (max-width: 1100px) {
                    .creator-layout { grid-template-columns: 1fr; gap: 32px; }
                    .preview-sticky { position: static !important; }
                }

                .glass-card {
                    background: var(--card-bg-subtle);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--surface-border-subtle);
                    box-shadow: var(--shadow-md);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    padding: 32px;
                    border-radius: 24px;
                }
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
                
                .bulk-table { width: 100%; border-collapse: separate; border-spacing: 0 16px; margin-top: 24px; }
                .bulk-table th { text-align: left; padding: 16px 12px; color: var(--primary-color); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 1000; opacity: 0.9; }
                .bulk-table td { padding: 12px 6px; vertical-align: middle; }
                .bulk-table tr { background: rgba(255, 255, 255, 0.04); border-radius: 16px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .bulk-table tr:hover { background: rgba(255, 255, 255, 0.08); transform: scale(1.002); }
                .bulk-row-input {
                    background: rgba(255, 255, 255, 0.06) !important;
                    border: 1px solid rgba(255, 255, 255, 0.12) !important;
                    border-radius: 12px !important;
                    padding: 10px 16px !important;
                    color: white !important;
                    font-size: 0.95rem !important;
                    width: 100%;
                    height: 44px !important;
                    outline: none !important;
                    transition: all 0.2s ease;
                }
                .bulk-row-input:focus { border-color: var(--primary-color) !important; background: rgba(255, 255, 255, 0.1) !important; box-shadow: 0 0 15px rgba(172, 248, 0, 0.1) !important; }
                .bulk-prefix-input {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 6px 14px;
                    color: var(--primary-color);
                    font-weight: 800;
                    font-size: 1.1rem;
                    outline: none;
                    transition: all 0.2s;
                    min-width: 180px;
                }
                .bulk-prefix-input:focus { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.05); }
                .error-border { border-color: #ff4444 !important; box-shadow: 0 0 10px rgba(255, 68, 68, 0.2) !important; }

                @media (max-width: 768px) {
                    .creator-layout { grid-template-columns: 1fr !important; gap: 16px !important; width: 100% !important; margin: 0 !important; }
                    .glass-card { padding: 16px !important; border-radius: 12px !important; }
                    .button-editor { flex-direction: column !important; align-items: stretch !important; }
                    .bulk-table-container { 
                        padding: 0 !important; 
                        border-radius: 12px !important; 
                        overflow-x: auto !important; 
                        width: 100% !important; 
                        background: rgba(255,255,255,0.02);
                        border: 1px solid var(--surface-border-subtle) !important; 
                    }
                    .bulk-table { 
                        min-width: 700px !important; 
                        margin-top: 0 !important;
                    }
                    .bulk-table th { font-size: 0.65rem !important; padding: 12px 8px !important; }
                    .bulk-table td { padding: 8px 4px !important; }
                    .bulk-row-input { font-size: 0.85rem !important; padding: 8px 10px !important; height: 38px !important; }
                    .wp-bubble { padding: 12px !important; border-radius: 16px !important; }
                    .var-grid { grid-template-columns: 1fr !important; }
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
                .input-field {
                    background: rgba(255, 255, 255, 0.04) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    color: white !important;
                    border-radius: 10px !important;
                    padding: 8px 12px !important;
                    outline: none !important;
                    transition: all 0.2s !important;
                    width: 100%;
                }
                .input-field:focus {
                    border-color: var(--primary-color) !important;
                    background: rgba(172, 248, 0, 0.05) !important;
                }
                select, option {
                    background-color: #000 !important;
                    color: #fff !important;
                }
                label { 
                    color: var(--primary-color) !important;
                    opacity: 0.8 !important;
                    font-weight: 900 !important;
                    letter-spacing: 0.5px !important;
                    display: block;
                    margin-bottom: 8px;
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
                <div className="flex flex-col mb-10">
                    <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.4rem, 6vw, 2.4rem)', letterSpacing: '-1.5px', lineHeight: 1 }}>Templates WhatsApp</h1>
                    <p className="subtitle" style={{ fontSize: 'clamp(0.75rem, 3.5vw, 1rem)', opacity: 0.6 }}>Criação oficial via Infobip Cloud</p>
                </div>

                <div className="creator-layout mt-8" style={{ gap: '48px' }}>
                    <div className="flex flex-col" style={{ gap: '24px' }}>
                        <div className="glass-card flex flex-col gap-6 animate-fade-in" style={{ marginBottom: '16px' }}>
                            <div className="flex items-center gap-4 mb-2">
                                <div style={{ background: 'rgba(172, 248, 0, 0.1)', padding: '12px', borderRadius: '16px' }}><Plus size={24} color="var(--primary-color)" /></div>
                                <h3 style={{ margin: 0, fontWeight: 900 }}>Estrutura Básica</h3>
                            </div>
                            
                            <div className="flex items-center justify-between p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(172, 248, 0, 0.1)' }}>
                                <div className="flex flex-col">
                                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary-color)' }}>Modo 5 Variáveis</span>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Ativar template estendido</span>
                                </div>
                                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '22px', margin: 0 }}>
                                    <input 
                                        type="checkbox" 
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                        checked={isFiveVars}
                                        onChange={(e) => {
                                            const active = e.target.checked;
                                            setIsFiveVars(active);
                                            if (active) {
                                                _setBodyText('Olá {{1}}!\n\nInformamos que {{2}}.\n\n{{3}}.\n\n{{4}}.\n\nPara {{5}}, clique no botão abaixo 👇');
                                            } else {
                                                _setBodyText('Oi {{1}}! Informamos que {{2}}\n\n{{3}}\n\nPara {{4}}, clique no botão abaixo 👇');
                                            }
                                        }}
                                    />
                                    <span style={{ 
                                        position: 'absolute', cursor: 'pointer', inset: 0, 
                                        backgroundColor: isFiveVars ? 'var(--primary-color)' : '#333',
                                        transition: '.4s', borderRadius: '34px'
                                    }}>
                                        <span style={{
                                            position: 'absolute', content: '""', height: '16px', width: '16px', left: isFiveVars ? '24px' : '4px', bottom: '3px',
                                            backgroundColor: isFiveVars ? 'black' : 'white', transition: '.4s', borderRadius: '50%'
                                        }}></span>
                                    </span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label>Selecionar Cliente</label>
                                <select className="input-field" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                                    <option value="">Selecione um cliente...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="tab-btns flex gap-4" style={{ marginBottom: '32px', padding: '5px 0' }}>
                            <button className={`global-tile-btn ${activeTab === 'MODEL' ? 'global-tile-btn-primary' : 'global-tile-btn-ghost'}`} onClick={() => setActiveTab('MODEL')} style={{ flex: 1, height: '64px' }}><Layers size={18} /> GERAR INDIVIDUALMENTE</button>
                            <button className={`global-tile-btn ${activeTab === 'BULK' ? 'global-tile-btn-primary' : 'global-tile-btn-ghost'}`} onClick={() => setActiveTab('BULK')} style={{ flex: 1, height: '64px' }}><Copy size={18} /> GERAR EM MASSA</button>
                        </div>

                        {activeTab === 'MODEL' ? (
                            <div className="flex flex-col gap-8 animate-fade-in" style={{ marginTop: '10px' }}>
                                <div className="glass-card flex flex-col gap-8" style={{ marginBottom: '24px' }}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div style={{ background: 'rgba(172, 248, 0, 0.1)', padding: '12px', borderRadius: '16px' }}><Activity size={24} color="var(--primary-color)" /></div>
                                        <h3 style={{ margin: 0, fontWeight: 900 }}>Estrutura do Modelo</h3>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label>Remetentes Oficiais</label>
                                        <textarea value={senderNumbers} onChange={e => setSenderNumbers(e.target.value)} placeholder="5511999999999..." className="input-field" style={{ minHeight: '80px', fontFamily: 'monospace' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                                        <div className="flex flex-col gap-2">
                                            <label>Nome Técnico</label>
                                            <input className="input-field" value={modelName} onChange={e => setModelName(e.target.value.toLowerCase().replace(/[\s-@]/g, '_'))} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label>Idioma</label>
                                            <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)}>
                                                <option value="pt_BR">Português (BR)</option>
                                                <option value="en_US">Inglês (US)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card flex flex-col gap-6">
                                    <label>Tipo de Cabeçalho</label>
                                    <div className="flex gap-2">
                                        {(['TEXT', 'IMAGE', 'VIDEO'] as const).map(type => (
                                            <button key={type} onClick={() => setHeaderType(type)} className={`global-tile-btn ${headerType === type ? 'global-tile-btn-primary' : 'global-tile-btn-ghost'}`} style={{ flex: 1 }}>{type === 'TEXT' ? 'SEM' : type}</button>
                                        ))}
                                    </div>
                                    {headerType !== 'TEXT' && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            <label>URL da Mídia</label>
                                            <div className="flex gap-2">
                                                <input className="input-field" value={headerMediaUrl} onChange={e => setHeaderMediaUrl(e.target.value)} placeholder="https://..." style={{ flex: 1 }} />
                                                <button className="global-tile-btn global-tile-btn-ghost" onClick={() => document.getElementById('media-upload')?.click()}>
                                                    {isUploading ? <Activity className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                                                </button>
                                                <input id="media-upload" type="file" style={{ display: 'none' }} accept={headerType === 'IMAGE' ? "image/*" : "video/*"} onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-4 flex flex-col gap-2"><label>Corpo da Mensagem (Body)</label><textarea className="input-field" style={{ minHeight: '120px' }} value={bodyText} onChange={e => _setBodyText(e.target.value)} /></div>
                                    <div className="mt-2 flex flex-col gap-2"><label>Rodapé (Footer)</label><input className="input-field" value={footerText} onChange={e => _setFooterText(e.target.value)} /></div>
                                </div>

                                <div className="glass-card flex flex-col gap-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1rem' }}>Botões Interativos</h3>
                                        <button className="global-tile-btn global-tile-btn-primary" onClick={handleAddButton} style={{ padding: '6px 12px', fontSize: '10px' }}><Plus size={14} /> ADICIONAR</button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {buttons.map((btn, idx) => (
                                            <div key={idx} className="button-editor">
                                                <select className="input-field" style={{ width: '120px', padding: '8px' }} value={btn.type} onChange={e => handleUpdateButton(idx, 'type', e.target.value as any)}>
                                                    <option value="url">Link</option>
                                                    <option value="reply">Resposta</option>
                                                </select>
                                                <input className="input-field" style={{ flex: 1, padding: '8px' }} value={btn.text} onChange={e => handleUpdateButton(idx, 'text', e.target.value)} placeholder="Texto" />
                                                {btn.type === 'url' && <input className="input-field" style={{ flex: 1.5, padding: '8px' }} value={btn.url || ''} onChange={e => handleUpdateButton(idx, 'url', e.target.value)} placeholder="https://" />}
                                                <button onClick={() => handleRemoveButton(idx)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0 5px' }}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button className="global-tile-btn global-tile-btn-primary" onClick={handleCreateModel} disabled={isGenerating} style={{ padding: '20px', borderRadius: '16px', fontSize: '1rem', fontWeight: 900 }}>
                                    {isGenerating ? <Activity className="animate-spin" /> : '🚀 PUBLICAR MODELO NA INFOBIP'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col animate-fade-in" style={{ gap: '32px', marginTop: '10px' }}>
                                <div className="glass-card flex flex-col gap-6" style={{ marginBottom: '16px' }}>
                                    <div className="flex items-center gap-3"><Link size={18} color="var(--primary-color)" /><h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>Encurtador de Links</h3></div>
                                    <div className="flex gap-4">
                                        <input className="bulk-field-input" placeholder="Deseja encurtar alguma URL?" value={utilityLinkOriginal} onChange={e => setUtilityLinkOriginal(e.target.value)} />
                                        <button className="global-tile-btn global-tile-btn-primary" onClick={handleUtilityShorten} disabled={isShorteningUtility || !utilityLinkOriginal} style={{ minWidth: '120px' }}>{isShorteningUtility ? '...' : 'ENCURTAR'}</button>
                                    </div>
                                    {utilityLinkShort && (
                                        <div className="flex gap-2 animate-fade-in">{buttons.filter(b => b.type === 'url').map((_, idx) => (
                                            <button key={idx} onClick={() => applyUtilityLinkToAll(idx)} className="global-tile-btn global-tile-btn-ghost" style={{ fontSize: '10px' }}>APLICAR NO B{idx + 1}</button>
                                        ))}</div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center" style={{ marginTop: '24px', marginBottom: '16px' }}><h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.2rem' }}>Campanhas Multi-Gerador</h3><div className="flex gap-4"><button className="global-tile-btn global-tile-btn-ghost" onClick={() => setCampaigns([{ id: Date.now().toString(), prefix: 'nome_campanha_1_', rows: [] }])}>LIMPAR</button><button className="global-tile-btn global-tile-btn-primary " onClick={() => setCampaigns([...campaigns, { id: Date.now().toString(), prefix: `nome_campanha_${campaigns.length + 1}_`, rows: [] }])}><Plus size={16} /> NOVA CAMPANHA</button></div></div>

                                {campaigns.map((camp, cIdx) => (
                                    <div key={camp.id} className="glass-card flex flex-col gap-8 animate-fade-in">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, collapsed: !c.collapsed } : c))} className="global-tile-btn global-tile-btn-ghost" style={{ width: '32px', height: '32px', padding: 0 }}>
                                                    {camp.collapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                                </button>
                                                <div style={{ background: 'var(--primary-color)', color: 'black', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem' }}>{cIdx + 1}</div>
                                                <input className={`bulk-prefix-input ${campaigns.filter(c => c.prefix.trim() !== "" && c.prefix.trim().toLowerCase() === camp.prefix.trim().toLowerCase()).length > 1 ? 'error-border' : ''}`} value={camp.prefix} onChange={e => { const val = e.target.value.toLowerCase().replace(/[\s-@]/g, '_'); setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, prefix: val } : c)); }} />
                                                <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 700 }}>{camp.rows.length} ANÚNCIOS</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {campaigns.length > 1 && (
                                                    <button onClick={() => setCampaigns(campaigns.filter(c => c.id !== camp.id))} className="global-tile-btn global-tile-btn-ghost" style={{ width: '44px', height: '44px', padding: 0 }} title="Remover Campanha">
                                                        <Trash2 size={24} stroke="white" strokeWidth={3} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {!camp.collapsed && (
                                            <div className="flex flex-col gap-8 animate-slide-up">
                                                <div className="flex gap-4 items-end"><div className="flex-1"><label>Adicionar Anúncios</label><div className="flex gap-2"><input type="number" className="bulk-field-input" value={queueSize} onChange={e => setQueueSize(parseInt(e.target.value) || 1)} style={{ width: '80px', textAlign: 'center' }} /><button className="global-tile-btn global-tile-btn-primary" onClick={() => autoGenerateRows(queueSize, camp.id)}>GERAR {queueSize} LINHAS</button></div></div></div>
                                                {camp.rows.length > 0 && (
                                                    <div className="mt-4 animate-fade-in">
                                                        <div className="flex flex-col gap-4 mb-6" style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(172, 248, 0, 0.1)' }}>
                                                            <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '1px', textTransform: 'uppercase' }}>Painel de Configuração Rápida</span>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                <div className="flex flex-col gap-2">
                                                                    <label style={{ fontSize: '10px' }}>REMETENTE GLOBAL</label>
                                                                    <div className="flex gap-2">
                                                                        <input id={`global-sender-${camp.id}`} className="bulk-row-input" style={{ height: '38px' }} placeholder="Ex: 55119..." />
                                                                        <button className="global-tile-btn global-tile-btn-primary" onClick={() => {
                                                                            const val = (document.getElementById(`global-sender-${camp.id}`) as HTMLInputElement)?.value;
                                                                            if (val) applyGlobalSender(val, camp.id);
                                                                        }} style={{ minWidth: '80px' }}>APLICAR</button>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    <label style={{ fontSize: '10px' }}>MÍDIA GLOBAL</label>
                                                                    <div className="flex gap-1">{(['TEXT', 'IMAGE', 'VIDEO'] as const).map(t => (<button key={t} onClick={() => applyGlobalHeaderType(t, camp.id)} className="global-tile-btn global-tile-btn-ghost" style={{ flex: 1, fontSize: '10px' }}>{t}</button>))}</div>
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    <label style={{ fontSize: '10px' }}>BOTÕES GLOBAIS</label>
                                                                    <div className="flex gap-1"><button onClick={() => applyGlobalButtons(true, camp.id)} className="global-tile-btn global-tile-btn-ghost" style={{ flex: 1, fontSize: '10px' }}>LIGAR BOTÕES</button><button onClick={() => applyGlobalButtons(false, camp.id)} className="global-tile-btn global-tile-btn-ghost" style={{ flex: 1, fontSize: '10px' }}>DESLIGAR</button></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ overflowX: 'auto', borderRadius: '12px' }}><table className="bulk-table"><thead><tr><th>SUFIXO</th><th>SENDER</th><th>TIPO</th><th>BOTÃO</th>{buttons.filter(b => b.type === 'url').map((_, i) => <Fragment key={i}><th>NOME B{i + 1}</th><th>LINK B{i + 1}</th></Fragment>)}<th>AÇÕES</th></tr></thead><tbody>{camp.rows.map((row, rIdx) => {
                                                            const fullName = `${camp.prefix}${row.suffix}`.toLowerCase().trim();
                                                            const allNames: string[] = [];
                                                            campaigns.forEach(c => c.rows.forEach(r => allNames.push(`${c.prefix}${r.suffix}`.toLowerCase().trim())));
                                                            const isFullDuplicate = fullName !== "" && allNames.filter(n => n === fullName).length > 1;
                                                            const isSuffixDuplicateInCamp = camp.rows.some((r, i) => i !== rIdx && r.suffix.trim().toLowerCase() === row.suffix.trim().toLowerCase() && row.suffix.trim() !== "");
                                                            const isError = isFullDuplicate || isSuffixDuplicateInCamp;

                                                            return (<tr key={rIdx} style={{ opacity: row.hasButtons === false ? 0.7 : 1 }}><td><input className={`bulk-row-input ${isError ? 'error-border' : ''}`} value={row.suffix} title={isError ? "Este nome completo ou sufixo já existe!" : ""} onChange={e => { const n = [...camp.rows]; n[rIdx].suffix = e.target.value.toLowerCase().replace(/[\s-@]/g, '_'); setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }} /></td><td><input className="bulk-row-input" value={row.sender} onChange={e => { const n = [...camp.rows]; n[rIdx].sender = e.target.value; setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }} /></td><td><select className="bulk-row-input" value={row.headerType} onChange={e => { const n = [...camp.rows]; n[rIdx].headerType = e.target.value as any; setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }}><option value="TEXT">SEM</option><option value="IMAGE">IMG</option><option value="VIDEO">VID</option></select></td><td><select className="bulk-row-input" value={row.hasButtons ? 'COM' : 'SEM'} onChange={e => { const n = [...camp.rows]; n[rIdx].hasButtons = e.target.value === 'COM'; setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }}><option value="COM">COM</option><option value="SEM">SEM</option></select></td>{buttons.filter(b => b.type === 'url').map((_, urlIdx) => (<Fragment key={urlIdx}><td><input className="bulk-row-input" style={{ opacity: row.hasButtons === false ? 0.3 : 1 }} disabled={row.hasButtons === false} value={row.buttonTexts[urlIdx] || ''} onChange={e => { const n = [...camp.rows]; n[rIdx].buttonTexts[urlIdx] = e.target.value; setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }} /></td><td><input className="bulk-row-input" style={{ opacity: row.hasButtons === false ? 0.3 : 1 }} disabled={row.hasButtons === false} value={row.buttonUrls[urlIdx] || ''} onChange={e => { const n = [...camp.rows]; n[rIdx].buttonUrls[urlIdx] = e.target.value; setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }} /></td></Fragment>))}<td><div className="flex gap-3" style={{ position: 'relative', zIndex: 100, minWidth: '120px', justifyContent: 'center' }}><button className="global-tile-btn global-tile-btn-ghost" style={{ width: '52px', height: '52px', padding: 0, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => duplicateRow(camp.id, rIdx)} title="Duplicar"><Edit2 size={28} color="#FFFFFF" strokeWidth={3} /></button><button className="global-tile-btn global-tile-btn-ghost" style={{ width: '52px', height: '52px', padding: 0, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => { if (window.confirm("Remover esta linha?")) deleteRow(camp.id, rIdx); }} title="Excluir"><Trash2 size={28} color="#FFFFFF" strokeWidth={3} /></button></div></td></tr>);
                                                        })}</tbody></table></div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button
                                    className="global-tile-btn global-tile-btn-primary mt-12 mb-12"
                                    onClick={handleGenerateBulk}
                                    disabled={isGenerating || campaigns.every(c => c.rows.length === 0) || hasValidationErrors}
                                    style={{ padding: '24px', borderRadius: '24px', fontSize: '1.2rem', fontWeight: 900, width: '100%' }}
                                >
                                    <Activity size={24} className={isGenerating ? "animate-spin" : ""} />
                                    🚀 GERAR TODAS AS CAMPANHAS AGORA
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="preview-sticky">
                        <div className="glass-card" style={{ border: '1px solid var(--primary-color)', background: 'rgba(172, 248, 0, 0.02)' }}>
                            <div className="flex items-center gap-2 mb-6"><Smartphone size={20} color="var(--primary-color)" /><h3 style={{ margin: 0, fontWeight: 800 }}>Preview no Aparelho</h3></div>
                            <div className="wp-bubble mx-auto">
                                <div className="wp-content">
                                    {headerType !== 'TEXT' && (
                                        <div style={{ height: '140px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {headerType === 'IMAGE' ? <ImageIcon size={40} color="#9ca3af" /> : <Video size={40} color="#9ca3af" />}
                                        </div>
                                    )}
                                    <div style={{ padding: '14px' }}>
                                        <span style={{ color: '#8696a0', fontSize: '0.7rem' }}>disparando como {senderNumbers.split(/[\n,]/)[0] || '...'}</span>
                                        <div style={{ color: 'white', fontSize: '0.9rem', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
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
        </Fragment>
    );
};

export default TemplateCreator;
