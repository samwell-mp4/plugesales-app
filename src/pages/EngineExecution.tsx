import { useState, useEffect } from 'react';
import { Activity, Play, Square, RefreshCcw, CheckCircle2, AlertCircle, AlertTriangle, Terminal, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/dbService';

const EngineExecution = () => {
    const { user } = useAuth();
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [transmissionId, setTransmissionId] = useState<string>('');
    
    // Advanced Logs with more metadata
    const [logs, setLogs] = useState<{ 
        id: number; 
        time: string; 
        type: 'SYSTEM' | 'BATCH' | 'SUCCESS' | 'ERROR' | 'WARNING'; 
        waba: string; 
        recipient?: string;
        transmissionId: string;
        message: string; 
        payload?: any;
    }[]>([]);

    // Filtering
    const [filterText, setFilterText] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    // Stats
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);

    // Campaign Data
    const [campaign, setCampaign] = useState<any>(null);

    const apiKey = '37fef1b6f2e0ee4882c502213c133b32-420e5355-d24c-4ff0-a1ba-56def5c595cc';

    useEffect(() => {
        // Load campaign from DB
        dbService.getActiveCampaign().then(activeCampaign => {
            if (activeCampaign) setCampaign(activeCampaign);
        });
        
        // Load logs from DB
        dbService.getEngineLogs().then(dbLogs => {
            const mapped = dbLogs.map((l: any) => ({
                id: l.id,
                time: new Date(l.timestamp).toLocaleTimeString('pt-BR'),
                type: l.log_type as any,
                waba: l.waba,
                recipient: l.recipient,
                transmissionId: l.transmission_id || '',
                message: l.message,
                payload: l.payload
            }));
            setLogs(mapped);
        });

        // Load stats from Redis
        dbService.getEngineStats().then(stats => {
            setSuccessCount(stats.success || 0);
            setErrorCount(stats.error || 0);
        });

        // Handle Auto-Start
        const params = new URLSearchParams(window.location.search);
        const start = params.get('start');
        const idx = params.get('idx');

        if (start === 'all') {
            setTimeout(() => { runEngine(); }, 1000);
        } else if (start === 'single' && idx !== null) {
            setTimeout(() => { runEngine(parseInt(idx)); }, 1000);
        }
    }, []);

    const addLog = (logData: {
        type: 'SYSTEM' | 'BATCH' | 'SUCCESS' | 'ERROR' | 'WARNING';
        waba: string;
        recipient?: string;
        message: string;
        payload?: any;
    }) => {
        const newLog = {
            id: Date.now(),
            time: new Date().toLocaleTimeString('pt-BR'),
            transmissionId: transmissionId,
            ...logData
        };
        setLogs(prev => [newLog, ...prev].slice(0, 1000));
        
        // Persist to DB (fire and forget)
        dbService.addEngineLog({
            transmissionId: transmissionId,
            logType: logData.type,
            waba: logData.waba,
            recipient: logData.recipient,
            message: logData.message,
            payload: logData.payload
        }).catch(console.error);
    };

    useEffect(() => {
        dbService.saveEngineStats(successCount, errorCount).catch(console.error);
    }, [successCount, errorCount]);

    const runEngine = async (specificIndex?: number) => {
        const activeCampaign = campaign || await dbService.getActiveCampaign();
        if (!activeCampaign) return;
        const tid = `TX_${Date.now()}`;
        setTransmissionId(tid);
        setIsRunning(true);
        setProgress(0);
        
        const modeLabel = specificIndex !== undefined ? `Lote Individual #${specificIndex + 1}` : 'Estratégia Completa';
        addLog({ type: 'SYSTEM', waba: 'LOCAL', message: `🚀 Iniciando [${modeLabel}] [${tid}]: ${activeCampaign.name}` });

        let processed = 0;
        let totalRecords = 0;
        
        // Filter steps based on mode
        const stepsToProcess = specificIndex !== undefined 
            ? [activeCampaign.steps[specificIndex]] 
            : activeCampaign.steps;

        // Calculate real total from contact lists
        const uniqueChips = new Set(stepsToProcess.map((s: any) => s.wabaId)).size;
        totalRecords = 0; // Reset existing totalRecords
        const enrichedSteps = await Promise.all(stepsToProcess.map(async (s: any) => {
            const contacts = await dbService.getContactsByTag(s.listTag) || [];
            totalRecords += contacts.length;
            return { ...s, contacts };
        }));

        for (let sIdx = 0; sIdx < enrichedSteps.length; sIdx++) {
            if (!isRunning && processed > 0) break;
            setCurrentStepIndex(specificIndex !== undefined ? specificIndex : sIdx);
            const step = enrichedSteps[sIdx];
            
            addLog({ type: 'BATCH', waba: step.wabaId, message: `Lote ${sIdx + 1}: Processando ${step.contacts.length} contatos da lista ${step.listTag}` });

            const batchSize = 100;
            for (let i = 0; i < step.contacts.length; i += batchSize) {
                if (!isRunning && (processed > 0 || i > 0)) break;
                
                const batch = step.contacts.slice(i, i + batchSize);
                
                const payload = {
                    messages: batch.map((contact: any) => ({
                        from: step.wabaId || '5511997625247',
                        to: contact.telefone.trim(),
                        content: {
                            templateName: step.templateInstance,
                            templateData: {
                                body: {
                                    placeholders: step.meta?.placeholders?.map((p: any) => p.value) || []
                                }
                            },
                            language: step.meta?.language || 'pt_BR'
                        }
                    }))
                };

                // Add header if present
                payload.messages.forEach((msg: any) => {
                    if (step.meta?.headerType !== 'NONE' && step.meta?.mediaUrl) {
                        msg.content.templateData.header = {
                            type: step.meta.headerType,
                            mediaUrl: step.meta.mediaUrl
                        };
                    }
                    if (step.meta?.buttonType || step.meta?.includeButton) {
                        const bType = step.meta.buttonType || 'QUICK_REPLY';
                        const bValue = step.meta.buttonPayload || 'default_value';
                        
                        msg.content.templateData.buttons = [
                            {
                                type: bType,
                                ...(bType === 'QUICK_REPLY' ? { payload: bValue } : { parameter: bValue })
                            }
                        ];
                    }
                });

                try {
                    const response = await fetch('https://8k6xv1.api-us.infobip.com/whatsapp/1/message/template', {
                        method: 'POST',
                        headers: {
                            'Authorization': `App ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        setSuccessCount(prev => prev + batch.length);
                        addLog({ type: 'SUCCESS', waba: step.wabaId, message: `Sucesso: Lote enviado para ${batch.length} destinatários.` });
                    } else {
                        const err = await response.json();
                        setErrorCount(prev => prev + batch.length);
                        // Log full payload on error for better debugging
                        addLog({ type: 'ERROR', waba: step.wabaId, message: `Erro API: ${JSON.stringify(err)}`, payload: payload });
                    }
                } catch (error: any) {
                    setErrorCount(prev => prev + batch.length);
                    addLog({ type: 'ERROR', waba: step.wabaId, message: `Erro Conexão: ${error.message}` });
                }

                processed += batch.length;
                setProgress(Math.round((processed / totalRecords) * 100));

                if (i + batchSize < step.contacts.length || sIdx < enrichedSteps.length - 1) {
                    await new Promise(r => setTimeout(r, step.delay * 1000));
                }
            }
        }

        // Track in audit_logs (DB)
        await dbService.addLog({
            logType: 'ENGINE',
            author: user?.name || 'Sistema',
            mode: specificIndex !== undefined ? 'SINGLE_STEP' : 'FULL_STRATEGY',
            transmissionId: tid,
            campaignName: activeCampaign.name,
            total: totalRecords
        });

        setIsRunning(false);
        addLog({ type: 'SYSTEM', waba: 'LOCAL', message: '✅ Ciclo de execução finalizado.' });
    };

    const stopEngine = () => {
        setIsRunning(false);
        addLog({ type: 'WARNING', waba: 'LOCAL', message: '🛑 Parada manual solicitada.' });
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
            <style>{`
                .execution-grid { display: grid; grid-template-columns: 1fr 380px; gap: 32px; }
                .terminal-card { 
                    background: var(--code-bg); 
                    border: 1px solid var(--surface-border-subtle); 
                    border-radius: 20px; 
                    font-family: 'JetBrains Mono', 'Fira Code', monospace; 
                    overflow: hidden;
                    box-shadow: var(--shadow-xl);
                }
                .terminal-header { background: var(--card-bg-subtle); padding: 12px 20px; border-bottom: 1px solid var(--surface-border-subtle); display: flex; justify-content: space-between; align-items: center; }
                .terminal-body { height: 500px; padding: 20px; overflow-y: auto; color: var(--text-primary); font-size: 0.85rem; line-height: 1.6; }
                .log-line { margin-bottom: 8px; border-bottom: 1px solid var(--surface-border-subtle); padding-bottom: 4px; display: flex; gap: 12px; }
                .log-time { color: var(--text-muted); min-width: 70px; }
                .log-type { padding: 2px 6px; borderRadius: 4px; fontSize: 0.7rem; fontWeight: 700; height: fit-content; }
                .type-system { background: rgba(172, 248, 0, 0.1); color: #acf800; border: 1px solid rgba(172, 248, 0, 0.2); }
                .type-batch { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); }
                .type-warning { background: rgba(251, 191, 36, 0.1); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.2); }
                
                .progress-bar-container { height: 12px; background: var(--surface-border-subtle); border-radius: 6px; overflow: hidden; margin: 20px 0; border: 1px solid var(--surface-border-subtle); }
                .progress-bar-fill { 
                    height: 100%; 
                    background: linear-gradient(90deg, #acf800, #4ade80); 
                    box-shadow: 0 0 20px rgba(172, 248, 0, 0.5);
                    transition: width 0.3s ease;
                }

                @media (max-width: 1100px) {
                    .execution-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', letterSpacing: '-1.5px', margin: 0 }}>Execução do Motor</h1>
                    <p className="subtitle">Monitoramento em tempo real do processamento de escala</p>
                </div>
                <div className="flex gap-4">
                    {!isRunning ? (
                        <button className="btn btn-primary" onClick={() => runEngine()} style={{ color: 'black', fontWeight: 800, padding: '14px 28px', fontSize: '1.1rem' }}>
                            <Play size={20} fill="black" /> DISPARAR ESTRATÉGIA
                        </button>
                    ) : (
                        <button className="btn btn-danger" onClick={stopEngine} style={{ background: '#ef4444', color: 'white', fontWeight: 800, padding: '14px 28px', border: 'none' }}>
                            <Square size={20} fill="white" /> PARAR AGORA
                        </button>
                    )}
                </div>
            </div>

            <div className="execution-grid mt-10">
                <div className="flex-col gap-6">
                    {/* Progress Overview */}
                    <div className="glass-card flex-col p-8" style={{ background: 'var(--card-bg-subtle)', border: '1px solid var(--surface-border-subtle)' }}>
                        <div className="flex items-center justify-between">
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Status Geral do Motor</h3>
                            <span style={{ color: isRunning ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: 800, fontSize: '0.9rem' }}>
                                {isRunning ? 'EXECUTANDO...' : 'AGUARDANDO COMANDO'}
                            </span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            <span>Progresso: {progress}%</span>
                            <span>{currentStepIndex + 1} de {campaign?.steps?.length || 0} lotes processados</span>
                        </div>
                    </div>

                    <div className="terminal-card">
                        <div className="terminal-header" style={{ height: 'auto', flexWrap: 'wrap', gap: '12px' }}>
                            <div className="flex items-center gap-2">
                                <Terminal size={16} color="var(--primary-color)" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', opacity: 0.8 }}>ENGINE_OUTPUT_LOG</span>
                            </div>
                            
                            <div className="flex gap-4 items-center flex-1 justify-end">
                                <div className="input-group" style={{ margin: 0, minWidth: '150px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Filtrar por número..." 
                                        className="input-field" 
                                        style={{ fontSize: '0.7rem', padding: '6px 12px', borderRadius: '8px', background: 'var(--card-bg-subtle)', color: 'var(--text-primary)' }}
                                        value={filterText}
                                        onChange={e => setFilterText(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="input-field" 
                                    style={{ fontSize: '0.7rem', padding: '6px 12px', borderRadius: '8px', background: 'var(--card-bg-subtle)', color: 'var(--text-primary)', width: 'auto' }}
                                    value={filterType}
                                    onChange={e => setFilterType(e.target.value)}
                                >
                                    <option value="ALL">Todos os Tipos</option>
                                    <option value="SUCCESS">Sucessos</option>
                                    <option value="ERROR">Erros</option>
                                    <option value="BATCH">Lotes</option>
                                    <option value="SYSTEM">Sistema</option>
                                </select>
                                <button 
                                    onClick={() => { setLogs([]); dbService.clearEngineLogs(); }}
                                    style={{ background: 'transparent', border: 'none', color: '#ff5f56', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800 }}
                                >
                                    LIMPAR
                                </button>
                            </div>
                        </div>
                        <div className="terminal-body">
                            {(() => {
                                const filtered = logs.filter(log => {
                                    const matchType = filterType === 'ALL' || log.type === filterType;
                                    const matchText = !filterText || log.recipient?.includes(filterText) || log.message.includes(filterText) || log.transmissionId.includes(filterText);
                                    return matchType && matchText;
                                });

                                return filtered.length > 0 ? filtered.map(log => (
                                    <div key={log.id} className="log-line" style={{ flexDirection: 'column', gap: '4px' }}>
                                        <div className="flex gap-3 items-center">
                                            <span className="log-time">[{log.time}]</span>
                                            <span className={`log-type type-${log.type.toLowerCase()}`}>{log.type}</span>
                                            <span style={{ color: '#6366f1', fontWeight: 700, fontSize: '0.7rem' }}>{log.waba}</span>
                                            {log.transmissionId && <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>{log.transmissionId}</span>}
                                            <span style={{ flex: 1 }}>{log.message}</span>
                                        </div>
                                        {log.payload && (
                                            <pre style={{ fontSize: '0.65rem', background: 'var(--card-bg-subtle)', padding: '8px', borderRadius: '4px', margin: '4px 0 8px 85px', overflowX: 'auto', border: '1px solid var(--surface-border-subtle)' }}>
                                                {JSON.stringify(log.payload, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                )) : (
                                    <div className="flex items-center justify-center h-full opacity-30 flex-col">
                                        <Activity size={48} className="mb-4" />
                                        <p>Aguardando submissão de estratégia para monitoramento...</p>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* Performance Metrics Column */}
                <div className="flex-col gap-6">
                    <div className="glass-card flex-col p-8 items-center text-center">
                        <div style={{ background: 'rgba(172, 248, 0, 0.1)', color: 'var(--primary-color)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                            <BarChart3 size={32} />
                        </div>
                        <h3 style={{ margin: 0, fontWeight: 800 }}>Performance</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Métricas de conversão em tempo real</p>

                        <div className="flex-col gap-4 w-full mt-8">
                            <div className="flex justify-between items-center p-5" style={{ background: 'rgba(74, 222, 128, 0.05)', borderRadius: '16px', border: '1px solid rgba(74, 222, 128, 0.1)' }}>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={18} color="#4ade80" />
                                    <span style={{ fontWeight: 600 }}>Entregues</span>
                                </div>
                                <b style={{ fontSize: '1.4rem', color: '#4ade80' }}>{successCount.toLocaleString()}</b>
                            </div>
                            <div className="flex justify-between items-center p-5" style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={18} color="#f87171" />
                                    <span style={{ fontWeight: 600 }}>Erros</span>
                                </div>
                                <b style={{ fontSize: '1.4rem', color: '#f87171' }}>{errorCount.toLocaleString()}</b>
                            </div>
                        </div>

                        <div className="mt-8 p-6 w-full" style={{ background: 'var(--card-bg-subtle)', borderRadius: '20px', border: '1px solid var(--surface-border-subtle)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <RefreshCcw size={14} color="var(--text-muted)" />
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Auto-Scaling WABAs</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                                O motor está configurado para <b>alternar remetentes</b> automaticamente caso detecte uma taxa de erro acima de {Math.round((errorCount / (successCount + errorCount || 1)) * 100)}%.
                            </p>
                        </div>
                    </div>

                    <div className="glass-card flex-col p-8" style={{ background: 'var(--primary-color)', color: 'black' }}>
                        <div className="flex items-center gap-3 mb-2">
                            <AlertCircle size={24} />
                            <h3 style={{ margin: 0, fontWeight: 900 }}>Segurança de Elite</h3>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.5 }}>
                            Loop Infinito Ativo. Monitorando envios em tempo real. Filtros avançados disponíveis para auditoria de transmissão.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EngineExecution;
