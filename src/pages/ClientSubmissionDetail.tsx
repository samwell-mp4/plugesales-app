import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    User,
    FileText,
    Link as LinkIcon, 
    CheckCircle, 
    Shield, 
    Smartphone,
    Download,
    ExternalLink,
    Clock,
    Layout
} from 'lucide-react';
import { dbService } from '../services/dbService';

interface Ad {
    ad_name: string;
    template_type: string;
    media_url: string;
    ad_copy: string;
    ad_copy_file: string;
    message_mode: 'manual' | 'upload';
    button_link: string;
    variables: string[];
    id: string;
}

interface ClientSubmission {
    id: number;
    profile_photo: string;
    profile_name: string;
    ddd: string;
    status: string;
    accepted_by: string;
    sender_number: string;
    ads: Ad[];
    spreadsheet_url: string;
    timestamp: string;
}

const ClientSubmissionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState<ClientSubmission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [senderNumber, setSenderNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const submissions = await dbService.getClientSubmissions();
            const found = submissions.find((s: any) => s.id === Number(id));
            if (found) {
                setSubmission(found);
                setSenderNumber(found.sender_number || '');
            }
        } catch (err) {
            console.error("Error loading submission detail:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleSaveSender = async () => {
        if (!id) return;
        setIsSaving(true);
        try {
            await dbService.updateClientSubmission(Number(id), { sender_number: senderNumber });
            alert("Número da BM salvo com sucesso!");
            loadData();
        } catch (err) {
            console.error("Error saving sender:", err);
            alert("Erro ao salvar número.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white/40 font-bold uppercase tracking-widest text-xs">Carregando detalhes...</span>
            </div>
        </div>
    );

    if (!submission) return (
        <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-3xl font-black mb-4">404</h2>
                <p className="text-white/40 mb-8">Submissão não encontrada.</p>
                <button onClick={() => navigate('/client-submissions')} className="btn btn-primary">VOLTAR</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/client-submissions')}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex items-center gap-4">
                            {submission.profile_photo ? (
                                <img src={submission.profile_photo} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20" />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border-2 border-white/10">
                                    <User size={32} className="opacity-20" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-black tracking-tight leading-none mb-2">{submission.profile_name}</h1>
                                <div className="flex items-center gap-3">
                                    <span className="text-primary text-[10px] font-black tracking-widest uppercase bg-primary/10 px-2 py-1 rounded">DDD {submission.ddd}</span>
                                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                        <Clock size={12} /> {new Date(submission.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block mr-4">
                            <span className="block text-white/40 text-[9px] font-black tracking-[2px] uppercase mb-1">Responsável</span>
                            <span className="block text-white font-bold text-sm">{submission.accepted_by || 'Aguardando'}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border font-black text-[10px] tracking-widest ${submission.status === 'GERADO' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                            {submission.status}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Configuration */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Shield size={80} />
                            </div>
                            
                            <div>
                                <h3 className="text-[10px] font-black text-primary tracking-[3px] uppercase mb-6 flex items-center gap-2">
                                    <Smartphone size={14} /> Atribuição de Sender
                                </h3>
                                <p className="text-white/40 text-xs mb-6 leading-relaxed">
                                    Informe o número da BM que será utilizado para realizar disparos para este cliente.
                                </p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-black text-white/30 tracking-[1px] uppercase ml-1 mb-2 block">Número da BM (Sender)</label>
                                        <input 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-white/10"
                                            placeholder="Ex: 5511999999999"
                                            value={senderNumber}
                                            onChange={e => setSenderNumber(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={handleSaveSender}
                                        disabled={isSaving}
                                        className="w-full bg-primary text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? 'SALVANDO...' : <>SALVAR CONFIGURAÇÃO <CheckCircle size={18} /></>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
                            <h3 className="text-[10px] font-black text-white/40 tracking-[3px] uppercase mb-2 flex items-center gap-2">
                                <FileText size={14} /> Arquivos da Demanda
                            </h3>
                            
                            <div className="space-y-3">
                                {submission.spreadsheet_url && (
                                    <a 
                                        href={submission.spreadsheet_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Download size={16} /></div>
                                            <div>
                                                <span className="block text-xs font-bold">Planilha de Contatos</span>
                                                <span className="block text-[10px] text-white/20">Clique para baixar</span>
                                            </div>
                                        </div>
                                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                )}
                                
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 opacity-50 cursor-not-allowed">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Layout size={16} /></div>
                                    <div>
                                        <span className="block text-xs font-bold">Relatório de Envios</span>
                                        <span className="block text-[10px] text-white/20">Disponível após disparo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Ads List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-white/40 tracking-[3px] uppercase flex items-center gap-2">
                                <Layout size={14} /> Anúncios Solicitados ({submission.ads?.length || 0})
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {submission.ads?.map((ad, idx) => (
                                <div key={ad.id || idx} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs text-white/20">
                                                #{idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm uppercase tracking-wider">{ad.ad_name || `Anúncio ${idx + 1}`}</h4>
                                                <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                                    {ad.template_type.toUpperCase()} • {ad.message_mode === 'manual' ? 'TEXTO MANUAL' : 'ARQUIVO DE MENSAGEM'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {ad.media_url && (
                                            <a 
                                                href={ad.media_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg text-primary text-[10px] font-black hover:bg-primary/20 transition-all"
                                            >
                                                VER MÍDIA <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                            <span className="block text-[9px] font-bold text-white/20 uppercase tracking-widest mb-3">Conteúdo da Mensagem</span>
                                            {ad.message_mode === 'upload' ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={16} className="text-primary" />
                                                        <span className="text-xs font-bold text-white/60">Arquivo de Mensagem OK</span>
                                                    </div>
                                                    <a href={ad.ad_copy_file} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                                                        <Download size={14} />
                                                    </a>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap line-clamp-4 italic">
                                                    "{ad.ad_copy}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                            <span className="block text-[9px] font-bold text-white/20 uppercase tracking-widest mb-3">Variáveis do Template</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                {ad.variables?.map((v, i) => (
                                                    <div key={i} className="flex flex-col">
                                                        <span className="text-[8px] font-black text-white/10 uppercase mb-1">VAR {i + 1}</span>
                                                        <span className="text-xs font-bold text-white/40 truncate">{v || '-'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {ad.button_link && (
                                        <div className="mt-4 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <LinkIcon size={14} className="text-blue-500" />
                                                <span className="text-[10px] font-black text-blue-500/60 tracking-widest uppercase">Link Externo configurado</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-white/30 truncate max-w-[200px]">{ad.button_link}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientSubmissionDetail;
