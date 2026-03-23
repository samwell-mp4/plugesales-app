import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageSquare,
    FileSpreadsheet,
    Link,
    Send,
    LogOut,
    Home,
    ShieldCheck,
    UserCircle,
    FileUp,
    Layers,
    Smartphone,
    Sun,
    Moon
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';


const Sidebar = () => {
    const { user, setUser, logout, theme, toggleTheme } = useAuth();
    const [isEditingNotify, setIsEditingNotify] = useState(false);
    const [notifyNum, setNotifyNum] = useState(user?.notification_number || '5531988868362');

    useEffect(() => {
        setNotifyNum(user?.notification_number || '5531988868362');
    }, [user]);

    const handleSaveNotify = async () => {
        if (!user?.id) {
            alert("Erro: Usuário sem ID interno. Por favor, faça LogOut e LogIn novamente para sincronizar seu perfil.");
            return;
        }

        // Clean the number: keep only digits
        const cleaned = notifyNum.replace(/\D/g, '');
        if (!cleaned || cleaned.length < 10) {
            alert("Por favor, insira um número válido com DDD (ex: 31988887777).");
            return;
        }

        try {
            const updated = await dbService.updateProfile({ id: user.id, notification_number: cleaned });
            if (updated && !updated.error) {
                setUser(updated);
                setIsEditingNotify(false);
                alert("✅ Número de notificação atualizado com sucesso!");
            } else {
                alert("❌ Erro ao salvar: " + (updated?.error || "Resposta inválida do servidor"));
            }
        } catch (err) {
            console.error(err);
            alert("❌ Erro de conexão ao salvar perfil. Verifique sua internet ou tente novamente.");
        }
    };

    const menuItems = user?.role === 'CLIENT' ? [
        { name: 'Meu Painel', path: '/client-dashboard', icon: <Home size={20} /> },
        { name: 'Meus Links', path: '/link-shortener', icon: <Link size={20} /> },
    ] : user?.role === 'EMPLOYEE' ? [
        { name: 'Home', path: '/dashboard', icon: <Home size={20} /> },
        { name: 'Minhas Tarefas', path: '/client-submissions', icon: <FileUp size={20} /> },
        { name: 'Hospedagem', path: '/media', icon: <Layers size={21} /> },
        { name: 'Encurtador', path: '/link-shortener', icon: <Link size={20} /> },
        { name: 'Contas & Monitor', path: '/accounts', icon: <LayoutDashboard size={20} /> },
        { name: 'Criar Template', path: '/templates', icon: <MessageSquare size={20} /> },
    ] : [
        { name: 'Home', path: '/dashboard', icon: <Home size={20} /> },
        { name: 'Contas & Monitor', path: '/accounts', icon: <LayoutDashboard size={20} /> },
        { name: 'Criar Template', path: '/templates', icon: <MessageSquare size={20} /> },
        { name: 'Upload de Clientes', path: '/client-submissions', icon: <FileUp size={20} /> },
        { name: 'Preparar Planilha', path: '/upload', icon: <FileSpreadsheet size={20} /> },
        { name: 'Hospedagem', path: '/media', icon: <Layers size={21} /> },
        { name: 'Encurtador', path: '/link-shortener', icon: <Link size={20} /> },
        { name: 'Criar Transmissão', path: '/dispatch', icon: <Send size={20} />, special: true },
    ];

    // Add Admin Control only if user is Admin
    if (user?.role === 'ADMIN') {
        menuItems.push({ name: 'Controle', path: '/control', icon: <ShieldCheck size={20} color="var(--primary-color)" /> });
    }

    const handleLogout = () => {
        if (window.confirm('Deseja realmente sair?')) {
            logout();
        }
    };

    return (
        <aside className="sidebar flex-col glass-sidebar">
            <style>{`
                .sidebar {
                    width: var(--sidebar-width);
                    margin: 16px 0 16px 16px;
                    padding: 24px 16px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    border-radius: 24px;
                    transition: all 0.3s ease;
                }
                .glass-sidebar { 
                    background: var(--surface-color); 
                    backdrop-filter: blur(20px); 
                    border: 1px solid var(--surface-border);
                    box-shadow: var(--shadow-md);
                }
                .nav-link:hover { background: rgba(172, 248, 0, 0.05) !important; color: white !important; }
                .nav-link.active { 
                    background: rgba(172, 248, 0, 0.1) !important; 
                    color: white !important;
                    border-left-color: var(--primary-color) !important;
                }
                
                @media (max-width: 768px) {
                    .sidebar {
                        width: 100% !important;
                        margin: 0 !important;
                        border-radius: 0 !important;
                        flex-direction: row !important;
                        height: 70px !important;
                        padding: 0 10px !important;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        z-index: 1000;
                        border-top: 1px solid var(--surface-border);
                    }
                    .logo-container { display: none !important; }
                    .sidebar-content {
                        width: 100%;
                        height: 100%;
                    }
                    .sidebar nav {
                        flex-direction: row !important;
                        height: 100%;
                        width: 100%;
                        justify-content: space-around;
                        align-items: center;
                        margin-top: 0 !important;
                        display: flex !important;
                    }
                    .nav-link {
                        flex: 1;
                        flex-direction: column !important;
                        gap: 4px !important;
                        padding: 8px 4px !important;
                        font-size: 0.6rem !important;
                        border-left: none !important;
                        border-bottom: 3px solid transparent;
                        justify-content: center;
                    }
                    .nav-link span {
                        font-size: 9px !important;
                        text-align: center;
                        white-space: nowrap;
                    }
                    .nav-link.active {
                        border-bottom: 3px solid var(--primary-color) !important;
                        border-left: none !important;
                    }
                    .user-info-section, .logout-btn { display: none !important; }
                }

                @keyframes nav-pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(172, 248, 0, 0.4); }
                    70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(172, 248, 0, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(172, 248, 0, 0); }
                }

                .special-nav {
                    background: var(--primary-color) !important;
                    color: black !important;
                    font-weight: 800 !important;
                    margin-top: 16px !important;
                    animation: nav-pulse 2s infinite;
                    box-shadow: 0 4px 15px rgba(172, 248, 0, 0.3);
                }
                
                @media (max-width: 768px) {
                    .special-nav {
                        margin-top: 0 !important;
                        border-radius: 8px !important;
                    }
                }

                .special-nav:hover {
                    background: #c3ff5c !important;
                    transform: translateY(-2px);
                }
                .special-nav span { color: black !important; font-weight: 900 !important; }
                .special-nav svg { color: black !important; }

                .user-info-section {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
                .user-avatar-container {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid rgba(172, 248, 0, 0.2);
                }
                .user-avatar-container.admin {
                    background: var(--primary-gradient);
                    box-shadow: 0 0 20px rgba(172, 248, 0, 0.15);
                    color: black;
                }
                .user-status-dot {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    border: 3px solid #0f172a;
                    box-shadow: 0 0 10px var(--primary-color);
                }
                .user-name { font-size: 0.9rem; font-weight: 900; color: var(--text-primary); letter-spacing: -0.2px; }
                .user-role { 
                    font-size: 0.6rem; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: 1px; 
                    color: var(--primary-color); 
                    opacity: 0.9; 
                    margin-top: 1px; 
                }
                .logout-btn {
                    background: rgba(255, 77, 77, 0.05);
                    border: 1px solid rgba(255, 77, 77, 0.1);
                    color: #ff4d4d;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.2s ease;
                }
                .logout-btn:hover {
                    background: rgba(255, 77, 77, 0.1);
                    color: #ff6666;
                }
            `}</style>

            <div className="sidebar-content">
                <div className="logo-container mb-6 flex items-center justify-center gap-2">
                    <div style={{ background: 'var(--primary-gradient)', padding: '7px', borderRadius: '15px', display: 'flex', boxShadow: '0 0 20px rgba(172, 248, 0, 0.3)' }}>
                        <MessageSquare color="white" size={24} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Plug & Sales</h2>
                    <button 
                        onClick={toggleTheme}
                        className="theme-toggle-btn"
                        style={{
                            marginLeft: 'auto',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--surface-border)',
                            color: 'var(--primary-color)',
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>

                {/* Individual Notification Number Section at the TOP */}
                <div className="mx-2 mb-4 p-3 rounded-xl" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(172, 248, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                }}>
                    <div className="flex items-center justify-between">
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase' }}>Notificações</span>
                        {!isEditingNotify ? (
                            <button onClick={() => setIsEditingNotify(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700 }}>EDITAR</button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={handleSaveNotify} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800 }}>SALVAR</button>
                                <button onClick={() => setIsEditingNotify(false)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800 }}>X</button>
                            </div>
                        )}
                    </div>
                    {!isEditingNotify ? (
                        <div className="flex items-center gap-2">
                            <Smartphone size={14} color="var(--primary-color)" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{user?.notification_number || '5531988868362'}</span>
                        </div>
                    ) : (
                        <input
                            value={notifyNum}
                            onChange={(e) => setNotifyNum(e.target.value)}
                            className="input-field"
                            style={{ height: '28px', fontSize: '0.8rem', padding: '0 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(172,248,0,0.3)' }}
                            placeholder="Ex: 551199..."
                        />
                    )}
                </div>

                <nav className="flex flex-col gap-1 mt-6">
                    {menuItems.map((item: any) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link flex items-center gap-4 ${isActive ? 'active' : ''} ${item.special ? 'special-nav' : ''}`
                            }
                            style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                color: 'var(--text-secondary)',
                                background: 'transparent',
                                textDecoration: 'none',
                                fontWeight: 500,
                                transition: 'all 0.2s ease',
                                borderLeft: item.special ? 'none' : '3px solid transparent',
                                marginBottom: item.special ? '8px' : '2px'
                            }}
                        >
                            {item.icon}
                            <span style={{ fontSize: '0.85rem' }}>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="mt-auto flex flex-col gap-2">
                <div className="user-info-section mx-2 mb-2 p-4 rounded-[24px]">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className={`user-avatar-container flex items-center justify-center h-12 w-12 rounded-2xl overflow-hidden ${user?.role === 'ADMIN' ? 'admin' : ''}`}>
                                <UserCircle size={28} strokeWidth={1.5} />
                            </div>
                            <div className="user-status-dot"></div>
                        </div>

                        <div className="flex flex-col min-w-0">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>
                </div>

                <button onClick={handleLogout} className="logout-btn mx-2 mb-4 p-3 rounded-xl">
                    <LogOut size={16} /> Entrar com outra conta
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
