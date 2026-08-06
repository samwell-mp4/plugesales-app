import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Search, Settings, Save, Edit, RefreshCw, X, Plus, Play, ExternalLink, ArrowRight, Layers, Link as LinkIcon, Database, Key, Copy, Check, Filter, Clock, Trash2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { dbService } from '../services/dbService';

interface InfobipTemplate {
    id?: string;
    name: string;
    language: string;
    category: string;
    status: string;
    structure?: {
        body?: { text: string; example?: any; examples?: any };
        header?: { format: string; text?: string; example?: any };
        buttons?: any[];
        type?: string;
    };
    components?: any[];
}

interface ScheduledEdit {
    id: number;
    template_name: string;
    sender: string;
    api_key?: string;
    base_url?: string;
    category: string;
    body_text?: string;
    header_text?: string;
    header_format?: string;
    button_url?: string;
    status: string;
    error_message?: string;
    created_at: string;
    updated_at: string;
}

const TemplateManager = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [templates, setTemplates] = useState<InfobipTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Filter and search states
    const [searchTerm, setSearchTerm] = useState('');
    const [numberSearchTerm, setNumberSearchTerm] = useState(''); 
    const [statusFilter, setStatusFilter] = useState('ALL'); 
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);

    // Global settings credentials (Sidão/Padrão)
    const [sidaoConfig, setSidaoConfig] = useState<any>(null);

    // Sidão default credentials (host 8k6xv1)
    const SIDAO_API_KEY = 'f3358659bee063a3fc2f71f6bdce8f3c-a7cd9b94-e925-415f-8a4a-6dccd1b8d1d0';
    const SIDAO_BASE_URL = '8k6xv1.api-us.infobip.com';
    const SIDAO_SENDER = '5511925399038';

    // Current Active Editable Credentials
    const [activeSender, setActiveSender] = useState('');
    const [activeApiKey, setActiveApiKey] = useState(SIDAO_API_KEY);
    const [activeBaseUrl, setActiveBaseUrl] = useState(SIDAO_BASE_URL);

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
    const [isScheduling, setIsScheduling] = useState(false);

    // Scheduled Queue Log State
    const [scheduledEdits, setScheduledEdits] = useState<ScheduledEdit[]>([]);
    const [isLoadingQueue, setIsLoadingQueue] = useState(false);
    const [countdownText, setCountdownText] = useState('');
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [showQueuePanel, setShowQueuePanel] = useState(true); // Default open to see errors

    // Reconcile Card State
    const [selectedTemplateForCard, setSelectedTemplateForCard] = useState<InfobipTemplate | null>(null);
    const [cards, setCards] = useState<any[]>([]);
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Transition launch screen state
    const [showLaunchTransition, setShowLaunchTransition] = useState(false);
    const [campaignName, setCampaignName] = useState('');
    const [transitionExcel, setTransitionExcel] = useState('');
    const [transitionImage, setTransitionImage] = useState('');
    const [transitionCardId, setTransitionCardId] = useState('');
    const [tabCount, setTabCount] = useState('1');

    // Variables binding for transmission
    const [varBindings, setVarBindings] = useState<string[]>([]);
    const [rotatorLinks, setRotatorLinks] = useState<any[]>([]);
    const [selectedRotator, setSelectedRotator] = useState<string>('');

    // Inline Create Link State
    const [showCreateLink, setShowCreateLink] = useState(false);
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkSlug, setNewLinkSlug] = useState('');
    const [newLinkTarget, setNewLinkTarget] = useState('');
    const [isCreatingLink, setIsCreatingLink] = useState(false);

    // Helper to get tag (filename without extension) from spreadsheet URL
    const getSpreadsheetTag = (url: string) => {
        if (!url) return '';
        try {
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            return filename.replace(/\.[^/.]+$/, ""); // strip extension
        } catch (e) {
            return url;
        }
    };

    const loadClients = async () => {
        try {
            const res = await fetch(`/api/admin/users`);
            const data = await res.json();
            setClients(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading clients for templates:", err);
        }
    };

    const loadSettings = async () => {
        try {
            const settings = await dbService.getSettings(user?.role);
            if (settings) {
                const config = {
                    infobip_key: settings['infobip_key'] || SIDAO_API_KEY,
                    infobip_sender: settings['infobip_sender'] || SIDAO_SENDER,
                    infobip_url: settings['infobip_url'] || SIDAO_BASE_URL
                };
                setSidaoConfig(config);
                
                setActiveSender(config.infobip_sender);
                setActiveApiKey(config.infobip_key);
                setActiveBaseUrl(config.infobip_url);
            }
        } catch (err) {
            console.error("Error loading global settings:", err);
        }
    };

    const fetchTemplates = async () => {
        if (!activeApiKey || !activeSender) {
            setTemplates([]);
            return;
        }
        setIsLoading(true);
        try {
            const cleanBaseUrl = activeBaseUrl || SIDAO_BASE_URL;
            const response = await fetch(`https://${cleanBaseUrl}/whatsapp/2/senders/${activeSender.trim()}/templates`, {
                headers: { 'Authorization': `App ${activeApiKey.trim()}` }
            });
            
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.description || `Erro ${response.status} ao carregar templates.`);
            }

            const data = await response.json();
            setTemplates(Array.isArray(data.templates) ? data.templates : []);
            setCurrentPage(1);
        } catch (err: any) {
            console.error("Error fetching templates from Infobip:", err);
            setTemplates([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRotators = async () => {
        try {
            const linksData = await dbService.getShortLinks(user?.role, user?.id);
            setRotatorLinks(linksData && Array.isArray(linksData.links) ? linksData.links : []);
        } catch (err) {
            console.error("Error loading rotators:", err);
        }
    };

    // Load and clear queue methods
    const fetchQueue = async () => {
        setIsLoadingQueue(true);
        try {
            const list = await dbService.getScheduledTemplateEdits(user?.role === 'CLIENT' ? user?.id : undefined);
            setScheduledEdits(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error("Error loading scheduled queue:", e);
        } finally {
            setIsLoadingQueue(false);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm("Tem certeza que deseja limpar o histórico de edições concluídas?")) return;
        try {
            const res = await dbService.clearScheduledTemplateEdits();
            if (res.success) {
                fetchQueue();
            } else {
                alert("Erro ao limpar histórico.");
            }
        } catch (e) {
            alert("Erro de conexão ao limpar histórico.");
        }
    };

    const handleDeleteScheduledItem = async (id: number) => {
        if (!window.confirm("Tem certeza de que deseja excluir este agendamento da fila?")) return;
        try {
            const res = await dbService.deleteScheduledTemplateEdit(id);
            if (res && !res.error) {
                fetchQueue();
            } else {
                alert("Erro ao excluir: " + (res.error || "Tente novamente."));
            }
        } catch (e) {
            alert("Erro de conexão ao excluir.");
        }
    };

    const handleEditScheduledItem = (item: ScheduledEdit) => {
        // Mock or find original template
        const originalTemplate = templates.find(t => t.name === item.template_name) || {
            name: item.template_name,
            language: 'pt_BR',
            category: item.category,
            status: 'APPROVED'
        };
        setEditingTemplate(originalTemplate);
        setEditForm({
            bodyText: item.body_text || '',
            category: item.category || 'MARKETING',
            headerText: item.header_text || '',
            headerFormat: item.header_format || 'NONE',
            buttonUrl: item.button_url || ''
        });
        
        // Force Sidão sender/host/key (do not restore stale per-row credentials)
        setActiveSender(SIDAO_SENDER);
        setActiveApiKey(SIDAO_API_KEY);
        setActiveBaseUrl(SIDAO_BASE_URL);

        setEditModalOpen(true);
    };

    useEffect(() => {
        loadClients();
        loadSettings();
        loadRotators();
        fetchQueue();

        // Real-time Countdown Timer Interval (every 1s)
        const timer = setInterval(() => {
            const now = new Date();
            const minutes = now.getMinutes();
            if (minutes >= 0 && minutes < 5) {
                setIsWindowOpen(true);
                const secondsRemaining = (5 * 60) - (minutes * 60 + now.getSeconds());
                const secs = secondsRemaining % 60;
                const mins = Math.floor(secondsRemaining / 60);
                setCountdownText(`🚀 Janela Ativa! Envio fechando em: ${mins}m ${secs}s`);
            } else {
                setIsWindowOpen(false);
                const nextHour = new Date(now);
                nextHour.setHours(now.getHours() + 1, 0, 0, 0);
                const diffMs = nextHour.getTime() - now.getTime();
                const mins = Math.floor(diffMs / 60000);
                const secs = Math.floor((diffMs % 60000) / 1000);
                setCountdownText(`Próximo lote em: ${mins}m ${secs}s`);
            }
        }, 1000);

        // Fetch queue logs every 10 seconds
        const queuePoll = setInterval(fetchQueue, 10000);

        return () => {
            clearInterval(timer);
            clearInterval(queuePoll);
        };
    }, []);

    useEffect(() => {
        // Always force Sidão credentials; only the sender is taken from DB setting
        setActiveSender((sidaoConfig && sidaoConfig.infobip_sender) || SIDAO_SENDER);
        setActiveApiKey(SIDAO_API_KEY);
        setActiveBaseUrl(SIDAO_BASE_URL);
    }, [sidaoConfig]);

    useEffect(() => {
        if (activeApiKey && activeSender) {
            fetchTemplates();
        }
    }, [activeSender, activeApiKey, activeBaseUrl]);

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
            category: 'UTILITY', // Always force UTILITY
            headerText: headText,
            headerFormat: headFormat,
            buttonUrl: btnUrl
        });
        setEditModalOpen(true);
    };

    const handleSaveTemplate = async () => {
        if (!editingTemplate) return;
        
        let sender = activeSender;
        let apiKey = activeApiKey || SIDAO_API_KEY;
        let baseUrl = activeBaseUrl || SIDAO_BASE_URL;

        if (!apiKey || !sender) return alert("Parâmetros do remetente ausentes.");

        try {
            const cleanBaseUrl = baseUrl;
            const bodyText = editForm.bodyText;
            const varsMatches = bodyText.match(/\{\{\d+\}\}/g) || [];
            const varsCount = varsMatches.length;
            const bodyExamples = Array.from({ length: varsCount }, (_, i) => `ex_var${i + 1}`);

            const payload: any = {
                category: 'UTILITY',
                structure: {
                    body: {
                        text: bodyText
                    }
                }
            };

            if (varsCount > 0) {
                payload.structure.body.examples = bodyExamples;
            }

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
                        url: editForm.buttonUrl,
                        example: editForm.buttonUrl
                    }
                ];
            }

            const isMediaHeader = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(editForm.headerFormat);
            payload.structure.type = isMediaHeader ? 'MEDIA' : 'TEXT';

            let res = await fetch(`https://${cleanBaseUrl}/whatsapp/2/senders/${sender.trim()}/templates/${editingTemplate.name}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `App ${apiKey.trim()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // If 404, try using the Template ID (numerical ID) on whatsapp/2/
            if (res.status === 404 && editingTemplate.id) {
                console.log(`[Save] Template name returned 404, attempting with Template ID: ${editingTemplate.id}`);
                res = await fetch(`https://${cleanBaseUrl}/whatsapp/2/senders/${sender.trim()}/templates/${editingTemplate.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `App ${apiKey.trim()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            }

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

    // Add to schedule queue
    const handleScheduleTemplateEdit = async () => {
        if (!editingTemplate) return;

        let sender = activeSender || (sidaoConfig && sidaoConfig.infobip_sender) || '';
        let apiKey = activeApiKey || (sidaoConfig && sidaoConfig.infobip_key) || SIDAO_API_KEY;
        let baseUrl = activeBaseUrl || (sidaoConfig && sidaoConfig.infobip_url) || SIDAO_BASE_URL;

        if (!apiKey || !sender) return alert("Parâmetros do remetente ausentes.");

        setIsScheduling(true);
        try {
            const payload = {
                user_id: user?.id,
                template_id: editingTemplate.id,
                template_name: editingTemplate.name,
                sender: sender,
                api_key: apiKey,
                base_url: baseUrl,
                category: 'UTILITY',
                body_text: editForm.bodyText,
                header_text: editForm.headerText,
                header_format: editForm.headerFormat,
                button_url: editForm.buttonUrl
            };

            const res = await dbService.scheduleTemplateEdit(payload);
            if (res && !res.error) {
                alert("Alterações salvas! O template foi agendado para a fila de lote.");
                setEditModalOpen(false);
                fetchQueue();
            } else {
                alert("Erro ao agendar: " + (res.error || "Tente novamente."));
            }
        } catch (e) {
            alert("Erro de conexão ao agendar.");
        } finally {
            setIsScheduling(false);
        }
    };

    const handleOpenReconcile = async (template: InfobipTemplate) => {
        setSelectedTemplateForCard(template);
        setReconcileModalOpen(true);
        setShowLaunchTransition(false); 
        
        try {
            const subs = await dbService.getClientSubmissions();
            const safeSubs = Array.isArray(subs) ? subs : [];
            setCards(safeSubs);
            if (safeSubs.length > 0) {
                const initialCard = safeSubs[0];
                setSelectedCard(initialCard);
                setTransitionExcel(getSpreadsheetTag(initialCard.spreadsheet_url || ''));
                setTransitionImage(initialCard.media_url || '');
                setTransitionCardId(initialCard.id || '');
            } else {
                setSelectedCard(null);
                setTransitionExcel('');
                setTransitionImage('');
                setTransitionCardId('');
            }
        } catch (e) {
            console.error("Error loading submissions:", e);
            setCards([]);
            setSelectedCard(null);
        }

        let bodyText = '';
        if (template.structure) bodyText = template.structure.body?.text || '';
        else if (template.components) {
            const bodyComp = template.components.find((c: any) => c.type === 'BODY');
            if (bodyComp) bodyText = bodyComp.text || '';
        }

        const matchVars = bodyText.match(/\{\{\d+\}\}/g) || [];
        const uniqueVarsCount = new Set(matchVars).size;
        setVarBindings(Array(uniqueVarsCount).fill(''));
        
        setCampaignName(`${template.name} - ${new Date().toLocaleDateString('pt-BR')}`);
    };

    const handleSelectCard = (card: any) => {
        setSelectedCard(card);
        if (card) {
            setTransitionExcel(getSpreadsheetTag(card.spreadsheet_url || ''));
            setTransitionImage(card.media_url || '');
            setTransitionCardId(card.id || '');
            setCampaignName(`${selectedTemplateForCard?.name || 'Campanha'} - ${card.profile_name || ''}`);
        }
    };

    const handleProceedToTransition = () => {
        if (!selectedCard) {
            alert("Por favor, selecione um Card.");
            return;
        }
        setShowLaunchTransition(true);
    };

    // Open extension by posting message to window and opening page
    const handleLaunchExtension = () => {
        if (!selectedTemplateForCard) return;

        // Post message to manifest.json listener on plugesales.com
        window.postMessage({
            type: 'PLUG_START_AUTOMATION',
            broadcastName: campaignName,
            senderNumber: activeSender,
            recipientBase: transitionExcel,
            templateName: selectedTemplateForCard.name,
            variables: varBindings,
            imageUrl: transitionImage,
            tabCount: parseInt(tabCount) || 1
        }, '*');

        // Build parameters query string including templateName, variables, imageUrl
        let queryParams = `?auto=true&broadcastName=${encodeURIComponent(campaignName)}&senderNumber=${encodeURIComponent(activeSender)}&recipientBase=${encodeURIComponent(transitionExcel)}&templateName=${encodeURIComponent(selectedTemplateForCard.name)}&imageUrl=${encodeURIComponent(transitionImage)}`;
        varBindings.forEach((v, idx) => {
            queryParams += `&var_${idx + 1}=${encodeURIComponent(v)}`;
        });

        // Open Infobip page in a new tab
        const autoUrl = `https://portal-ny2.infobip.com/broadcast/create/${queryParams}`;
        window.open(autoUrl, '_blank');
    };

    const handleCopy = (text: string, fieldName: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleCreateShortLink = async () => {
        if (!newLinkTarget || !newLinkTitle) {
            alert("Por favor, preencha o Título e a URL de Destino.");
            return;
        }
        setIsCreatingLink(true);
        try {
            const payload = {
                links: [{
                    title: newLinkTitle,
                    original_url: newLinkTarget,
                    short_code: newLinkSlug || Math.random().toString(36).substring(2, 8)
                }],
                user_id: user?.id
            };
            const result = await dbService.createShortLink(payload);
            if (result && !result.error) {
                alert("Link Encurtador criado com sucesso!");
                await loadRotators();
                setSelectedRotator(result.original_url || newLinkTarget);
                setShowCreateLink(false);
                setNewLinkTitle('');
                setNewLinkSlug('');
                setNewLinkTarget('');
            } else {
                alert("Erro ao criar link: " + (result.error || "Tente outro código slug"));
            }
        } catch (e) {
            alert("Erro ao criar encurtador.");
        } finally {
            setIsCreatingLink(false);
        }
    };

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
    const paginatedTemplates = filteredTemplates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const filteredClients = clients.filter(c => {
        const nameMatch = (c.name || '').toLowerCase().includes(numberSearchTerm.toLowerCase());
        const phoneMatch = (c.phone || '').includes(numberSearchTerm) || (c.whatsapp || '').includes(numberSearchTerm) || (c.infobip_sender || '').includes(numberSearchTerm);
        return nameMatch || phoneMatch;
    });

    return (
        <div className="crm-container" style={{ minHeight: '100vh', padding: '32px' }}>
            <style>{`
                .visible-scrollbar::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }
                .visible-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                }
                .visible-scrollbar::-webkit-scrollbar-thumb {
                    background: #acf800; 
                    border-radius: 8px;
                    border: 3px solid #090d16;
                }
                .visible-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #8ec700;
                }
            `}</style>

            <div className="crm-header-premium mb-8">
                <div className="crm-title-group">
                    <div className="crm-badge-small">
                        <FileText size={12} /> GERENCIADOR DE TEMPLATES INFOBIP
                    </div>
                    <h1 className="crm-main-title">WhatsApp Template Manager</h1>
                </div>
            </div>

            {/* Credencial padrão (Sidão) */}
            <div className="crm-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border-subtle)' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--primary-color)' }}>Credencial de Acesso: Sidão (Padrão)</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>O remetente é sempre o número preenchido no campo "Remetente" abaixo.</p>
                </div>
            </div>

            {/* Credentials parameters editable */}
            <div className="crm-card" style={{ padding: '24px', marginBottom: '24px', background: 'rgba(255,255,255,0.01)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Credenciais Ativas de Conexão</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                        <label className="field-label">Remetente (Número do WhatsApp)</label>
                        <input 
                            className="field-input" 
                            value={activeSender} 
                            onChange={e => setActiveSender(e.target.value)} 
                            placeholder="Ex: 5511925399038"
                            style={{ height: '44px', background: 'rgba(0,0,0,0.2)' }}
                        />
                    </div>
                    <div>
                        <label className="field-label">Chave de API (Infobip Key)</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                className="field-input" 
                                type="password"
                                value={activeApiKey} 
                                onChange={e => setActiveApiKey(e.target.value)} 
                                placeholder="App key..."
                                style={{ height: '44px', background: 'rgba(0,0,0,0.2)', paddingRight: '40px' }}
                            />
                            <Key size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                        </div>
                    </div>
                    <div>
                        <label className="field-label">URL da API (Infobip Host)</label>
                        <input 
                            className="field-input" 
                            value={activeBaseUrl} 
                            onChange={e => setActiveBaseUrl(e.target.value)} 
                            placeholder="Ex: 8k6xv1.api-us.infobip.com"
                            style={{ height: '44px', background: 'rgba(0,0,0,0.2)' }}
                        />
                    </div>
                </div>
            </div>

            {/* Collapsible Scheduled Queue Dashboard Log Panel */}
            <div className="crm-card" style={{ marginBottom: '32px', padding: '20px', background: 'rgba(172,248,0,0.01)', border: '1px solid rgba(172,248,0,0.1)' }}>
                <div 
                    onClick={() => setShowQueuePanel(!showQueuePanel)} 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Clock size={20} style={{ color: '#acf800' }} />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Fila de Edições em Lote / Agendamentos
                            </h3>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Clique para expandir a lista de edições programadas para a virada do lote.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Countdown Badge */}
                        <div style={{ 
                            background: isWindowOpen ? 'rgba(172,248,0,0.1)' : 'rgba(255,255,255,0.03)',
                            color: isWindowOpen ? '#acf800' : 'white',
                            border: `1px solid ${isWindowOpen ? 'rgba(172,248,0,0.2)' : 'rgba(255,255,255,0.1)'}`,
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }} onClick={e => e.stopPropagation()}>
                            <Clock size={12} className={isWindowOpen ? 'animate-pulse' : ''} />
                            {countdownText || 'Calculando...'}
                        </div>
                        {showQueuePanel ? <ChevronUp size={20} style={{ opacity: 0.5 }} /> : <ChevronDown size={20} style={{ opacity: 0.5 }} />}
                    </div>
                </div>

                {showQueuePanel && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
                            <button 
                                onClick={fetchQueue} 
                                className="action-btn ghost-btn" 
                                style={{ height: '32px', padding: '0 12px', fontSize: '0.75rem' }}
                                disabled={isLoadingQueue}
                            >
                                <RefreshCw size={12} style={{ marginRight: '6px' }} /> Atualizar
                            </button>
                            <button 
                                onClick={handleClearHistory} 
                                className="action-btn ghost-btn" 
                                style={{ height: '32px', padding: '0 12px', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }}
                            >
                                <Trash2 size={12} style={{ marginRight: '6px' }} /> Limpar Histórico
                            </button>
                        </div>

                        {isLoadingQueue && scheduledEdits.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Carregando fila...</div>
                        ) : scheduledEdits.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'rgba(0,0,0,0.15)', borderRadius: '12px' }}>
                                Nenhum agendamento ativo ou histórico na fila.
                            </div>
                        ) : (
                            <div className="visible-scrollbar" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Template</th>
                                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Remetente</th>
                                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Categoria</th>
                                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)', textAlign: 'center' }}>Status</th>
                                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Criado em</th>
                                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Atualizado em</th>
                                            <th style={{ padding: '12px 16px', color: 'var(--text-muted)', textAlign: 'right' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scheduledEdits.map((item) => {
                                            let statusColor = '#3b82f6';
                                            let statusBg = 'rgba(59,130,246,0.08)';
                                            if (item.status === 'SUCCESS') {
                                                statusColor = '#acf800';
                                                statusBg = 'rgba(172,248,0,0.08)';
                                            } else if (item.status === 'ERROR') {
                                                statusColor = '#ef4444';
                                                statusBg = 'rgba(239,68,68,0.08)';
                                            } else if (item.status === 'PROCESSING') {
                                                statusColor = '#eab308';
                                                statusBg = 'rgba(234,179,8,0.08)';
                                            }

                                            return (
                                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                    <td style={{ padding: '12px 16px', fontWeight: 800, color: 'white' }}>{item.template_name}</td>
                                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{item.sender}</td>
                                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{item.category}</td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', background: statusBg, color: statusColor, textTransform: 'uppercase', border: `1px solid ${statusColor}22` }}>
                                                                {item.status}
                                                            </span>
                                                            {item.status === 'ERROR' && item.error_message && (
                                                                <span style={{ display: 'block', fontSize: '0.65rem', color: '#ef4444', marginTop: '4px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.error_message}>
                                                                    ⚠️ {item.error_message}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{new Date(item.created_at).toLocaleString('pt-BR')}</td>
                                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{new Date(item.updated_at).toLocaleString('pt-BR')}</td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                            {(item.status === 'ERROR' || item.status === 'PENDING') && (
                                                                <button 
                                                                    onClick={() => handleEditScheduledItem(item)}
                                                                    className="action-btn ghost-btn animate-pulse"
                                                                    style={{ height: '30px', padding: '0 10px', fontSize: '0.7rem', borderColor: '#acf800', color: '#acf800', fontWeight: 800 }}
                                                                >
                                                                    Corrigir / Reagendar
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => handleDeleteScheduledItem(item.id)}
                                                                className="action-btn ghost-btn"
                                                                style={{ height: '30px', padding: '0 10px', fontSize: '0.7rem', borderColor: '#ef4444', color: '#ef4444', fontWeight: 800 }}
                                                            >
                                                                <Trash2 size={12} /> EXCLUIR
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Filters panel */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', minWidth: '350px', flex: 1.5 }}>
                    <div style={{ flex: 1 }}>
                        <label className="field-label" style={{ marginBottom: '8px' }}>Pesquisar Número / Cliente</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input 
                                className="field-input"
                                placeholder="Buscar por número..."
                                value={numberSearchTerm}
                                onChange={e => setNumberSearchTerm(e.target.value)}
                                style={{ height: '44px', paddingLeft: '38px', fontSize: '0.85rem' }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ flex: 1.5 }}>
                        <label className="field-label" style={{ marginBottom: '8px' }}>Selecionar Cliente</label>
                        <select 
                            className="field-input" 
                            value={selectedClient ? selectedClient.id : ''} 
                            onChange={e => setSelectedClient(clients.find(c => String(c.id) === e.target.value))}
                            style={{ height: '44px', background: 'var(--card-bg)' }}
                        >
                            <option value="">Configuração Padrão do Sidão</option>
                            {filteredClients.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.whatsapp || c.phone || 'Sem contato'})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ minWidth: '180px' }}>
                    <label className="field-label" style={{ marginBottom: '8px' }}>Status Meta</label>
                    <select 
                        className="field-input"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ height: '44px', background: 'var(--card-bg)' }}
                    >
                        <option value="ALL">Todos Status</option>
                        <option value="APPROVED">APPROVED (Aprovado)</option>
                        <option value="PENDING">PENDING (Em Análise)</option>
                        <option value="REJECTED">REJECTED (Rejeitado)</option>
                    </select>
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                    <label className="field-label" style={{ marginBottom: '8px' }}>Buscar por Nome</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                        <input 
                            className="field-input" 
                            placeholder="Buscar templates..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ height: '44px', paddingLeft: '48px' }}
                        />
                    </div>
                </div>

                <button 
                    onClick={fetchTemplates} 
                    className="action-btn primary-btn" 
                    style={{ height: '44px', marginTop: '24px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <RefreshCw size={18} /> CARREGAR TEMPLATES
                </button>
            </div>

            {isLoading ? (
                <div style={{ color: 'var(--text-muted)' }}>Buscando templates na Infobip...</div>
            ) : paginatedTemplates.length === 0 ? (
                <div className="crm-card" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
                    Nenhum template encontrado. Verifique as credenciais no painel acima e clique em "CARREGAR TEMPLATES".
                </div>
            ) : (
                <>
                    <div className="crm-card visible-scrollbar" style={{ padding: '0', overflowX: 'auto', border: '1px solid var(--surface-border-subtle)', background: 'rgba(10,15,24,0.3)', marginBottom: '24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--surface-border-subtle)' }}>
                                    <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Nome do Template</th>
                                    <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Categoria</th>
                                    <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tipo</th>
                                    <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Idioma</th>
                                    <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Status Meta</th>
                                    <th style={{ padding: '18px 24px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTemplates.map(template => {
                                    let statusColor = '#f59e0b';
                                    let statusBg = 'rgba(245,158,11,0.08)';
                                    if (template.status === 'APPROVED') {
                                        statusColor = '#acf800';
                                        statusBg = 'rgba(172,248,0,0.08)';
                                    } else if (template.status === 'REJECTED') {
                                        statusColor = '#ef4444';
                                        statusBg = 'rgba(239,68,68,0.08)';
                                    }

                                    // Parse header format or type
                                    let templateType = 'TEXT';
                                    if (template.structure?.type) {
                                        templateType = template.structure.type;
                                    } else if (template.components) {
                                        const headerComp = template.components.find((c: any) => c.type === 'HEADER');
                                        if (headerComp) {
                                            templateType = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComp.format) ? 'MEDIA' : 'TEXT';
                                        }
                                    }

                                    return (
                                        <tr key={template.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ fontWeight: 950, color: 'white', fontSize: '0.95rem' }}>{template.name}</div>
                                            </td>
                                            <td style={{ padding: '20px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {template.category}
                                            </td>
                                            <td style={{ padding: '20px 24px', fontSize: '0.85rem' }}>
                                                <span style={{ 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: 900, 
                                                    padding: '3px 8px', 
                                                    borderRadius: '6px', 
                                                    background: templateType === 'MEDIA' ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.05)', 
                                                    color: templateType === 'MEDIA' ? '#38bdf8' : 'var(--text-muted)',
                                                    border: `1px solid ${templateType === 'MEDIA' ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.1)'}` 
                                                }}>
                                                    {templateType}
                                                </span>
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Exibindo página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({filteredTemplates.length} templates)
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    className="action-btn ghost-btn" 
                                    style={{ height: '38px', padding: '0 16px' }}
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                >
                                    Anterior
                                </button>
                                <button 
                                    className="action-btn ghost-btn" 
                                    style={{ height: '38px', padding: '0 16px' }}
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Edit Template Modal with full scrollbar support */}
            {editModalOpen && editingTemplate && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card visible-scrollbar" style={{ width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
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
                                    value="UTILITY"
                                    disabled
                                    style={{ background: 'var(--card-bg)', opacity: 0.7, cursor: 'not-allowed' }}
                                >
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

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
                            <button 
                                onClick={handleSaveTemplate} 
                                className="action-btn primary-btn" 
                                style={{ flex: 1, minWidth: '150px', height: '48px', gap: '8px' }}
                            >
                                <Save size={18} /> DISPARAR IMEDIATO
                            </button>
                            <button 
                                onClick={handleScheduleTemplateEdit} 
                                className="action-btn" 
                                style={{ flex: 1, minWidth: '150px', height: '48px', gap: '8px', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}
                                disabled={isScheduling}
                            >
                                <Clock size={18} /> AGENDAR PARA VIRADA
                            </button>
                            <button 
                                onClick={() => setEditModalOpen(false)} 
                                className="action-btn ghost-btn" 
                                style={{ flex: 1, minWidth: '100px', height: '48px' }}
                            >
                                CANCELAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reconcile Card & Launch Modal with full scrollbar support */}
            {reconcileModalOpen && selectedTemplateForCard && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="crm-card visible-scrollbar" style={{ width: '100%', maxWidth: '680px', padding: '32px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>
                                    {showLaunchTransition ? 'Iniciar Transmissão' : 'Conciliar Card'}
                                </h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Template: {selectedTemplateForCard.name}</p>
                            </div>
                            <button onClick={() => setReconcileModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        {!showLaunchTransition ? (
                            /* STEP 1: Conciliar Card */
                            <div className="flex-col gap-4">
                                <div>
                                    <label className="field-label">Selecione o Card do Cliente (Upload de Contatos/Campanha)</label>
                                    <select 
                                        className="field-input" 
                                        value={selectedCard ? selectedCard.id : ''} 
                                        onChange={e => handleSelectCard(cards.find(c => String(c.id) === e.target.value))}
                                        style={{ background: 'var(--card-bg)' }}
                                    >
                                        <option value="">Selecione um card ativo...</option>
                                        {cards.map(c => (
                                            <option key={c.id} value={c.id}>{c.profile_name} (DDD: {c.ddd})</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedCard && (
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <span style={{ fontWeight: 900, color: 'var(--primary-color)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dados Vinculados do Card:</span>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '10px' }}>
                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>URL da Planilha</span>
                                                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 700 }}>{selectedCard.spreadsheet_url || 'Nenhuma'}</span>
                                                </div>
                                                {selectedCard.spreadsheet_url && (
                                                    <button 
                                                        onClick={() => handleCopy(selectedCard.spreadsheet_url, 'spreadsheet')}
                                                        style={{ padding: '6px 12px', background: copiedField === 'spreadsheet' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: copiedField === 'spreadsheet' ? '#10b981' : 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        {copiedField === 'spreadsheet' ? <Check size={12} /> : <Copy size={12} />}
                                                        {copiedField === 'spreadsheet' ? 'Copiado!' : 'Copiar'}
                                                    </button>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '10px' }}>
                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Imagem / Mídia do Envio</span>
                                                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 700 }}>{selectedCard.media_url || 'Nenhuma'}</span>
                                                </div>
                                                {selectedCard.media_url && (
                                                    <button 
                                                        onClick={() => handleCopy(selectedCard.media_url, 'media')}
                                                        style={{ padding: '6px 12px', background: copiedField === 'media' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: copiedField === 'media' ? '#10b981' : 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        {copiedField === 'media' ? <Check size={12} /> : <Copy size={12} />}
                                                        {copiedField === 'media' ? 'Copiado!' : 'Copiar'}
                                                    </button>
                                                )}
                                            </div>

                                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cópia do Anúncio (Ad Copy)</span>
                                                    {selectedCard.ad_copy && (
                                                        <button 
                                                            onClick={() => handleCopy(selectedCard.ad_copy, 'adcopy')}
                                                            style={{ padding: '4px 8px', background: copiedField === 'adcopy' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: copiedField === 'adcopy' ? '#10b981' : 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            {copiedField === 'adcopy' ? <Check size={10} /> : <Copy size={10} />}
                                                            {copiedField === 'adcopy' ? 'Copiado!' : 'Copiar Texto'}
                                                        </button>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '0.85rem', color: 'white', margin: 0, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{selectedCard.ad_copy || 'Sem cópia'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <label className="field-label" style={{ margin: 0 }}>Selecione o Link do Encurtador/Rotador</label>
                                        <button 
                                            type="button"
                                            onClick={() => setShowCreateLink(!showCreateLink)}
                                            style={{ background: 'transparent', border: 'none', color: '#acf800', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <Plus size={14} /> {showCreateLink ? 'Cancelar' : 'Criar Novo Encurtador'}
                                        </button>
                                    </div>

                                    {showCreateLink ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'white' }}>Criar Link Encurtador Instantâneo</span>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <input 
                                                    className="field-input" 
                                                    placeholder="Título do Link (Ex: WhatsApp Campanha)" 
                                                    value={newLinkTitle} 
                                                    onChange={e => setNewLinkTitle(e.target.value)}
                                                    style={{ height: '38px', fontSize: '0.8rem' }}
                                                />
                                                <input 
                                                    className="field-input" 
                                                    placeholder="Slug/Código (Ex: 144516)" 
                                                    value={newLinkSlug} 
                                                    onChange={e => setNewLinkSlug(e.target.value)}
                                                    style={{ height: '38px', fontSize: '0.8rem' }}
                                                />
                                            </div>
                                            <input 
                                                className="field-input" 
                                                placeholder="URL de Destino Real (Ex: https://wa.me/...)" 
                                                value={newLinkTarget} 
                                                onChange={e => setNewLinkTarget(e.target.value)}
                                                style={{ height: '38px', fontSize: '0.8rem' }}
                                            />
                                            <button 
                                                onClick={handleCreateShortLink}
                                                disabled={isCreatingLink}
                                                style={{ height: '36px', background: '#acf800', color: 'black', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer' }}
                                            >
                                                {isCreatingLink ? 'Criando...' : 'CRIAR E SELECIONAR LINK'}
                                            </button>
                                        </div>
                                    ) : (
                                        <select 
                                            className="field-input" 
                                            value={selectedRotator}
                                            onChange={e => setSelectedRotator(e.target.value)}
                                            style={{ height: '44px', background: 'var(--card-bg)' }}
                                        >
                                            <option value="">Selecione um link do encurtador...</option>
                                            {rotatorLinks.map(l => (
                                                <option key={l.id} value={l.destination_url}>{l.title} ({l.short_code})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {varBindings.length > 0 && (
                                    <div style={{ background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <label className="field-label" style={{ marginBottom: '16px', display: 'block' }}>Vincular Variáveis do Template (Corpo)</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {varBindings.map((val, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.15)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary-color)', minWidth: '45px' }}>{"{{"}{idx + 1}{"}}"}:</span>
                                                    <select 
                                                        className="field-input"
                                                        value={val}
                                                        onChange={e => {
                                                            const copy = [...varBindings];
                                                            copy[idx] = e.target.value;
                                                            setVarBindings(copy);
                                                        }}
                                                        style={{ flex: 1, height: '40px', fontSize: '0.85rem', background: '#090d16', borderColor: 'rgba(255,255,255,0.1)' }}
                                                    >
                                                        <option value="">Preenchimento da Coluna da Planilha...</option>
                                                        <option value="name">Nome do Cliente (Variável na Planilha)</option>
                                                        <option value={selectedCard?.media_url || ''}>Link da Imagem (Mídia do Card)</option>
                                                        <option value={selectedRotator || ''}>Link do Encurtador (Selecionado acima)</option>
                                                        <option value="custom">Valor Fixo Manual / Outro</option>
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                    <button 
                                        onClick={handleProceedToTransition} 
                                        className="action-btn primary-btn" 
                                        style={{ flex: 1, height: '52px', gap: '8px', fontSize: '0.95rem', cursor: 'pointer' }}
                                        disabled={!selectedCard}
                                    >
                                        IR PARA DISPAROS <Play size={18} />
                                    </button>
                                    <button onClick={() => setReconcileModalOpen(false)} className="action-btn ghost-btn" style={{ flex: 1, height: '52px' }}>CANCELAR</button>
                                </div>
                            </div>
                        ) : (
                            /* STEP 2: Iniciar Transmissão Transition Screen */
                            <div className="flex-col gap-4">
                                <div style={{ background: 'rgba(172,248,0,0.03)', border: '1px solid rgba(172,248,0,0.15)', padding: '16px', borderRadius: '12px', fontSize: '0.85rem', color: '#acf800', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    🚀 Tudo pronto! Clique no botão abaixo para abrir o Infobip e rodar a extensão no piloto automático.
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label className="field-label">Nome da Campanha/Transmissão</label>
                                        <input 
                                            className="field-input" 
                                            value={campaignName} 
                                            onChange={e => setCampaignName(e.target.value)} 
                                            placeholder="Ex: Campanha WhatsApp"
                                            style={{ height: '42px', background: 'rgba(0,0,0,0.2)' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">Remetente (Número Selecionado)</label>
                                        <input 
                                            className="field-input" 
                                            value={activeSender} 
                                            disabled
                                            style={{ height: '42px', background: 'rgba(0,0,0,0.4)', opacity: 0.7 }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label className="field-label">Etiqueta/Nome da Planilha no Infobip (Destinatários)</label>
                                        <input 
                                            className="field-input" 
                                            value={transitionExcel} 
                                            onChange={e => setTransitionExcel(e.target.value)} 
                                            placeholder="Nome da etiqueta no Infobip..."
                                            style={{ height: '42px', background: 'rgba(0,0,0,0.2)' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">ID da Transmissão (Card ID)</label>
                                        <input 
                                            className="field-input" 
                                            value={transitionCardId} 
                                            onChange={e => setTransitionCardId(e.target.value)} 
                                            placeholder="Opcional (Em branco se não registrado)..."
                                            style={{ height: '42px', background: 'rgba(0,0,0,0.2)' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label className="field-label">Link da Imagem (Mídia URL)</label>
                                        <input 
                                            className="field-input" 
                                            value={transitionImage} 
                                            onChange={e => setTransitionImage(e.target.value)} 
                                            placeholder="URL da Imagem..."
                                            style={{ height: '42px', background: 'rgba(0,0,0,0.2)' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">Qtd. de Abas</label>
                                        <input 
                                            className="field-input" 
                                            type="number"
                                            value={tabCount} 
                                            onChange={e => setTabCount(e.target.value)} 
                                            style={{ height: '42px', background: 'rgba(0,0,0,0.2)' }}
                                            min="1"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Variables Display with one-click copy buttons */}
                                {varBindings.length > 0 && (
                                    <div style={{ background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <span style={{ fontWeight: 900, color: 'white', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Variáveis Mapeadas para Copiar:</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {varBindings.map((val, idx) => {
                                                const resolvedVal = val === 'name' ? 'Coluna Nome' : val || 'Coluna Planilha';
                                                const fieldId = `c_var_${idx + 1}`;
                                                return (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>
                                                            Variável <strong style={{ color: 'var(--primary-color)' }}>{"{{"}{idx + 1}{"}}"}</strong>: <span style={{ color: 'white' }}>{resolvedVal}</span>
                                                        </span>
                                                        <button onClick={() => handleCopy(resolvedVal, fieldId)} style={{ border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', flexShrink: 0 }}>
                                                            {copiedField === fieldId ? 'Copiado!' : 'Copiar'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Copy Panel */}
                                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', marginTop: '8px' }}>
                                    <span style={{ fontWeight: 900, color: 'white', fontSize: '0.8rem', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Painel de Cópia Rápida para Extensão:</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>Nome da Campanha: <strong style={{ color: 'white' }}>{campaignName}</strong></span>
                                            <button onClick={() => handleCopy(campaignName, 'c_camp')} style={{ border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', flexShrink: 0 }}>
                                                {copiedField === 'c_camp' ? 'Copiado!' : 'Copiar'}
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>Planilha Excel: <strong style={{ color: 'white' }}>{transitionExcel || 'Nenhuma'}</strong></span>
                                            <button onClick={() => handleCopy(transitionExcel, 'c_excel')} style={{ border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', flexShrink: 0 }}>
                                                {copiedField === 'c_excel' ? 'Copiado!' : 'Copiar'}
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>Link da Imagem: <strong style={{ color: 'white' }}>{transitionImage || 'Nenhum'}</strong></span>
                                            <button onClick={() => handleCopy(transitionImage, 'c_image')} style={{ border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', flexShrink: 0 }}>
                                                {copiedField === 'c_image' ? 'Copiado!' : 'Copiar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button 
                                        onClick={handleLaunchExtension} 
                                        className="action-btn primary-btn" 
                                        style={{ flex: 1, height: '52px', gap: '8px', background: '#acf800', color: 'black', fontWeight: 900, cursor: 'pointer' }}
                                    >
                                        INICIAR TRANSMISSÃO AUTOMÁTICA (EXTENSÃO) <ExternalLink size={18} />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setShowLaunchTransition(false)} 
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', marginTop: '8px', textAlign: 'center', width: '100%' }}
                                >
                                    ← Voltar para seleção do Card
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateManager;
