import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, User, LogOut, MessageSquare, Settings, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import SupremeLogo from './SupremeLogo';

const PublicNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        
        const storedUser = localStorage.getItem('pns_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('pns_user');
        setUser(null);
        window.location.reload();
    };

    const navLinks = [
        { name: 'Início', path: '/' },
        { name: 'Sobre', path: '/sobre' },
        { name: 'Apresentações', path: '/apresentacoes' },
        { name: 'Blog', path: '/blog' },
    ];

    return (
        <nav className={`public-navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <Link to="/" className="nav-logo-wrapper">
                    <SupremeLogo size={32} animate="shimmer" showText={false} />
                    <div className="nav-brand-text">
                        PLUG <span className="text-primary-color">&</span> SALES
                    </div>
                </Link>

                <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                    {navLinks.map((link) => (
                        <Link 
                            key={link.path} 
                            to={link.path} 
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    
                    {user ? (
                        <div className="user-profile-nav">
                            <button className="user-profile-btn" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                                <div className="user-avatar-small">{user.avatar || user.name[0]}</div>
                                <span className="user-name-text">{user.name.split(' ')[0]}</span>
                                <ChevronDown size={14} className={isProfileOpen ? 'rotate-180' : ''} />
                            </button>

                            {isProfileOpen && (
                                <div className="profile-dropdown glass-card-supreme">
                                    <div className="dropdown-header">
                                        <strong>{user.name}</strong>
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <Link to="/perfil/comentarios" className="dropdown-item">
                                        <MessageSquare size={16} /> Meus Comentários
                                    </Link>
                                    <Link to="/perfil/editar" className="dropdown-item">
                                        <Settings size={16} /> Editar Perfil
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                                        <LogOut size={16} /> Sair da Conta
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="nav-btn-login">
                            Área do Cliente
                        </Link>
                    )}
                </div>

                <button className="nav-mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
};

export default PublicNavbar;
