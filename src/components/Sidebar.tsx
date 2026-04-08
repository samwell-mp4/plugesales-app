import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
    User,
    FileUp,
    Layers,
    Sun,
    Moon,
    CreditCard,
    Wallet,
    Zap,
    ChevronDown,
    Settings,
    Activity,
    BarChart3,
    Users,
    Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// --- Submenu Component ---
const SubMenu = ({ item, activePath, isMobile }: { item: any, activePath: string, isMobile: boolean }) => {
    const hasActiveChild = useMemo(() => 
        item.children?.some((child: any) => activePath === child.path || (child.path !== '/' && activePath.startsWith(child.path))),
        [item.children, activePath]
    );
    
    const [isOpen, setIsOpen] = useState(hasActiveChild);

    // Sync only when a child becomes active and it's not currently open
    useEffect(() => {
        if (hasActiveChild) setIsOpen(true);
    }, [hasActiveChild]);

    if (isMobile) {
        return (
            <>
                {item.children.map((child: any) => (
                    <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) => `nav-link-mobile ${isActive ? 'active' : ''}`}
                    >
                        {child.icon && React.cloneElement(child.icon as React.ReactElement<any>, { size: 18 })}
                        <span>{child.name}</span>
                    </NavLink>
                ))}
            </>
        );
    }

    return (
        <div className="submenu-container">
            <div 
                className={`nav-link-group ${hasActiveChild ? 'active-parent' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className={`icon-box ${hasActiveChild ? 'text-primary' : 'text-white/40'}`}>
                        {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
                    </div>
                    <span className="text-[13.5px] font-semibold">{item.name}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 opacity-20 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="ml-5 flex flex-col gap-1 border-l border-white/10 pl-4 py-1 mt-1">
                    {item.children.map((child: any) => (
                        <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) => `sub-link-item ${isActive ? 'active' : ''}`}
                        >
                            {child.name}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Sidebar = () => {
    const { user, logout, theme, toggleTheme } = useAuth();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

    // --- Menu Definition ---
    const menuData = [
        {
            id: 'OPERACIONAL',
            label: 'OPERACIONAL',
            items: [
                { name: 'Contas & Monitor', path: '/accounts', icon: <Activity />, role: 'ADMIN' },
                { name: 'LIVE CHAT', path: '/live-chat', icon: <MessageSquare />, role: 'ADMIN' },
                { name: 'Criar Template', path: '/templates', icon: <MessageSquare />, role: 'ADMIN' },
                { name: 'Upload Clientes', path: '/client-submissions', icon: <FileUp />, role: 'ADMIN' },
                { name: 'Planilhas', path: '/upload', icon: <FileSpreadsheet />, excludeRole: 'CLIENT' },
                { name: 'Hospedagem', path: '/media', icon: <Layers />, role: 'ADMIN' },
                { name: 'Dashboard Client', path: '/client-dashboard', icon: <LayoutDashboard />, role: 'CLIENT' },
                { name: 'Relatórios', path: '/client-reports', icon: <FileSpreadsheet />, role: 'CLIENT' },
            ]
        },
        {
            id: 'CRM',
            label: 'CRM & GESTÃO ESTRATÉGICA',
            items: [
                {
                    name: 'Pipeline de Vendas',
                    icon: <Activity />,
                    children: [
                        { name: 'Análise Geral', path: '/crm/analise', icon: <BarChart3 /> },
                        { name: 'Clientes & Funil', path: '/crm/funil', icon: <Users /> },
                        { name: 'Gestão Consultiva', path: '/crm/consultiva', icon: <Calendar /> },
                    ]
                }
            ]
        },
        {
            id: 'PÁGINAS',
            label: 'CONVERSÃO & LINKS',
            items: [
                {
                    name: 'Ferramentas de Link',
                    icon: <Zap />,
                    children: [
                        { name: 'Encurtador', path: '/link-shortener', icon: <Link /> },
                        { name: 'Rotacionador PRO', path: '/link-rotator', icon: <Zap /> },
                    ]
                }
            ]
        },
        {
            id: 'CARDS',
            label: 'PLUG CARDS',
            items: [
                {
                    name: 'Gestão de Cards',
                    icon: <CreditCard />,
                    children: [
                        { name: 'Marketplace', path: '/plug-cards', icon: <LayoutDashboard /> },
                        { name: 'Meus Cards', path: '/my-cards', icon: <CreditCard /> },
                        { name: 'Minha Wallet', path: '/my-wallet', icon: <Wallet /> },
                        { name: 'Gerenciar Cards', path: '/admin/plug-cards', icon: <Layers />, role: 'ADMIN' },
                    ]
                }
            ]
        },
        {
            id: 'SISTEMA',
            label: 'SISTEMA',
            items: [
                ...(user?.role === 'ADMIN' ? [{ name: 'Controle Adm', path: '/control', icon: <ShieldCheck /> }] : []),
                { name: 'Meu Perfil', path: '/profile', icon: <User /> },
            ]
        }
    ];

    const filteredCats = useMemo(() => {
        return menuData.map(cat => ({
            ...cat,
            items: cat.items.filter((item: any) => {
                const userRole = user?.role || '';
                
                // If item has an 'excludeRole', hide if user has that role
                if (item.excludeRole && userRole === item.excludeRole) return false;
                
                // Standard role logic
                if (item.role === 'ADMIN' && userRole !== 'ADMIN') return false;
                if (item.role === 'CLIENT' && userRole !== 'CLIENT') return false;
                
                // Children check (for submenus)
                if (item.children) {
                    item.children = item.children.filter((child: any) => {
                        if (child.excludeRole && userRole === child.excludeRole) return false;
                        if (child.role === 'ADMIN' && userRole !== 'ADMIN') return false;
                        return true;
                    });
                    return item.children.length > 0;
                }

                return true;
            })
        })).filter(cat => cat.items.length > 0);
    }, [user?.role]);

    // Initialize/Sync collapsed states based on current URL
    useEffect(() => {
        const initialStates: Record<string, boolean> = {};
        filteredCats.forEach(cat => {
            const hasActive = cat.items.some((item: any) => {
                if (item.children) return item.children.some((c: any) => location.pathname === c.path || (c.path !== '/' && location.pathname.startsWith(c.path)));
                return location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            });
            if (cat.id === 'OPERACIONAL') {
                initialStates[cat.id] = false;
            } else {
                initialStates[cat.id] = !hasActive; // Collapse if not active
            }
        });
        setCollapsedCats(initialStates);
    }, [location.pathname, user?.role]); // Re-sync on path change

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (user?.role === 'PENDING_CLIENT') return null;

    return (
        <aside className="sidebar-container">
            <style>{`
                .sidebar-container {
                    position: fixed;
                    left: 20px;
                    top: 20px;
                    bottom: 20px;
                    width: var(--sidebar-width);
                    z-index: 500;
                    background: rgba(10, 15, 25, 0.88);
                    backdrop-filter: blur(24px) saturate(180%);
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    padding: 24px 16px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    transition: all 0.3s ease;
                }
                
                .nav-scroll {
                    flex: 1;
                    overflow-y: auto;
                    margin-top: 20px;
                    padding-right: 4px;
                }
                .nav-scroll::-webkit-scrollbar { width: 3px; }
                .nav-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }

                .category-block { margin-bottom: 20px; }
                
                .category-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px;
                    cursor: pointer;
                    margin-bottom: 6px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    user-select: none;
                }
                .category-toggle:hover { background: rgba(255,255,255,0.03); }
                .category-title {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: rgba(255,255,255,0.3);
                    letter-spacing: 1.5px;
                }

                .nav-link-item, .nav-link-group {
                    padding: 10px 14px;
                    border-radius: 12px;
                    color: rgba(255,255,255,0.5);
                    text-decoration: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-bottom: 2px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                }
                
                .nav-link-item:hover, .nav-link-group:hover {
                    background: rgba(255,255,255,0.04);
                    color: white;
                }

                .nav-link-item.active {
                    background: rgba(172, 248, 0, 0.1);
                    color: var(--primary-color);
                    font-weight: 700;
                    border-left: 3px solid var(--primary-color);
                    border-radius: 4px 12px 12px 4px;
                }
                
                .sub-link-item {
                    padding: 8px 12px;
                    border-radius: 8px;
                    color: rgba(255,255,255,0.35);
                    text-decoration: none;
                    font-size: 0.8rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    display: block;
                }
                .sub-link-item:hover { color: white; background: rgba(255,255,255,0.02); }
                .sub-link-item.active { 
                    color: var(--primary-color); 
                    font-weight: 750;
                    background: rgba(172, 248, 0, 0.05);
                }

                @media (max-width: 768px) {
                    .sidebar-container {
                        width: 100% !important;
                        height: 76px !important;
                        left: 0 !important; right: 0 !important; bottom: 0 !important; top: auto !important;
                        margin: 0 !important; border-radius: 0 !important;
                        padding: 0 12px !important;
                        background: rgba(10, 15, 25, 0.98) !important;
                        border: none;
                        border-top: 1px solid rgba(255,255,255,0.1);
                        flex-direction: row !important;
                    }
                    .logo-header, .user-footer, .category-toggle, .category-title, .sub-link-item { display: none !important; }
                    .nav-scroll {
                        margin-top: 0 !important;
                        display: flex !important;
                        flex-direction: row !important;
                        align-items: center;
                        gap: 12px;
                        overflow-x: auto;
                        padding-right: 0;
                        width: 100%;
                    }
                    .category-block { margin-bottom: 0; }
                    .nav-link-item, .nav-link-mobile {
                        flex: 0 0 auto;
                        flex-direction: column !important;
                        min-width: 72px;
                        padding: 8px !important;
                        gap: 2px !important;
                        font-size: 0.65rem !important;
                        margin-bottom: 0;
                        border-left: none !important;
                        color: rgba(255,255,255,0.4);
                        text-align: center;
                    }
                    .nav-link-item.active, .nav-link-mobile.active {
                        background: transparent !important;
                        color: var(--primary-color) !important;
                        border-bottom: 2px solid var(--primary-color) !important;
                        border-radius: 0;
                    }
                    .nav-link-mobile { display: flex; align-items: center; text-decoration: none; }
                }

                .user-footer {
                    margin-top: auto;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }
                .logout-btn {
                    margin-top: 12px;
                    background: rgba(255,255,255,0.03);
                    color: rgba(255,255,255,0.3);
                    font-size: 0.75rem;
                    font-weight: 800;
                    transition: all 0.2s;
                    border-radius: 12px;
                }
                .logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
            `}</style>

            <div className="logo-header flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20">
                        <MessageSquare size={19} />
                    </div>
                    <span className="font-black text-white text-base tracking-tighter">Plug & Sales</span>
                </div>
                <button onClick={toggleTheme} className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-primary/80 hover:bg-white/10 transition-colors">
                    {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                </button>
            </div>

            <nav className="nav-scroll">
                {filteredCats.map(cat => (
                    <div key={cat.id} className="category-block">
                        <div 
                            className="bg-white/[0.03] px-3 py-2 rounded-lg flex items-center justify-between group hover:bg-white/[0.05] transition-all cursor-pointer mb-2" 
                            onClick={() => { if(cat.id !== 'OPERACIONAL') setCollapsedCats(p => ({ ...p, [cat.id]: !p[cat.id] })); }}
                            style={{ cursor: cat.id === 'OPERACIONAL' ? 'default' : 'pointer' }}
                        >
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[2px] group-hover:text-primary transition-colors">{cat.label}</span>
                            {cat.id !== 'OPERACIONAL' && (
                                <ChevronDown size={10} className={`opacity-20 transition-transform ${collapsedCats[cat.id] ? '-rotate-90' : ''}`} />
                            )}
                        </div>
                        {!collapsedCats[cat.id] && (
                            <div className="flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                {cat.items.map((item: any) => (
                                    item.children ? (
                                        <SubMenu key={item.name} item={item} activePath={location.pathname} isMobile={isMobile} />
                                    ) : (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                                        >
                                            <div className={`${location.pathname === item.path ? 'text-primary' : 'text-white/30'}`}>
                                                {item.icon && React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
                                            </div>
                                            <span className="font-semibold text-white/70">{item.name}</span>
                                        </NavLink>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <div className="user-footer">
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center gap-3 shadow-inner">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 border border-white/5">
                        <UserCircle size={26} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{user?.name}</span>
                        <span className="text-[10px] font-black text-primary opacity-70 tracking-tighter uppercase">{user?.role}</span>
                    </div>
                </div>
                <button onClick={() => { if(window.confirm('Sair da conta?')) logout(); }} className="logout-btn w-full py-2.5 flex items-center justify-center gap-2 cursor-pointer border border-white/5">
                    <LogOut size={15} /> SAIR
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
