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
        { name: 'Criar Tramissão', path: '/dispatch', icon: <Send size={20} /> },
        { name: 'Preparar Planilha', path: '/upload', icon: <FileSpreadsheet size={20} /> },
        { name: 'Encurtador de Link', path: '/media', icon: <Link size={20} /> },
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
            `}</style>

            <div>
                <div className="logo-container mb-6 flex items-center justify-center gap-2">
                    <div style={{ background: 'var(--primary-gradient)', padding: '7px', borderRadius: '15px', display: 'flex', boxShadow: '0 0 20px rgba(172, 248, 0, 0.3)' }}>
                        <MessageSquare color="white" size={24} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>Plug & Sales</h2>
                </div>

                <nav className="flex-col gap-1 mt-6">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link flex items-center gap-4 ${isActive ? 'active' : ''}`
                            }
                            style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                color: 'var(--text-secondary)',
                                background: 'transparent',
                                textDecoration: 'none',
                                fontWeight: 500,
                                transition: 'all 0.2s ease',
                                borderLeft: '3px solid transparent',
                                marginBottom: '2px'
                            }}
                        >
                            {item.icon}
                            <span style={{ fontSize: '0.85rem' }}>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="mt-auto px-2 mb-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl" style={{ background: user?.role === 'ADMIN' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.1)' }}>
                        <UserCircle size={22} color={user?.role === 'ADMIN' ? 'white' : 'var(--text-secondary)'} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{user?.name}</span>
                        <span className="text-[10px] font-medium uppercase tracking-wider opacity-40">{user?.role}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="nav-link flex items-center gap-4 logout-btn"
                style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    color: '#ff4d4d',
                    background: 'transparent',
                    border: 'none',
                    borderLeft: '3px solid transparent',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                }}
            >
                <LogOut size={20} />
                <span style={{ fontSize: '0.85rem' }}>Encerrar Sessão</span>
            </button>
        </aside>
    );
}

export default Sidebar;
