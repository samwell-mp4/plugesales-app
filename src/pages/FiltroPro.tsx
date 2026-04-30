import React, { useState } from 'react';
import { 
    FileUp, 
    Zap, 
    Trash2, 
    CheckCircle2, 
    Download, 
    AlertCircle,
    Activity,
    ShieldCheck,
    Smartphone,
    UserCheck,
    Settings2
} from 'lucide-react';

const FiltroPro = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [options, setOptions] = useState({
        removeGreen: true,
        removeCold: true,
        removeBlack: true,
        removeAny: false
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const processFile = async () => {
        if (!file) return;
        setIsLoading(true);

        try {
            const text = await file.text();
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
            
            // Extract numbers (assuming first column if CSV)
            const numbers = lines.map(line => line.split(',')[0].replace(/\D/g, '')).filter(n => n.length > 5);

            const res = await fetch('/api/monitor/filter-pro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumbers: numbers, options })
            });

            const data = await res.json();
            if (res.ok) {
                setResult(data);
            } else {
                alert(data.error || "Erro ao processar.");
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao ler arquivo.");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadCleanedList = () => {
        if (!result) return;
        const csvContent = result.filteredNumbers.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `lista_limpa_pro_${Date.now()}.csv`);
        link.click();
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <style>{`
                .filter-card {
                    background: var(--card-bg-subtle);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(172, 248, 0, 0.08);
                    border-radius: 32px;
                    padding: 40px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                .option-pill {
                    padding: 16px 24px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.05);
                    background: rgba(255,255,255,0.02);
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    flex: 1;
                    min-width: 250px;
                }
                .option-pill.active {
                    background: rgba(172, 248, 0, 0.05);
                    border-color: var(--primary-color);
                    box-shadow: 0 10px 30px rgba(172, 248, 0, 0.1);
                }
                .drop-zone {
                    border: 2px dashed rgba(172, 248, 0, 0.2);
                    border-radius: 24px;
                    padding: 60px 40px;
                    text-align: center;
                    background: rgba(172, 248, 0, 0.01);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }
                .drop-zone:hover {
                    border-color: var(--primary-color);
                    background: rgba(172, 248, 0, 0.03);
                }
                .stat-box {
                    background: rgba(255,255,255,0.03);
                    padding: 24px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.05);
                    text-align: center;
                }
                .shimmer {
                    background: linear-gradient(90deg, transparent, rgba(172, 248, 0, 0.1), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '12px 24px', background: 'rgba(172, 248, 0, 0.1)', borderRadius: '100px', marginBottom: '24px', alignItems: 'center', gap: '10px' }}>
                    <Zap size={18} color="var(--primary-color)" fill="var(--primary-color)" />
                    <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '3px', textTransform: 'uppercase' }}>Ferramenta Avançada</span>
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-3px', marginBottom: '16px', background: 'linear-gradient(to right, #fff, var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' }}>Filtro PRO</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                    Limpeza inteligente de listas. Compare seus leads com as listas Green, Cold e Black do sistema e gere arquivos limpos instantaneamente.
                </p>
            </div>

            <div className="filter-card">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div className={`option-pill ${options.removeGreen ? 'active' : ''}`} onClick={() => setOptions(o => ({ ...o, removeGreen: !o.removeGreen, removeAny: false }))}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                        <span style={{ fontWeight: 800 }}>Remover Green List</span>
                        {options.removeGreen && <CheckCircle2 size={16} color="var(--primary-color)" style={{ marginLeft: 'auto' }} />}
                    </div>
                    <div className={`option-pill ${options.removeCold ? 'active' : ''}`} onClick={() => setOptions(o => ({ ...o, removeCold: !o.removeCold, removeAny: false }))}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
                        <span style={{ fontWeight: 800 }}>Remover Cold List</span>
                        {options.removeCold && <CheckCircle2 size={16} color="var(--primary-color)" style={{ marginLeft: 'auto' }} />}
                    </div>
                    <div className={`option-pill ${options.removeBlack ? 'active' : ''}`} onClick={() => setOptions(o => ({ ...o, removeBlack: !o.removeBlack, removeAny: false }))}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
                        <span style={{ fontWeight: 800 }}>Remover Black List</span>
                        {options.removeBlack && <CheckCircle2 size={16} color="var(--primary-color)" style={{ marginLeft: 'auto' }} />}
                    </div>
                    <div className={`option-pill ${options.removeAny ? 'active' : ''}`} onClick={() => setOptions({ removeGreen: false, removeCold: false, removeBlack: false, removeAny: !options.removeAny })}>
                        <Activity size={18} color={options.removeAny ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)'} />
                        <span style={{ fontWeight: 800 }}>Remover QUALQUER ID</span>
                        {options.removeAny && <CheckCircle2 size={16} color="var(--primary-color)" style={{ marginLeft: 'auto' }} />}
                    </div>
                </div>

                {!result ? (
                    <div className="drop-zone" onClick={() => document.getElementById('file-input')?.click()}>
                        <input type="file" id="file-input" hidden accept=".csv,.txt" onChange={handleFileUpload} />
                        <FileUp size={48} color="var(--primary-color)" style={{ marginBottom: '24px', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
                            {file ? file.name : "Clique para enviar sua lista original"}
                        </h3>
                        <p style={{ opacity: 0.4, fontSize: '14px' }}>Arraste seu arquivo CSV ou TXT aqui ou clique para navegar</p>
                        
                        {file && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); processFile(); }}
                                disabled={isLoading}
                                style={{ marginTop: '32px', padding: '16px 48px', background: 'var(--primary-color)', border: 'none', borderRadius: '16px', color: 'black', fontWeight: 900, fontSize: '15px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(172, 248, 0, 0.3)' }}
                            >
                                {isLoading ? (
                                    <>
                                        <Activity className="animate-spin" size={20} />
                                        PROCESSANDO...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={20} fill="black" />
                                        LIMPAR LISTA AGORA
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                            <div className="stat-box">
                                <div style={{ fontSize: '11px', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px' }}>Original</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900 }}>{result.stats.original}</div>
                            </div>
                            <div className="stat-box" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                                <div style={{ fontSize: '11px', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px' }}>Removidos</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444' }}>-{result.stats.removed}</div>
                            </div>
                            <div className="stat-box" style={{ borderColor: 'var(--primary-color)' }}>
                                <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '8px' }}>Limpos</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary-color)' }}>{result.filteredNumbers.length}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button 
                                onClick={downloadCleanedList}
                                style={{ flex: 1, padding: '24px', background: 'var(--primary-color)', border: 'none', borderRadius: '24px', color: 'black', fontWeight: 950, fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', boxShadow: '0 20px 40px rgba(172, 248, 0, 0.2)' }}
                            >
                                <Download size={24} /> BAIXAR LISTA LIMPA (CSV)
                            </button>
                            <button 
                                onClick={() => { setFile(null); setResult(null); }}
                                style={{ padding: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', color: 'white', fontWeight: 800, cursor: 'pointer' }}
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '40px', padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ padding: '12px', background: 'rgba(172, 248, 0, 0.1)', borderRadius: '14px' }}>
                    <ShieldCheck size={24} color="var(--primary-color)" />
                </div>
                <div>
                    <h4 style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Como funciona o Filtro PRO?</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        Nossa ferramenta cruza os números do seu arquivo com o histórico do Monitor de Banco. Se um número for encontrado e estiver marcado nas listas que você selecionou (Green, Cold ou Black), ele será removido do arquivo final. Isso garante que você nunca envie mensagens repetidas para quem já foi categorizado.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FiltroPro;
