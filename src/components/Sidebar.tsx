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
    Calendar,
    Menu,
    X,
    Bell,
    Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


import SupremeLogo from './SupremeLogo';


// --- Submenu Component ---
const SubMenu = ({ item, activePath }: { item: any, activePath: string }) => {
    const hasActiveChild = useMemo(() => 
        item.children?.some((child: any) => activePath === child.path || (child.path !== '/' && activePath.startsWith(child.path))),
        [item.children, activePath]
    );
    
    const [isOpen, setIsOpen] = useState(hasActiveChild);

    useEffect(() => {
        if (hasActiveChild) setIsOpen(true);
    }, [hasActiveChild]);

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
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

    // Close drawer on navigation
    useEffect(() => {
        setIsDrawerOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuData = [
        {
            id: 'OPERACIONAL',
            label: 'OPERACIONAL',
            items: [
                { name: 'Contas & Monitor', path: '/accounts', icon: <Activity />, roles: ['ADMIN', 'EMPLOYEE'] },
                { name: 'Criar Template', path: '/templates', icon: <MessageSquare />, roles: ['ADMIN', 'EMPLOYEE'] },
                { name: 'Upload Clientes', path: '/client-submissions', icon: <FileUp />, roles: ['ADMIN', 'EMPLOYEE'] },
                { name: 'Pendências Alteração', path: '/admin/changes', icon: <Bell />, roles: ['ADMIN', 'EMPLOYEE'] },
                { name: 'Planilhas', path: '/upload', icon: <FileSpreadsheet />, excludeRole: 'CLIENT' },
                { name: 'Hospedagem', path: '/media', icon: <Layers />, roles: ['ADMIN', 'EMPLOYEE'] },
                { name: 'Dashboard Client', path: '/client-dashboard', icon: <LayoutDashboard />, role: 'CLIENT' },
                { name: 'Relatórios', path: '/client-reports', icon: <FileSpreadsheet />, role: 'CLIENT' },
            ]
        },
        {
            id: 'CRM',
            label: 'CRM E GESTÃO',
            items: [
                { name: 'Clientes & Funil', path: '/crm/funil', icon: <Users />, roles: ['ADMIN', 'EMPLOYEE'] },
                { name: 'Gestão Consultiva', path: '/crm/consultiva', icon: <Calendar />, roles: ['ADMIN', 'EMPLOYEE'] },
                { name: 'Monitor de Banco', path: '/crm/n8n-monitor', icon: <Database />, roles: ['ADMIN', 'EMPLOYEE'] },
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
                if (item.excludeRole && userRole === item.excludeRole) return false;
                if (item.roles && !item.roles.includes(userRole)) return false;
                if (item.role && item.role !== userRole) return false;
                if (item.children) {
                    item.children = item.children.filter((child: any) => {
                        if (child.excludeRole && userRole === child.excludeRole) return false;
                        if (child.roles && !child.roles.includes(userRole)) return false;
                        if (child.role && child.role !== userRole) return false;
                        return true;
                    });
                    return item.children.length > 0;
                }
                return true;
            })
        })).filter(cat => cat.items.length > 0);
    }, [user?.role]);

    useEffect(() => {
        const initialStates: Record<string, boolean> = {};
        filteredCats.forEach(cat => {
            const hasActive = cat.items.some((item: any) => {
                if (item.children) return item.children.some((c: any) => location.pathname === c.path || (c.path !== '/' && location.pathname.startsWith(c.path)));
                return location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            });
            initialStates[cat.id] = cat.id === 'OPERACIONAL' ? false : !hasActive;
        });
        setCollapsedCats(initialStates);
    }, [location.pathname, user?.role]);

    if (user?.role === 'PENDING_CLIENT') return null;

    // --- RENDER MOBILE ---
    if (isMobile) {
        // Operational Shortcuts
        const mobileShortcuts = user?.role === 'CLIENT' 
            ? [
                { icon: <LayoutDashboard />, path: '/client-dashboard' },
                { icon: <FileSpreadsheet />, path: '/client-reports' },
                { icon: <User />, path: '/profile' }
            ]
            : [
                { icon: <LayoutDashboard />, path: '/upload' },
                { icon: <Users />, path: '/crm/funil' },
                { icon: <Activity />, path: '/accounts' },
                { icon: <MessageSquare />, path: '/templates' }
            ];

        return (
            <>
                <div className="mobile-bottom-nav">
                    {mobileShortcuts.map((sc, i) => (
                        <NavLink key={i} to={sc.path} className={({ isActive }) => `nav-item-mobile ${isActive ? 'active' : ''}`}>
                            {React.cloneElement(sc.icon as React.ReactElement<any>, { size: 22 })}
                        </NavLink>
                    ))}
                    <button onClick={() => setIsDrawerOpen(true)} className={`nav-item-mobile nav-item-mobile-menu ${isDrawerOpen ? 'active' : ''}`}>
                        <Menu size={22} />
                    </button>
                </div>

                <div className={`mobile-drawer-backdrop ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)} />
                <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
                    <div className="drawer-handle" />
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-black">
                                <Zap size={16} fill="currentColor" />
                            </div>
                            <span className="font-black text-white text-lg tracking-tighter">Plug & Sales</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-white/30"><X size={20} /></button>
                        </div>
                    </div>

                    {filteredCats.map(cat => (
                        <div key={cat.id} className="mb-6">
                            <div className="drawer-cat-label">{cat.label}</div>
                            <div className="flex flex-col gap-1">
                                {cat.items.map((item: any) => (
                                    item.children ? (
                                        item.children.map((child: any) => (
                                            <NavLink key={child.path} to={child.path} className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`}>
                                                <div className="drawer-icon-box">{React.cloneElement((child.icon || item.icon) as React.ReactElement<any>, { size: 18 })}</div>
                                                <span>{child.name}</span>
                                            </NavLink>
                                        ))
                                    ) : (
                                        <NavLink key={item.path} to={item.path} className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`}>
                                            <div className="drawer-icon-box">{React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}</div>
                                            <span>{item.name}</span>
                                        </NavLink>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary-color font-bold">{user?.name?.charAt(0)}</div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm">{user?.name}</span>
                                <span className="text-[10px] text-white/30 uppercase tracking-widest">{user?.role}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => { if(window.confirm('Sair da conta?')) logout(); }} 
                            className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
                        >
                            <LogOut size={18} /> ENCERRAR SESSÃO
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // --- RENDER DESKTOP ---
    return (
        <aside className="sidebar-supreme">
            <div className="sidebar-supreme-logo">
                <SupremeLogo size={28} animate="shimmer" />
                <span className="logo-text-supreme">
                    PLUG <span className="logo-text-highlight-supreme">&</span> SALES
                </span>
            </div>

            <nav className="nav-scroll flex-1">
                {filteredCats.map(cat => (
                    <div key={cat.id} className="sidebar-supreme-cat">
                        <div className="flex items-center justify-between mb-3 px-2">
                            <span className="cat-label-supreme">{cat.label}</span>
                            {cat.id !== 'OPERACIONAL' && (
                                <button 
                                    onClick={() => setCollapsedCats(p => ({ ...p, [cat.id]: !p[cat.id] }))}
                                    className="text-white/20 hover:text-primary-color transition-colors"
                                >
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${collapsedCats[cat.id] ? '-rotate-90' : ''}`} />
                                </button>
                            )}
                        </div>
                        
                        {!collapsedCats[cat.id] && (
                            <div className="flex flex-col gap-1">
                                {cat.items.map((item: any) => (
                                    item.children ? (
                                        <SubMenu key={item.name} item={item} activePath={location.pathname} />
                                    ) : (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) => `nav-link-supreme ${isActive ? 'active' : ''}`}
                                        >
                                            <div className="icon-box-supreme">
                                                {item.icon && React.cloneElement(item.icon as React.ReactElement<any>, { size: 19 })}
                                            </div>
                                            <span>{item.name}</span>
                                        </NavLink>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <div className="user-footer-supreme">
                <div className="user-card-supreme" style={{ justifyContent: 'center', textAlign: 'center' }}>
                    <span className="text-[13px] font-black text-white truncate leading-tight uppercase tracking-[0.1em]">{user?.name}</span>
                </div>
                
                <button 
                    onClick={() => { if(window.confirm('Sair da conta?')) logout(); }} 
                    className="logout-btn-supreme"
                >
                    <LogOut size={16} /> ENCERRAR SESSÃO
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
