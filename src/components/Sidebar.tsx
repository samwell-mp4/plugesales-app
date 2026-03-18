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
    UserCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


const Sidebar = () => {
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Home', path: '/dashboard', icon: <Home size={20} /> },
        { name: 'Contas & Monitor', path: '/accounts', icon: <LayoutDashboard size={20} /> },
        { name: 'Criar Template', path: '/templates', icon: <MessageSquare size={20} /> },
        { name: 'Preparar Planilha', path: '/upload', icon: <FileSpreadsheet size={20} /> },
        { name: 'Encurtador de Link', path: '/media', icon: <Link size={20} /> },
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
        <aside className="sidebar flex-col glass-sidebar" style={{
            width: 'var(--sidebar-width)',
            margin: '16px 0 16px 16px',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: '24px'
        }}>
            <style>{`
                .glass-sidebar { 
                    background: rgba(15, 23, 42, 0.6); 
                    backdrop-filter: blur(20px); 
                    border: 1px solid var(--surface-border);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
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
                        z-index: 1000;
                        border-top: 1px solid var(--surface-border);
                        border-left: none !important;
                    }
                    .logo-container { display: none !important; }
                    .sidebar nav {
                        flex-direction: row !important;
                        height: 100%;
                        width: 100%;
                        justify-content: space-around;
                        align-items: center;
                        margin-top: 0 !important;
                    }
                    .nav-link {
                        flex-direction: column !important;
                        gap: 4px !important;
                        padding: 8px !important;
                        font-size: 0.6rem !important;
                        border-left: none !important;
                        border-bottom: 3px solid transparent;
                    }
                    .nav-link.active {
                        border-bottom: 3px solid var(--primary-color) !important;
                        border-left: none !important;
                    }
                    .logout-btn { display: none !important; }
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
                .special-nav:hover {
                    background: #c3ff5c !important;
                    transform: translateY(-2px);
                }
                .special-nav span { color: black !important; font-weight: 900 !important; }
                .special-nav svg { color: black !important; }
            `}</style>

            <div>
                <div className="logo-container mb-6 flex items-center justify-center gap-2">
                    <div style={{ background: 'var(--primary-gradient)', padding: '7px', borderRadius: '15px', display: 'flex', boxShadow: '0 0 20px rgba(172, 248, 0, 0.3)' }}>
                        <MessageSquare color="white" size={24} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>Plug & Sales</h2>
                </div>

                <nav className="flex-col gap-1 mt-6">
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
                <div className="mx-2 mb-2 p-4 rounded-[24px]" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }}>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="flex items-center justify-center h-12 w-12 rounded-2xl overflow-hidden" style={{
                                background: user?.role === 'ADMIN' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
                                border: '2px solid rgba(172, 248, 0, 0.2)',
                                boxShadow: user?.role === 'ADMIN' ? '0 0 20px rgba(172, 248, 0, 0.15)' : 'none'
                            }}>
                                <UserCircle size={28} color={user?.role === 'ADMIN' ? 'black' : 'var(--text-secondary)'} strokeWidth={1.5} />
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: '-2px',
                                right: '-2px',
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                background: 'var(--primary-color)',
                                border: '3px solid #0f172a',
                                boxShadow: '0 0 10px var(--primary-color)'
                            }}></div>
                        </div>

                        <div className="flex flex-col min-w-0">
                            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'white', letterSpacing: '-0.2px' }}>{user?.name}</span>
                            <span style={{
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                color: 'var(--primary-color)',
                                opacity: 0.9,
                                marginTop: '1px'
                            }}>{user?.role}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 mx-2 mb-4 p-3 rounded-xl transition-all duration-200"
                    style={{
                        background: 'rgba(255, 77, 77, 0.05)',
                        border: '1px solid rgba(255, 77, 77, 0.1)',
                        color: '#ff4d4d',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        justifyContent: 'center'
                    }}
                >
                    <LogOut size={16} /> Entrar com outra conta
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
