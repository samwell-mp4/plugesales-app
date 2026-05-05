import { Link } from 'react-router-dom';
import { Zap, Instagram, Linkedin, MessageSquare } from 'lucide-react';
import SupremeLogo from './SupremeLogo';

const PublicFooter = () => {
    return (
        <footer className="public-footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="nav-logo-wrapper">
                            <SupremeLogo size={32} animate="none" showText={false} />
                            <div className="nav-brand-text">
                                PLUG <span className="text-primary-color">&</span> SALES
                            </div>
                        </Link>
                        <p className="footer-tagline">
                            Potencializando vendas através da API Oficial do WhatsApp com tecnologia de ponta e escala ilimitada.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-icon"><Instagram size={20} /></a>
                            <a href="#" className="social-icon"><Linkedin size={20} /></a>
                            <a href="#" className="social-icon"><MessageSquare size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-links-group">
                        <h4>Plataforma</h4>
                        <Link to="/apresentacoes">Recursos</Link>
                        <Link to="/apresentacoes">Soluções</Link>
                        <Link to="/blog">Blog</Link>
                        <Link to="/login">Login</Link>
                    </div>

                    <div className="footer-links-group">
                        <h4>Empresa</h4>
                        <Link to="/sobre">Sobre Nós</Link>
                        <Link to="/sobre">Carreiras</Link>
                        <Link to="/sobre">Contato</Link>
                    </div>

                    <div className="footer-links-group">
                        <h4>Legal</h4>
                        <a href="#">Termos de Uso</a>
                        <a href="#">Privacidade</a>
                        <a href="#">Diretrizes Meta</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 Plug & Sales Pro. Todos os direitos reservados. Operação Profissional de WhatsApp API.</p>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
