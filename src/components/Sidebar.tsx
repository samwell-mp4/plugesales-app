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
                { name: 'Contas & Monitor', path: '/accounts', icon: <Activity />, roles: ['ADMIN', 'EMPLOYEE'] },
                // { name: 'LIVE CHAT', path: '/live-chat', icon: <MessageSquare />, roles: ['ADMIN'] }, // Oculto por enquanto
                { name: 'Criar Template', path: '/templates', icon: <MessageSquare />, roles: ['ADMIN', 'EMPLOYEE'] },
                { name: 'Upload Clientes', path: '/client-submissions', icon: <FileUp />, roles: ['ADMIN', 'EMPLOYEE'] },
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
                { name: 'Clientes & Funil', path: '/crm/funil', icon: <Users /> },
                { name: 'Gestão Consultiva', path: '/crm/consultiva', icon: <Calendar /> },
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
                if (item.roles) {
                    if (!item.roles.includes(userRole)) return false;
                } else if (item.role) {
                    if (item.role !== userRole) return false;
                }
                
                // Children check (for submenus)
                if (item.children) {
                    item.children = item.children.filter((child: any) => {
                        if (child.excludeRole && userRole === child.excludeRole) return false;
                        if (child.roles) {
                            if (!child.roles.includes(userRole)) return false;
                        } else if (child.role) {
                            if (child.role !== userRole) return false;
                        }
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
        <aside className="sidebar-supreme">
            <div className="sidebar-supreme-logo">
                <div className="w-10 h-10 rounded-2xl bg-primary-gradient flex items-center justify-center text-black shadow-lg shadow-primary-color/20">
                    <Zap size={22} fill="currentColor" />
                </div>
                <div>
                    <span className="font-black text-white text-lg tracking-tighter block leading-tight">Plug & Sales</span>
                    <span className="text-[9px] font-black text-primary-color tracking-[0.2em] uppercase opacity-60">Operations Center</span>
                </div>
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
                                        <SubMenu key={item.name} item={item} activePath={location.pathname} isMobile={isMobile} />
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
