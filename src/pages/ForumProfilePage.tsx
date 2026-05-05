import React, { useState, useEffect } from 'react';
import { User, MessageSquare, Settings, Save, ArrowLeft, Camera, Trash2, Zap, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/dbService';

const ForumProfilePage = () => {
    const [activeTab, setActiveTab] = useState<'comments' | 'edit'>('comments');
    const [user, setUser] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        avatar: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('pns_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setFormData({
                name: parsed.name || '',
                email: parsed.email || '',
                bio: parsed.bio || 'Membro da comunidade Plug & Sales.',
                avatar: parsed.avatar || ''
            });
            loadUserComments(parsed.id || 1);
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadUserComments = async (userId: number) => {
        setIsLoading(true);
        // Em um cenário real, chamamos o dbService
        // const data = await dbService.getForumUserComments(userId);
        
        // Simulação de dados para visualização imediata
        setTimeout(() => {
            setComments([
                { id: 1, postTitle: 'Como evitar bloqueios no WhatsApp API', text: 'Realmente, o aquecimento do número é crucial. Eu perdi 3 números antes de entender isso!', date: 'Há 2 dias', likes: 12 },
                { id: 2, postTitle: 'Estratégias de disparo em massa', text: 'Os botões de resposta rápida aumentaram meu CTR em 30%. Recomendo!', date: 'Há 1 semana', likes: 8 },
                { id: 3, postTitle: 'Guia de SEO para Blogs', text: 'Ótimas dicas de estruturação de H1 e H2.', date: 'Há 3 semanas', likes: 2 }
            ]);
            setIsLoading(false);
        }, 800);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Simulação de salvamento
        setTimeout(() => {
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('pns_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsSaving(false);
            alert('Perfil atualizado com sucesso! ✨');
        }, 1000);
    };

    if (!user && !isLoading) {
        return (
            <div className="profile-error-container">
                <div className="glass-card-supreme text-center" style={{maxWidth: '500px', padding: '60px'}}>
                    <Zap size={60} color="#acf800" style={{marginBottom: '20px'}} />
                    <h2>Acesso Restrito</h2>
                    <p>Você precisa estar logado na comunidade para acessar seu perfil.</p>
                    <Link to="/blog" className="action-btn primary-btn" style={{marginTop: '30px', display: 'inline-block', textDecoration: 'none', color: '#000'}}>Voltar ao Blog</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="forum-profile-container">
            {/* Background Decorations */}
            <div className="sp-blob sp-blob-1"></div>
            <div className="sp-blob sp-blob-2"></div>

            <div className="container profile-layout">
                {/* Header Section */}
                <header className="profile-header animate-fade-in">
                    <Link to="/blog" className="back-link">
                        <ArrowLeft size={18} /> Voltar ao Blog
                    </Link>
                    <div className="profile-info-main">
                        <div className="profile-avatar-large">
                            {formData.avatar ? <img src={formData.avatar} alt="Avatar" /> : <span>{formData.name.charAt(0)}</span>}
                            <button className="edit-avatar-btn"><Camera size={16} /></button>
                        </div>
                        <div className="profile-text-main">
                            <h1>{formData.name}</h1>
                            <p className="user-role-badge">Membro da Comunidade</p>
                            <p className="user-bio-preview">{formData.bio}</p>
                        </div>
                    </div>
                </header>

                {/* Tabs Navigation */}
                <nav className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('comments')}
                    >
                        <MessageSquare size={18} /> Meus Comentários
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                        onClick={() => setActiveTab('edit')}
                    >
                        <Settings size={18} /> Editar Perfil
                    </button>
                </nav>

                {/* Tab Content */}
                <div className="profile-content animate-slide-up">
                    {activeTab === 'comments' ? (
                        <div className="comments-history">
                            {isLoading ? (
                                <div className="loading-state">Carregando seus comentários...</div>
                            ) : comments.length > 0 ? (
                                comments.map(comment => (
                                    <div key={comment.id} className="comment-history-card glass-card-supreme">
                                        <div className="comment-history-header">
                                            <span className="post-ref-title">{comment.postTitle}</span>
                                            <span className="comment-date"><Calendar size={14} /> {comment.date}</span>
                                        </div>
                                        <p className="comment-text-content">"{comment.text}"</p>
                                        <div className="comment-stats">
                                            <span><Zap size={14} /> {comment.likes} reações</span>
                                            <button className="delete-comment-btn"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <MessageSquare size={40} opacity={0.3} />
                                    <p>Você ainda não fez nenhum comentário.</p>
                                    <Link to="/blog">Ir para o Blog</Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="edit-profile-section glass-card-supreme">
                            <form onSubmit={handleUpdateProfile} className="profile-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nome Público</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="Seu nome visível no blog"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>E-mail (Privado)</label>
                                        <input 
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Bio / Sobre Mim</label>
                                        <textarea 
                                            value={formData.bio}
                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                            placeholder="Conte um pouco sobre você..."
                                            rows={4}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="save-profile-btn" disabled={isSaving}>
                                        {isSaving ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .forum-profile-container {
                    min-height: 100vh;
                    background: #05070a;
                    padding-top: 120px;
                    padding-bottom: 80px;
                    position: relative;
                    overflow: hidden;
                }

                .profile-error-container {
                    min-height: 100vh;
                    background: #05070a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .profile-layout {
                    max-width: 1000px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 5;
                }

                .profile-header {
                    margin-bottom: 50px;
                }

                .back-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: rgba(255,255,255,0.5);
                    text-decoration: none;
                    font-size: 0.9rem;
                    margin-bottom: 30px;
                    transition: 0.3s;
                }

                .back-link:hover {
                    color: var(--primary-color);
                }

                .profile-info-main {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                }

                .profile-avatar-large {
                    width: 120px;
                    height: 120px;
                    border-radius: 40px;
                    background: linear-gradient(135deg, #222 0%, #111 100%);
                    border: 2px solid rgba(172, 248, 0, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    font-weight: 900;
                    color: var(--primary-color);
                    position: relative;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                }

                .profile-avatar-large img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 40px;
                }

                .edit-avatar-btn {
                    position: absolute;
                    bottom: -10px;
                    right: -10px;
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    background: var(--primary-gradient);
                    border: none;
                    color: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                }

                .profile-text-main h1 {
                    font-size: 2.8rem;
                    font-weight: 900;
                    margin-bottom: 8px;
                    background: linear-gradient(135deg, #fff 0%, #888 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .user-role-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    background: rgba(172, 248, 0, 0.1);
                    color: var(--primary-color);
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                }

                .user-bio-preview {
                    color: rgba(255,255,255,0.6);
                    font-size: 1.1rem;
                    max-width: 600px;
                }

                .profile-tabs {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 40px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 1px;
                }

                .tab-btn {
                    background: none;
                    border: none;
                    padding: 16px 24px;
                    color: rgba(255,255,255,0.5);
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    position: relative;
                    transition: 0.3s;
                }

                .tab-btn:hover {
                    color: #fff;
                }

                .tab-btn.active {
                    color: var(--primary-color);
                }

                .tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--primary-color);
                    box-shadow: 0 0 10px var(--primary-color);
                }

                .comment-history-card {
                    margin-bottom: 24px;
                    border-radius: 24px;
                    padding: 30px;
                }

                .comment-history-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .post-ref-title {
                    font-weight: 800;
                    color: #fff;
                    font-size: 1.1rem;
                }

                .comment-date {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.4);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .comment-text-content {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: rgba(255,255,255,0.8);
                    font-style: italic;
                    margin-bottom: 20px;
                }

                .comment-stats {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--primary-color);
                    font-weight: 700;
                    font-size: 0.9rem;
                }

                .delete-comment-btn {
                    background: none;
                    border: none;
                    color: rgba(255,77,77,0.4);
                    cursor: pointer;
                    transition: 0.3s;
                }

                .delete-comment-btn:hover {
                    color: #ff4d4d;
                }

                .profile-form {
                    padding: 20px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }

                .form-group.full-width {
                    grid-column: span 2;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 12px;
                    color: rgba(255,255,255,0.6);
                    font-weight: 700;
                    font-size: 0.9rem;
                }

                .form-group input, .form-group textarea {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 14px;
                    padding: 16px;
                    color: #fff;
                    font-size: 1rem;
                    outline: none;
                    transition: 0.3s;
                }

                .form-group input:focus, .form-group textarea:focus {
                    border-color: var(--primary-color);
                    background: rgba(172, 248, 0, 0.05);
                }

                .form-actions {
                    margin-top: 40px;
                    display: flex;
                    justify-content: flex-end;
                }

                .save-profile-btn {
                    background: var(--primary-gradient);
                    color: #000;
                    border: none;
                    padding: 18px 36px;
                    border-radius: 16px;
                    font-weight: 900;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: 0.3s;
                }

                .save-profile-btn:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(172, 248, 0, 0.3);
                }

                .save-profile-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                    color: rgba(255,255,255,0.3);
                }

                .empty-state p {
                    margin: 20px 0;
                }

                .empty-state a {
                    color: var(--primary-color);
                    font-weight: 800;
                    text-decoration: none;
                }

                @media (max-width: 1024px) {
                    .profile-layout { padding: 0 24px; }
                }

                @media (max-width: 768px) {
                    .forum-profile-container { padding-top: 100px; }
                    .profile-info-main { flex-direction: column; text-align: center; gap: 20px; }
                    .profile-avatar-large { width: 100px; height: 100px; font-size: 2.5rem; }
                    .profile-text-main h1 { font-size: 2.2rem; }
                    .user-bio-preview { font-size: 1rem; }
                    .profile-tabs { overflow-x: auto; padding-bottom: 5px; }
                    .tab-btn { padding: 12px 16px; font-size: 0.9rem; white-space: nowrap; }
                    .form-grid { grid-template-columns: 1fr; gap: 20px; }
                    .form-group.full-width { grid-column: span 1; }
                    .comment-history-header { flex-direction: column; align-items: flex-start; gap: 8px; }
                    .comment-stats { flex-direction: column; align-items: flex-start; gap: 12px; }
                }

                @media (max-width: 480px) {
                    .profile-text-main h1 { font-size: 1.8rem; }
                    .comment-history-card { padding: 20px; }
                    .comment-text-content { font-size: 1rem; }
                    .save-profile-btn { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default ForumProfilePage;
