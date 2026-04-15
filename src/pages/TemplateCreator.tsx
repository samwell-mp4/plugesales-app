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
    buttonUrls: string[];
    buttonTexts: string[];
    originalButtonUrls?: string[];
    variables?: string[];
};

interface CampaignBatch {
    id: string;
    prefix: string;
    rows: BulkRow[];
    collapsed?: boolean;
}

// --- LEANDRO STANDARD CONSTANTS (STRICT API DEFAULTS) ---
const LEANDRO_BODY_4 = 'Oi {{1}}!\n\nInformamos que {{2}}.\n\n{{3}}.\n\nPara {{4}}, clique  no  botão  abaixo 👇';
const LEANDRO_BODY_5 = 'Oi {{1}}!\n\nInformamos que {{2}}.\n\n{{3}}.\n\n{{4}}.\n\nPara {{5}}, clique  no  botão  abaixo 👇';
const LEANDRO_BODY_4_EN = 'Hi {{1}}!\n\nWe inform you that {{2}}.\n\n{{3}}.\n\nTo {{4}}, click the button below 👇';
const LEANDRO_BODY_5_EN = 'Hello {{1}}!\n\nWe inform you that {{2}}.\n\n{{3}}.\n\n{{4}}.\n\nTo {{5}}, click the button below 👇';
const LEANDRO_FOOTER = 'Digite "sair" para não receber mais mensagens';
const LEANDRO_EXAMPLES = [
    "Leandro", // {{1}}
    "recebemos a confirmação do pagamento referente ao protocolo nº 7164427, realizado em 12/10/2025", // {{2}}
    "O comprovante digital já se encontra disponível para conferência", // {{3}}
    "acessar o comprovante digital #54333 e verificar a entrega", // {{4}}
    "ver o comprovante digital #76632353 e verificar a entrega"   // {{5}}
];

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

            // Carrega configurações globais da Infobip para ADMINs/EMPLOYEEs
            // que não têm chave própria cadastrada no perfil
            dbService.getSettings().then(settings => {
                if (!user?.infobip_key && settings['infobip_key']) {
                    setApiKey(settings['infobip_key']);
                }
                if (!user?.infobip_sender && settings['infobip_sender']) {
                    setSenderNumbers(settings['infobip_sender']);
                }
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
        // Fallback to global settings for ADMIN/EMPLOYEE without a personal key
        else if (user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') {
            dbService.getSettings().then(settings => {
                if (settings['infobip_key']) setApiKey(settings['infobip_key']);
            });
        }

        if (location.state?.sender) {
            setSenderNumbers(location.state.sender);
        } else if (user?.infobip_sender) {
            setSenderNumbers(user.infobip_sender);
        }
        // Fallback to global settings for ADMIN/EMPLOYEE without a personal sender
        else if (user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') {
            dbService.getSettings().then(settings => {
                if (settings['infobip_sender']) setSenderNumbers(settings['infobip_sender']);
            });
        }

        if (location.state?.preFillData) {
            const data = location.state.preFillData;
            if (data.templateName) setModelName(data.templateName);
            if (data.senderNumber) setSenderNumbers(data.senderNumber);
            if (data.clientId) setSelectedClientId(data.clientId);
            if (data.bodyText) {
                _setBodyText(data.bodyText);
                const varMatch = data.bodyText.match(/\{\{(\d+)\}\}/g) || [];
                if (varMatch.length >= 5) setIsFiveVars(true);
            }
            if (data.language) setSelectedPayloadLanguage(data.language);

            if (data.campaigns && Array.isArray(data.campaigns) && data.campaigns.length > 0) {
                const initializedCampaigns = data.campaigns.map((camp: any) => ({
                    ...camp,
                    id: camp.id || Date.now().toString() + Math.random(),
                    rows: (camp.rows || []).map((row: any) => ({
                        ...row,
                        headerType: row.headerType || data.templateType || 'TEXT',
                        buttonUrls: row.buttonUrls || (row.buttonUrl ? [row.buttonUrl] : []),
                        buttonTexts: row.buttonTexts || (row.buttonUrl ? ['Clique Aqui'] : []),
                        variables: row.variables || []
                    }))
                }));
                setCampaigns(initializedCampaigns);

                if (initializedCampaigns[0]?.rows?.[0]) {
                    const firstRow = initializedCampaigns[0].rows[0];
                    if (firstRow.mediaUrl) setHeaderMediaUrl(firstRow.mediaUrl);

                    const firstUrls = firstRow.buttonUrls || (firstRow.buttonUrl ? [firstRow.buttonUrl] : []);
                    const firstTexts = firstRow.buttonTexts || (firstRow.buttonUrl ? ['Clique Aqui'] : []);

                    if (firstUrls.length > 0) {
                        setButtons(firstUrls.map((url: string, i: number) => ({
                            type: 'url',
                            text: firstTexts[i] || 'Clique Aqui',
                            url: url
                        })));
                    }

                    if (firstRow.variables && firstRow.variables.length > 0) {
                        _setVariablesExample(firstRow.variables);
                    }
                }
            } else if (data.rows && Array.isArray(data.rows) && data.rows.length > 0) {
                const initializedRows = data.rows.map((row: any) => ({
                    ...row,
                    headerType: row.headerType || data.templateType || 'TEXT',
                    buttonUrls: row.buttonUrls || (row.buttonUrl ? [row.buttonUrl] : []),
                    buttonTexts: row.buttonTexts || (row.buttonUrl ? ['Clique Aqui'] : []),
                    variables: row.variables || []
                }));
                setCampaigns([{
                    id: Date.now().toString(),
                    prefix: data.campaignPrefix || 'nome_campanha_1_',
                    rows: initializedRows
                }]);

                if (initializedRows[0]?.mediaUrl) setHeaderMediaUrl(initializedRows[0].mediaUrl);

                const firstUrls = initializedRows[0].buttonUrls || (initializedRows[0].buttonUrl ? [initializedRows[0].buttonUrl] : []);
                const firstTexts = initializedRows[0].buttonTexts || (initializedRows[0].buttonUrl ? ['Clique Aqui'] : []);

                if (firstUrls.length > 0) {
                    setButtons(firstUrls.map((url: string, i: number) => ({
                        type: 'url',
                        text: firstTexts[i] || 'Clique Aqui',
                        url: url
                    })));
                }

                // Set global variables from the first row for preview/MODEL mode
                if (initializedRows[0]?.variables && initializedRows[0].variables.length > 0) {
                    _setVariablesExample(initializedRows[0].variables);
                }
            }
        }
    }, [location.state, user]);

    // --- MODEL STATE ---
    const [modelName, setModelName] = useState('pagamento_confirmado');
    const [selectedPayloadLanguage, setSelectedPayloadLanguage] = useState('en_US');

    const [headerType, setHeaderType] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('TEXT');
    const [headerMediaUrl, setHeaderMediaUrl] = useState('https://iili.io/B7sl2Kg.jpg');

    const [bodyText, _setBodyText] = useState('Oi {{1}}! Informamos que {{2}}\n\n{{3}}\n\nPara {{4}}, clique no botão abaixo 👇');
    const [footerText, _setFooterText] = useState('Digite "sair" para não receber mais mensagens');

    const defaultVars = ['', '', '', ''];
    const [variablesExample, _setVariablesExample] = useState(defaultVars);
    const [isFiveVars, setIsFiveVars] = useState(false);
    const [showIndividualDetails, setShowIndividualDetails] = useState(false);

    const [buttons, setButtons] = useState<ButtonDef[]>([
        { type: 'url', text: 'Clique Aqui', url: '' }
    ]);

    const [copyCount] = useState(1);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0, msg: '' });
    const [queueSize, setQueueSize] = useState(5);
    const [campaigns, setCampaigns] = useState<CampaignBatch[]>([{ id: Date.now().toString(), prefix: 'nome_campanha_1_', rows: [] }]);
    const [selectedCategory, setSelectedCategory] = useState<'UTILITY' | 'MARKETING'>('UTILITY');
    const [operationErrors, setOperationErrors] = useState<{ name: string, error: string, payload?: any, timestamp: string }[]>([]);
    const [currentPages, setCurrentPages] = useState<{ [campaignId: string]: number }>({});
    const rowsPerPage = 10;

    // --- CUSTOM CONFIRM MODAL (replaces window.confirm which is blocked on mobile) ---
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
    const pendingConfirmResolve = useState<((val: boolean) => void) | null>(null);
    const showConfirm = (message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            pendingConfirmResolve[1](() => resolve);
            setConfirmModal({ open: true, message });
        });
    };
    const handleConfirmResponse = (result: boolean) => {
        setConfirmModal({ open: false, message: '' });
        if (pendingConfirmResolve[0]) {
            pendingConfirmResolve[0](result);
            pendingConfirmResolve[1](null);
        }
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

    const buildInfobipPayload = (name: string, overrideLanguage?: string, overrideHeaderType?: 'TEXT' | 'IMAGE' | 'VIDEO', mediaUrl?: string, buttonUrlOverrides?: string[], overrideHasButtons?: boolean, buttonTextOverrides?: string[]) => {
        const lang = overrideLanguage || selectedPayloadLanguage;

        // --- LEANDRO STANDARD ENFORCEMENT ---
        const bodyValue = isFiveVars ? LEANDRO_BODY_5 : LEANDRO_BODY_4;
        const varCount = isFiveVars ? 5 : 4;
        const examples = LEANDRO_EXAMPLES.slice(0, varCount);

        const structure: any = {
            body: {
                text: bodyValue,
                examples: examples
            }
        };

        const effectiveHeaderType = overrideHeaderType || headerType;

        if (effectiveHeaderType === 'TEXT') {
            structure.header = {
                format: 'TEXT',
                text: name, // Nome da Campanha
                example: name // Algumas versões da API exigem o campo example mesmo sem variáveis
            };
        } else {
            const format = effectiveHeaderType.toUpperCase();
            const mediaUrlValue = (mediaUrl || headerMediaUrl)?.trim() || "https://iili.io/B7sl2Kg.jpg";
            structure.header = {
                format: format,
                example: mediaUrlValue
            };
        }

        structure.footer = { text: LEANDRO_FOOTER };

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
                } else if (btn.type === 'reply') {
                    bPayload.payload = btn.text || 'REPLY_PAYLOAD';
                }
                return bPayload;
            });
        }

        return {
            name: name,
            language: lang,
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

            let result;
            try {
                result = await response.json();
            } catch (e) {
                result = { error: 'Resposta da API não é um JSON válido.' };
            }

            if (response.ok) {
                return { success: true, data: result };
            } else {
                console.error("Infobip API Error Response:", result);
                const apiError = result.requestError?.serviceException?.text ||
                    result.requestError?.serviceException?.message ||
                    result.errorMessage ||
                    (typeof result === 'string' ? result : JSON.stringify(result)) ||
                    `Erro HTTP ${response.status}: ${response.statusText}`;
                return { success: false, error: apiError };
            }
        } catch (err: any) {
            console.error("Fetch Exception:", err);
            return { success: false, error: `Falha na requisição: ${err.message || 'Erro desconhecido de rede'}` };
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

        let totalSuccess = 0;
        let lastError = '';
        const totalOps = targetNumbers.length * copyCount;
        let currentOp = 0;

        setIsGenerating(true);
        try {
            for (const sender of targetNumbers) {
                for (let i = 1; i <= copyCount; i++) {
                    currentOp++;
                    const currentName = copyCount > 1 ? `${sanitizedBaseName}_${String(i).padStart(3, '0')}` : sanitizedBaseName;
                    setGeneratingProgress({ current: currentOp, total: totalOps, msg: `Publicando "${currentName}" no remetente ${sender}...` });

                    const payload = buildInfobipPayload(currentName, selectedPayloadLanguage);
                    const res = await callInfobipAPI(payload, sender);
                    if (res.success) {
                        totalSuccess++;
                        if (user?.id) await dbService.trackTemplate(currentName, user.id);
                        const isInternalUser = ['ADMIN', 'EMPLOYEE'].includes(user?.role || '');
                        dbService.addLog({
                            logType: 'TEMPLATE',
                            name: currentName,
                            author: user?.name,
                            mode: 'SINGLE',
                            userId: isInternalUser ? undefined : Number(selectedClientId)
                        });
                        await sendToWebhook(payload);

                        const client = clients.find(c => String(c.id) === String(selectedClientId));
                        await dbService.addClientSubmission({
                            user_id: isInternalUser ? undefined : selectedClientId,
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
                            submitted_role: user?.role,
                            assigned_to: user?.name,
                            accepted_by: user?.name,
                            timestamp: new Date().toISOString(),
                            language: selectedPayloadLanguage,
                            origin: 'TEMPLATE_CREATOR',
                            ads: [{
                                ad_name: currentName,
                                template_type: headerType,
                                message_mode: 'manual',
                                media_url: headerType !== 'TEXT' ? headerMediaUrl : '',
                                ad_copy: bodyText,
                                button_link: buttons.find(b => b.type === 'url')?.url || '',
                                variables: [...variablesExample],
                                delivered_leads: 0
                            }]
                        });
                    } else {
                        lastError = res.error || 'Erro desconhecido';
                        setOperationErrors(prev => [{
                            name: currentName,
                            error: lastError,
                            payload: payload,
                            timestamp: new Date().toLocaleTimeString()
                        }, ...prev].slice(0, 50));
                    }

                    if (currentOp < totalOps) await new Promise(r => setTimeout(r, 4000));
                }
            }
        } catch (err: any) {
            console.error(err);
            lastError = err.message;
        } finally {
            setIsGenerating(false);
            if (totalSuccess > 0) {
                alert(`✅ ${totalSuccess} template(s) criado(s) com sucesso!`);
                navigate('/accounts');
            } else if (lastError) {
                alert(`❌ Erro: ${lastError}`);
            }
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

        const confirmBulk = await showConfirm(`Isso irá disparar ${totalTotal} chamadas de API em ${campaigns.length} campanhas. Continuar?`);
        if (!confirmBulk) {
            setIsGenerating(false);
            return;
        }

        setIsGenerating(true);
        let successCount = 0;
        let errors = [];
        // Map to store ads grouped by campaign ID
        const adsByCampaignId: { [key: string]: any[] } = {};
        campaigns.forEach(c => adsByCampaignId[c.id] = []);

        let currentOpTotal = 0;
        try {
            for (let cIdx = 0; cIdx < campaigns.length; cIdx++) {
                const campaign = campaigns[cIdx];
                for (let i = 0; i < campaign.rows.length; i++) {
                    currentOpTotal++;
                    const row = campaign.rows[i];
                    const name = `${campaign.prefix}${row.suffix}`.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/__+/g, '_');
                    setGeneratingProgress({ current: currentOpTotal, total: totalTotal, msg: `Processando Campanha ${cIdx + 1}/${campaigns.length}: ${name}...` });

                    let finalButtonUrls = row.buttonUrls && row.buttonUrls.length > 0 ? [...row.buttonUrls] : [];
                    const finalButtonTexts = row.buttonTexts && row.buttonTexts.length > 0 ? [...row.buttonTexts] : [];

                    if (row.hasButtons !== false && finalButtonUrls.length > 0) {
                        row.originalButtonUrls = [...finalButtonUrls]; // Preserve original
                    }

                    const payload = buildInfobipPayload(name, selectedPayloadLanguage, row.headerType, row.mediaUrl, finalButtonUrls, row.hasButtons, finalButtonTexts);

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
                        const isInternalUser = ['ADMIN', 'EMPLOYEE'].includes(user?.role || '');
                        dbService.addLog({
                            logType: 'TEMPLATE',
                            name,
                            author: user?.name,
                            mode: 'BULK',
                            userId: isInternalUser ? undefined : Number(selectedClientId)
                        });
                        await sendToWebhook(extendedPayload);

                        adsByCampaignId[campaign.id].push({
                            ad_name: name,
                            template_type: row.headerType,
                            message_mode: 'manual',
                            media_url: row.headerType !== 'TEXT' ? (row.mediaUrl || headerMediaUrl || "https://iili.io/B7sl2Kg.jpg") : '',
                            ad_copy: bodyText,
                            button_link: (row.hasButtons !== false && finalButtonUrls && finalButtonUrls.length > 0) ? (finalButtonUrls[0] || '') : '',
                            original_button_link: (row.hasButtons !== false && row.originalButtonUrls && row.originalButtonUrls.length > 0) ? (row.originalButtonUrls[0] || '') : '',
                            variables: (row.variables && row.variables.length > 0) ? row.variables : [...variablesExample],
                            delivered_leads: 0,
                            price_per_msg: undefined
                        });
                    } else {
                        const errorMsg = res.error || 'Erro desconhecido';
                        errors.push(`${name}: ${errorMsg}`);
                        setOperationErrors(prev => [{
                            name,
                            error: errorMsg,
                            payload: payload,
                            timestamp: new Date().toLocaleTimeString()
                        }, ...prev].slice(0, 50));
                    }

                    if (currentOpTotal < totalTotal) await new Promise(r => setTimeout(r, 5000));
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
                            assigned_to: user?.name,
                            accepted_by: user?.name,
                            language: selectedPayloadLanguage,
                            logs: [...currentLogs, newLog]
                        });
                    } catch (err) {
                        console.error(`Error updating submission ${subId}:`, err);
                    }
                } else {
                    // Creating a NEW submission Card
                    const isInternalUser = ['ADMIN', 'EMPLOYEE'].includes(user?.role || '');
                    await dbService.addClientSubmission({
                        user_id: (isInternalUser || !selectedClientId) ? undefined : String(selectedClientId),
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
                        submitted_role: user?.role,
                        assigned_to: user?.name,
                        accepted_by: user?.name,
                        timestamp: new Date().toISOString(),
                        language: selectedPayloadLanguage,
                        ads: campaignAds,
                        logs: [{
                            id: Date.now(),
                            type: 'info',
                            message: '🎉 Campanha criada via CREADOR',
                            timestamp: new Date().toISOString(),
                            author: user?.name
                        }],
                        origin: 'TEMPLATE_CREATOR'
                    });
                }
            }
        } catch (err: any) {
            console.error(err);
            errors.push(`Erro geral: ${err.message}`);
        } finally {
            setIsGenerating(false);
        }

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
                    headerType: 'TEXT',
                    mediaUrl: headerType !== 'TEXT' ? headerMediaUrl : '',
                    hasButtons: buttons.length > 0,
                    buttonUrls: urlButtons.map(b => b.url || ''),
                    buttonTexts: urlButtons.map(b => b.text || ''),
                    variables: []
                });
            }
            return { ...c, rows: [...c.rows, ...newRows] };
        }));
    };


    const applyGlobalSender = (sender: string, campaignId: string) => {
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, rows: c.rows.map(r => ({ ...r, sender })) } : c));
    };

    const applySenderToAllCampaigns = () => {
        const firstSender = senderNumbers.split(/[\n,]/)[0]?.trim() || '';
        const sender = window.prompt("Digite o número (BM) para aplicar em TODAS as campanhas:", firstSender);
        if (!sender) return;
        setCampaigns(prev => prev.map(c => ({
            ...c,
            rows: c.rows.map(r => ({ ...r, sender }))
        })));
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
                buttonTexts: [], // CLEAR TEXTS
                buttonUrls: [],  // CLEAR URLS
                originalButtonUrls: []
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

    const applyUtilityLinkToAll = async (btnIdx: number) => {
        if (!utilityLinkShort) return alert("Encurte um link primeiro.");
        const confirmApply = await showConfirm(`Aplicar no botão ${btnIdx + 1} de todas as campanhas?`);
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
            {/* CUSTOM CONFIRM MODAL */}
            {confirmModal.open && (
                <div className="custom-confirm-overlay">
                    <div className="custom-confirm-box">
                        <div className="custom-confirm-msg">{confirmModal.message}</div>
                        <div className="custom-confirm-btns">
                            <button className="custom-confirm-cancel" onClick={() => handleConfirmResponse(false)}>Cancelar</button>
                            <button className="custom-confirm-ok" onClick={() => handleConfirmResponse(true)}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

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
                /* --- CUSTOM CONFIRM MODAL --- */
                .custom-confirm-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.75);
                    backdrop-filter: blur(8px);
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .custom-confirm-box {
                    background: #111;
                    border: 1px solid rgba(172, 248, 0, 0.25);
                    border-radius: 20px;
                    padding: 28px 24px;
                    max-width: 380px;
                    width: 100%;
                    box-shadow: 0 0 60px rgba(172, 248, 0, 0.15);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .custom-confirm-msg {
                    color: white;
                    font-size: 1rem;
                    font-weight: 700;
                    text-align: center;
                    line-height: 1.5;
                }
                .custom-confirm-btns {
                    display: flex;
                    gap: 12px;
                }
                .custom-confirm-btns button {
                    flex: 1;
                    height: 48px;
                    border-radius: 12px;
                    font-weight: 900;
                    font-size: 0.85rem;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                    border: none;
                    text-transform: uppercase;
                }
                .custom-confirm-ok { background: var(--primary-color); color: black; }
                .custom-confirm-cancel { background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.1) !important; }
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
                    * { box-sizing: border-box !important; }
                    .creator-page { padding: 16px 8px !important; overflow-x: hidden !important; width: 100% !important; max-width: 100vw !important; }
                    .creator-layout { grid-template-columns: minmax(0, 1fr) !important; gap: 24px !important; width: 100% !important; margin: 0 !important; max-width: 100vw !important; overflow-wrap: anywhere; }
                    .glass-card { 
                        padding: 16px !important; 
                        border-radius: 16px !important; 
                        width: 100% !important; 
                        max-width: 100% !important; 
                        box-sizing: border-box !important;
                        overflow: hidden !important;
                        min-width: 0 !important;
                        display: flex !important;
                        flex-direction: column !important;
                    }
                    .glass-card > * { min-width: 0 !important; max-width: 100% !important; overflow-wrap: anywhere !important; }
                    
                    /* STACK EVERYTHING ON MOBILE PER USER REQUEST */
                    .responsive-stack-mobile { flex-direction: column !important; gap: 10px !important; width: 100% !important; min-width: 0 !important; }
                    .responsive-stack-mobile > button, 
                    .responsive-stack-mobile > div { width: 100% !important; min-width: 0 !important; max-width: 100% !important; flex: none !important; }

                    .button-editor { 
                        flex-direction: column !important; 
                        align-items: stretch !important; 
                        gap: 12px !important;
                        padding: 12px !important;
                        width: 100% !important;
                        min-width: 0 !important;
                        overflow: hidden !important;
                    }
                    .button-editor > select, 
                    .button-editor > input { width: 100% !important; flex: none !important; min-width: 0 !important; max-width: 100% !important; }
                    
                    .tab-btns { 
                        flex-direction: column !important;
                        gap: 12px !important; 
                        margin-bottom: 24px !important;
                        width: 100% !important;
                        min-width: 0 !important;
                    }
                    .tab-btns button { height: 60px !important; font-size: 11px !important; width: 100% !important; min-width: 0 !important; }

                    .bulk-table-container { 
                        overflow-x: auto !important; 
                        margin: 0 -16px !important;
                        padding: 0 16px !important;
                        width: calc(100% + 32px) !important;
                        max-width: calc(100% + 32px) !important;
                        min-width: 0 !important;
                        display: block !important;
                    }
                    .bulk-table { 
                        min-width: 800px !important; 
                        margin-top: 10px !important;
                        table-layout: fixed !important;
                    }
                    .bulk-table th, .bulk-table td { min-width: 80px !important; }
                    .bulk-table th { font-size: 0.65rem !important; padding: 12px 10px !important; }
                    .bulk-table td { padding: 8px 4px !important; }
                    .bulk-row-input { font-size: 0.85rem !important; padding: 8px 10px !important; height: 38px !important; min-width: 0 !important; }
                    .wp-bubble { 
                        padding: 12px !important; 
                        border-radius: 16px !important; 
                        min-width: 0 !important; 
                        max-width: 100% !important;
                        word-break: break-word !important;
                        overflow-wrap: anywhere !important;
                    }
                    .wp-content { min-width: 0 !important; overflow: hidden !important; }
                    .var-grid { grid-template-columns: 1fr !important; min-width: 0 !important; }
                    .bulk-prefix-input { min-width: 0 !important; width: 100% !important; font-size: 0.9rem !important; }
                    .campaign-header { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; width: 100% !important; min-width: 0 !important; overflow: hidden !important; }
                    .campaign-header-left { width: 100% !important; flex-wrap: wrap !important; gap: 10px !important; min-width: 0 !important; }
                    .campaign-actions-mobile { width: 100% !important; justify-content: space-between !important; border-top: 1px solid rgba(255,255,255,0.05) !important; padding-top: 10px !important; min-width: 0 !important; }
                    .global-config-grid { grid-template-columns: 1fr !important; gap: 16px !important; min-width: 0 !important; }
                    pre, code { word-break: break-all !important; white-space: pre-wrap !important; overflow-wrap: break-word !important; max-width: 100% !important; }
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

                /* Pagination Styles */
                .pagination-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 24px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .pagination-btn {
                    padding: 6px 14px;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .pagination-btn:hover:not(:disabled) {
                    background: rgba(172, 248, 0, 0.1);
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                }
                .pagination-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .pagination-btn.active {
                    background: var(--primary-color);
                    color: black;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 10px rgba(172, 248, 0, 0.3);
                }

                /* Error Log Styles */
                .error-log-container {
                    margin-top: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    max-height: 400px;
                    overflow-y: auto;
                    padding-right: 8px;
                }
                .error-log-container::-webkit-scrollbar {
                    width: 4px;
                }
                .error-log-container::-webkit-scrollbar-thumb {
                    background: rgba(239, 68, 68, 0.3);
                    border-radius: 10px;
                }
                .error-item {
                    background: rgba(239, 68, 68, 0.05);
                    border: 1px solid rgba(239, 68, 68, 0.15);
                    border-radius: 12px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    animation: slideInLeft 0.3s ease-out;
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .error-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(239, 68, 68, 0.1);
                    padding-bottom: 6px;
                    margin-bottom: 4px;
                }
                .error-item-name {
                    font-size: 0.75rem;
                    font-weight: 900;
                    color: #ef4444;
                    text-transform: uppercase;
                }
                .error-item-time {
                    font-size: 0.65rem;
                    opacity: 0.5;
                }
                .error-item-msg {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.85);
                    line-height: 1.4;
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
                                            const defaultText = active
                                                ? (selectedPayloadLanguage === 'en_US' ? LEANDRO_BODY_5_EN : LEANDRO_BODY_5)
                                                : (selectedPayloadLanguage === 'en_US' ? LEANDRO_BODY_4_EN : LEANDRO_BODY_4);
                                            _setBodyText(defaultText);
                                            if (active) {
                                                if (variablesExample.length < 5) {
                                                    _setVariablesExample([...variablesExample, 'check visual proof #76632353']);
                                                }
                                            } else {
                                                const defaultText = selectedPayloadLanguage === 'en_US'
                                                    ? 'Hi {{1}}! We inform you that {{2}}\n\n{{3}}\n\nTo {{4}}, click the button below 👇'
                                                    : 'Oi {{1}}! Informamos que {{2}}\n\n{{3}}\n\nPara {{4}}, clique no botão abaixo 👇';
                                                _setBodyText(defaultText);
                                                if (variablesExample.length > 4) {
                                                    _setVariablesExample(variablesExample.slice(0, 4));
                                                }
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

                            <div className="flex flex-col gap-3">
                                <label>Idioma do Template</label>
                                <div className="flex gap-2 responsive-stack-mobile">
                                    {[
                                        { code: 'pt_BR', label: 'Português (BR)' },
                                        { code: 'en_US', label: 'Inglês (US)' }
                                    ].map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setSelectedPayloadLanguage(lang.code)}
                                            className={`global-tile-btn ${selectedPayloadLanguage === lang.code ? 'global-tile-btn-primary' : 'global-tile-btn-ghost'}`}
                                            style={{ flex: 1, height: '44px' }}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category selection removed per user request - Forced to UTILITY */}
                        </div>

                        <div className="tab-btns flex gap-4 responsive-stack-mobile" style={{ marginBottom: '32px', padding: '5px 0' }}>
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
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                                        <div className="flex flex-col gap-2">
                                            <label>Nome Técnico</label>
                                            <input className="input-field" value={modelName} onChange={e => setModelName(e.target.value.toLowerCase().replace(/[\s-@.]/g, '_'))} />
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card flex flex-col gap-6">
                                    <label>Tipo de Cabeçalho</label>
                                    <div className="flex gap-2 responsive-stack-mobile">
                                        {(['TEXT', 'IMAGE', 'VIDEO'] as const).map(type => (
                                            <button key={type} onClick={() => setHeaderType(type)} className={`global-tile-btn ${headerType === type ? 'global-tile-btn-primary' : 'global-tile-btn-ghost'}`} style={{ flex: 1 }}>{type === 'TEXT' ? 'TEXTO' : type}</button>
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

                                    {!showIndividualDetails ? (
                                        <div
                                            className="mt-4 p-4 flex items-center justify-between"
                                            style={{
                                                background: 'rgba(172, 248, 0, 0.05)',
                                                border: '1px solid rgba(172, 248, 0, 0.15)',
                                                borderRadius: '16px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setShowIndividualDetails(true)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div style={{ background: 'var(--primary-color)', color: 'black', borderRadius: '50%', padding: '4px' }}>
                                                    <Activity size={12} strokeWidth={4} />
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white' }}>Mensagem e Variáveis configuradas ✅</span>
                                            </div>
                                            <button
                                                className="global-tile-btn global-tile-btn-ghost"
                                                style={{ height: '32px', fontSize: '10px', padding: '0 12px' }}
                                                onClick={(e) => { e.stopPropagation(); setShowIndividualDetails(true); }}
                                            >
                                                ALTERAR
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6 animate-fade-in">
                                            <div className="flex items-center justify-between">
                                                <label>Corpo da Mensagem (Body)</label>
                                                <button
                                                    onClick={() => setShowIndividualDetails(false)}
                                                    style={{ fontSize: '10px', color: 'var(--primary-color)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 900 }}
                                                >
                                                    RECOLHER ✕
                                                </button>
                                            </div>
                                            <textarea className="input-field" style={{ minHeight: '120px' }} value={bodyText} onChange={e => _setBodyText(e.target.value)} />

                                            <div className="mt-2 flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <label>Configuração de Variáveis (Visualização no Card)</label>
                                                    <span style={{ fontSize: '10px', opacity: 0.5, fontWeight: 700 }}>{variablesExample.length} ATIVAS</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {Array.from({ length: (bodyText.match(/\{\{(\d+)\}\}/g) || []).length }).map((_, i) => (
                                                        <div key={i} className="flex flex-col gap-1">
                                                            <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--primary-color)', opacity: 0.6 }}>VAR {i + 1}</span>
                                                            <input
                                                                className="input-field"
                                                                value={variablesExample[i] || ''}
                                                                onChange={e => {
                                                                    const newVars = [...variablesExample];
                                                                    newVars[i] = e.target.value;
                                                                    _setVariablesExample(newVars);
                                                                }}
                                                                placeholder={`Valor para {{${i + 1}}}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-col gap-2"><label>Rodapé (Footer)</label><input className="input-field" value={footerText} onChange={e => _setFooterText(e.target.value)} /></div>
                                        </div>
                                    )}
                                </div>

                                <div className="glass-card flex flex-col gap-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1rem' }}>Botões Interativos</h3>
                                        <button className="global-tile-btn global-tile-btn-primary" onClick={handleAddButton} style={{ padding: '6px 12px', fontSize: '10px' }}><Plus size={14} /> ADICIONAR</button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {buttons.map((btn, idx) => (
                                            <div key={idx} className="button-editor">
                                                <select className="input-field" style={{ padding: '8px' }} value={btn.type} onChange={e => handleUpdateButton(idx, 'type', e.target.value as any)}>
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
                                    <div className="flex gap-4 responsive-stack-mobile">
                                        <input className="bulk-field-input" placeholder="Deseja encurtar alguma URL?" value={utilityLinkOriginal} onChange={e => setUtilityLinkOriginal(e.target.value)} />
                                        <button className="global-tile-btn global-tile-btn-primary" onClick={handleUtilityShorten} disabled={isShorteningUtility || !utilityLinkOriginal} style={{ flex: 1 }}>{isShorteningUtility ? '...' : 'ENCURTAR'}</button>
                                    </div>
                                    {utilityLinkShort && (
                                        <div className="flex gap-2 flex-wrap animate-fade-in">{buttons.filter(b => b.type === 'url').map((_, idx) => (
                                            <button key={idx} onClick={() => applyUtilityLinkToAll(idx)} className="global-tile-btn global-tile-btn-ghost" style={{ fontSize: '10px', flex: '1 1 auto' }}>APLICAR NO B{idx + 1}</button>
                                        ))}</div>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 responsive-stack-mobile" style={{ marginTop: '24px', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.2rem' }}>Campanhas Multi-Gerador</h3>
                                    <div className="flex flex-wrap gap-2 responsive-stack-mobile">
                                        <button className="global-tile-btn global-tile-btn-ghost" onClick={applySenderToAllCampaigns}>
                                            <Smartphone size={16} /> SENDER EM TODAS
                                        </button>
                                        <button className="global-tile-btn global-tile-btn-ghost" onClick={() => setCampaigns([{ id: Date.now().toString(), prefix: 'nome_campanha_1_', rows: [] }])}>LIMPAR</button>
                                        <button className="global-tile-btn global-tile-btn-primary" onClick={() => setCampaigns([...campaigns, { id: Date.now().toString(), prefix: `nome_campanha_${campaigns.length + 1}_`, rows: [] }])}><Plus size={16} /> NOVA CAMPANHA</button>
                                    </div>
                                </div>

                                {campaigns.map((camp, cIdx) => (
                                    <div key={camp.id} className="glass-card flex flex-col gap-8 animate-fade-in">
                                        <div className="campaign-header flex justify-between items-center">
                                            <div className="campaign-header-left flex items-center gap-4">
                                                <button onClick={() => setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, collapsed: !c.collapsed } : c))} className="global-tile-btn global-tile-btn-ghost" style={{ width: '32px', height: '32px', padding: 0 }}>
                                                    {camp.collapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                                                </button>
                                                <div style={{ background: 'var(--primary-color)', color: 'black', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem' }}>{cIdx + 1}</div>
                                                <input className={`bulk-prefix-input ${campaigns.filter(c => c.prefix.trim() !== "" && c.prefix.trim().toLowerCase() === camp.prefix.trim().toLowerCase()).length > 1 ? 'error-border' : ''}`} value={camp.prefix} onChange={e => { const val = e.target.value.toLowerCase().replace(/[\s-@.]/g, '_'); setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, prefix: val } : c)); }} />
                                            </div>
                                            <div className="campaign-actions-mobile flex items-center gap-4">
                                                <span style={{ fontSize: '10px', opacity: 0.5, fontWeight: 700 }}>{camp.rows.length} ADS</span>
                                                {campaigns.length > 1 && (
                                                    <button onClick={() => setCampaigns(campaigns.filter(c => c.id !== camp.id))} className="global-tile-btn global-tile-btn-ghost" style={{ width: '44px', height: '44px', padding: 0 }} title="Remover Campanha">
                                                        <Trash2 size={24} stroke="white" strokeWidth={3} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {!camp.collapsed && (
                                            <div className="flex flex-col gap-8 animate-slide-up">
                                                <div className="flex flex-col gap-2">
                                                    <label style={{ fontSize: '10px', fontWeight: 900, opacity: 0.6 }}>ADICIONAR ANÚNCIOS</label>
                                                    <div className="flex gap-2 responsive-stack-mobile">
                                                        <input type="number" className="bulk-field-input" value={queueSize} onChange={e => setQueueSize(parseInt(e.target.value) || 1)} style={{ textAlign: 'center', width: '100%' }} />
                                                        <button className="global-tile-btn global-tile-btn-primary" onClick={() => autoGenerateRows(queueSize, camp.id)} style={{ flex: 1.5 }}>GERAR {queueSize} LINHAS</button>
                                                    </div>
                                                </div>
                                                {camp.rows.length > 0 && (
                                                    <div className="mt-4 animate-fade-in">
                                                        <div className="flex flex-col gap-4 mb-6" style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(172, 248, 0, 0.1)' }}>
                                                            <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '1px', textTransform: 'uppercase' }}>Painel de Configuração Rápida</span>
                                                            <div className="global-config-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                <div className="flex flex-col gap-2">
                                                                    <label style={{ fontSize: '10px' }}>REMETENTE GLOBAL</label>
                                                                    <div className="flex gap-2">
                                                                        <input id={`global-sender-${camp.id}`} className="bulk-row-input" style={{ height: '38px' }} placeholder="Ex: 55119..." />
                                                                        <button className="global-tile-btn global-tile-btn-primary" onClick={() => {
                                                                            const val = (document.getElementById(`global-sender-${camp.id}`) as HTMLInputElement)?.value;
                                                                            if (val) applyGlobalSender(val, camp.id);
                                                                        }} style={{ flex: 1 }}>APLICAR</button>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    <label style={{ fontSize: '10px' }}>MÍDIA GLOBAL</label>
                                                                    <div className="flex gap-1">{(['TEXT', 'IMAGE', 'VIDEO'] as const).map(t => (<button key={t} onClick={() => applyGlobalHeaderType(t, camp.id)} className="global-tile-btn global-tile-btn-ghost" style={{ flex: 1, fontSize: '10px' }}>{t}</button>))}</div>
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    <label style={{ fontSize: '10px' }}>BOTÕES GLOBAIS</label>
                                                                    <div className="flex gap-1"><button onClick={() => applyGlobalButtons(true, camp.id)} className="global-tile-btn global-tile-btn-ghost" style={{ flex: 1, fontSize: '10px' }}>LIGAR BOTÕES</button><button onClick={() => applyGlobalButtons(false, camp.id)} className="global-tile-btn global-tile-btn-ghost" style={{ flex: 1, fontSize: '0.6rem', padding: '0 4px' }}>DESLIGAR</button></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bulk-table-container">
                                                            <table className="bulk-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>SUFIXO</th>
                                                                        <th>SENDER</th>
                                                                        <th>TIPO</th>
                                                                        <th>BOTÃO</th>
                                                                        {(buttons || []).filter(b => b.type === 'url').map((_, i) => (
                                                                            <Fragment key={i}>
                                                                                <th>NOME B{i + 1}</th>
                                                                                <th>LINK B{i + 1}</th>
                                                                            </Fragment>
                                                                        ))}
                                                                        <th>AÇÕES</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(() => {
                                                                        const currentPage = currentPages[camp.id] || 1;
                                                                        const startIndex = (currentPage - 1) * rowsPerPage;
                                                                        const slicedRows = (camp.rows || []).slice(startIndex, startIndex + rowsPerPage);
                                                                        const totalPages = Math.ceil((camp.rows || []).length / rowsPerPage);

                                                                        return (
                                                                            <Fragment>
                                                                                {slicedRows.map((row, sIdx) => {
                                                                                    const rIdx = startIndex + sIdx; // Actual index in camp.rows
                                                                                    const fullName = `${camp.prefix}${row.suffix}`.toLowerCase().trim();
                                                                                    const allNames: string[] = [];
                                                                                    (campaigns || []).forEach(c => (c.rows || []).forEach(r => allNames.push(`${c.prefix}${r.suffix}`.toLowerCase().trim())));
                                                                                    const isFullDuplicate = fullName !== "" && allNames.filter(n => n === fullName).length > 1;
                                                                                    const isSuffixDuplicateInCamp = camp.rows.some((r, i) => i !== rIdx && r.suffix.trim().toLowerCase() === row.suffix.trim().toLowerCase() && row.suffix.trim() !== "");
                                                                                    const isError = isFullDuplicate || isSuffixDuplicateInCamp;

                                                                                    return (
                                                                                        <tr key={rIdx} style={{ opacity: row.hasButtons === false ? 0.7 : 1 }}>
                                                                                            <td><input className={`bulk-row-input ${isError ? 'error-border' : ''}`} value={row.suffix} title={isError ? "Este nome completo ou sufixo já existe!" : ""} onChange={e => { const n = [...camp.rows]; n[rIdx].suffix = e.target.value.toLowerCase().replace(/[\s-@.]/g, '_'); setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }} /></td>
                                                                                            <td><input className="bulk-row-input" value={row.sender} onChange={e => { const n = [...camp.rows]; n[rIdx].sender = e.target.value; setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }} /></td>
                                                                                            <td><select className="bulk-row-input" value={row.headerType} onChange={e => { const n = [...camp.rows]; n[rIdx].headerType = e.target.value as any; setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }}><option value="TEXT">TEXTO</option><option value="IMAGE">IMG</option><option value="VIDEO">VID</option></select></td>
                                                                                            <td><select className="bulk-row-input" value={row.hasButtons ? 'COM' : 'SEM'} onChange={e => { const n = [...camp.rows]; n[rIdx].hasButtons = e.target.value === 'COM'; setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }}><option value="COM">COM</option><option value="SEM">SEM</option></select></td>
                                                                                            {buttons.filter(b => b.type === 'url').map((_, urlIdx) => (
                                                                                                <Fragment key={urlIdx}>
                                                                                                    <td><input className="bulk-row-input" style={{ opacity: row.hasButtons === false ? 0.3 : 1 }} disabled={row.hasButtons === false} value={row.buttonTexts[urlIdx] || ''} onChange={e => { const n = [...camp.rows]; n[rIdx].buttonTexts[urlIdx] = e.target.value; setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }} /></td>
                                                                                                    <td><input className="bulk-row-input" style={{ opacity: row.hasButtons === false ? 0.3 : 1 }} disabled={row.hasButtons === false} value={row.buttonUrls[urlIdx] || ''} onChange={e => { const n = [...camp.rows]; n[rIdx].buttonUrls[urlIdx] = e.target.value; setCampaigns(campaigns.map(c => c.id === camp.id ? { ...c, rows: n } : c)); }} /></td>
                                                                                                </Fragment>
                                                                                            ))}
                                                                                            <td>
                                                                                                <div className="flex gap-3" style={{ position: 'relative', zIndex: 100, justifyContent: 'center', width: '100%' }}>
                                                                                                    <button className="global-tile-btn global-tile-btn-ghost" style={{ width: '44px', height: '44px', padding: 0, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => duplicateRow(camp.id, rIdx)} title="Duplicar"><Edit2 size={24} color="#FFFFFF" /></button>
                                                                                                    <button className="global-tile-btn global-tile-btn-ghost" style={{ width: '44px', height: '44px', padding: 0, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={async () => { const ok = await showConfirm("Remover esta linha?"); if (ok) deleteRow(camp.id, rIdx); }} title="Excluir"><Trash2 size={24} color="#FFFFFF" /></button>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })}
                                                                                {totalPages > 1 && (
                                                                                    <tr>
                                                                                        <td colSpan={100}>
                                                                                            <div className="pagination-container">
                                                                                                <button
                                                                                                    className="pagination-btn"
                                                                                                    disabled={currentPage === 1}
                                                                                                    onClick={() => setCurrentPages(prev => ({ ...prev, [camp.id]: currentPage - 1 }))}
                                                                                                >
                                                                                                    Anterior
                                                                                                </button>
                                                                                                {Array.from({ length: totalPages }).map((_, i) => (
                                                                                                    <button
                                                                                                        key={i}
                                                                                                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                                                                                        onClick={() => setCurrentPages(prev => ({ ...prev, [camp.id]: i + 1 }))}
                                                                                                    >
                                                                                                        {i + 1}
                                                                                                    </button>
                                                                                                ))}
                                                                                                <button
                                                                                                    className="pagination-btn"
                                                                                                    disabled={currentPage === totalPages}
                                                                                                    onClick={() => setCurrentPages(prev => ({ ...prev, [camp.id]: currentPage + 1 }))}
                                                                                                >
                                                                                                    Próximo
                                                                                                </button>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                )}
                                                                            </Fragment>
                                                                        );
                                                                    })()}
                                                                </tbody>
                                                            </table>
                                                        </div>
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
                                        <code>{JSON.stringify(buildInfobipPayload(modelName, selectedPayloadLanguage), null, 2)}</code>
                                    </pre>
                                </div>

                                {operationErrors.length > 0 && (
                                    <div className="mt-8 animate-fade-in">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 style={{ color: '#ef4444', margin: 0, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Motivo dos Erros Recentes</h4>
                                            <button
                                                onClick={() => setOperationErrors([])}
                                                style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                                            >
                                                LIMPAR LOG
                                            </button>
                                        </div>
                                        <div className="error-log-container">
                                            {operationErrors.map((err, i) => (
                                                <div key={i} className="error-item">
                                                    <div className="error-item-header">
                                                        <span className="error-item-name">{err.name}</span>
                                                        <span className="error-item-time">{err.timestamp}</span>
                                                    </div>
                                                    <div className="error-item-msg">{err.error}</div>
                                                    {err.payload && (
                                                        <div className="mt-3">
                                                            <button
                                                                onClick={(e) => {
                                                                    const pre = e.currentTarget.nextElementSibling as HTMLElement;
                                                                    pre.style.display = pre.style.display === 'none' ? 'block' : 'none';
                                                                }}
                                                                className="global-tile-btn global-tile-btn-ghost"
                                                                style={{ height: '24px', fontSize: '9px', padding: '0 8px' }}
                                                            >
                                                                VER JSON ENVIADO
                                                            </button>
                                                            <pre style={{ display: 'none', marginTop: '10px', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.65rem', color: 'var(--primary-color)', overflowX: 'auto' }}>
                                                                <code>{JSON.stringify(err.payload, null, 2)}</code>
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default TemplateCreator;
