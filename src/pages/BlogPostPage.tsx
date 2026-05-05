import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
    ArrowLeft, Calendar, User, Share2, Facebook, Twitter, 
    Link as LinkIcon, MessageSquare, ThumbsUp, Send, 
    MoreVertical, TrendingUp, Clock, ChevronRight, Zap, ShieldCheck, X, Search, Mail, Users, ArrowUpRight, Home
} from 'lucide-react';
import { dbService } from '../services/dbService';

const initialPosts: any = {
    'como-evitar-bloqueios-whatsapp-api': {
        title: 'O Guia Definitivo: Como Evitar Bloqueios na API Oficial do WhatsApp (WABA)',
        description: 'Aprenda as estratégias avançadas de conformidade, aquecimento de números e políticas da Meta para manter sua operação de WhatsApp 100% segura e escalável.',
        category: 'Segurança & Escala',
        author: 'Especialista em WABA',
        date: '05 Mai, 2026',
        readTime: '15 min',
        image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&q=80&w=1200',
        content: `
            <p>No cenário atual do marketing digital, o WhatsApp se consolidou como o canal de maior conversão do mercado. No entanto, com o aumento do volume de mensagens, a Meta (empresa dona do WhatsApp) endureceu as políticas de segurança. Para empresas que buscam escala, o maior pesadelo é o bloqueio do número. Neste artigo, vamos detalhar como a <strong>Plug & Sales</strong> garante que sua operação permaneça inabalável.</p>
            
            <h2>1. A Infraestrutura WABA vs. Soluções Não-Oficiais</h2>
            <p>O primeiro erro de muitos empreendedores é utilizar soluções baseadas em automações de interface ou QR Code (Web-based). Essas ferramentas violam os termos de serviço da Meta e são detectadas facilmente por algoritmos de IA. A única forma de garantir segurança empresarial é através da <strong>WhatsApp Business API (WABA)</strong>.</p>
            <p>Ao utilizar a API Oficial via Plug & Sales, seu número não está "simulando" um usuário; ele está conectado diretamente aos servidores da Meta, o que remove 99% das causas comuns de banimento por comportamento robótico.</p>
            
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200" alt="Tecnologia de Segurança WhatsApp" style="width: 100%; border-radius: 24px; margin: 40px 0;" />
            
            <h2>2. A Ciência do Aquecimento de Números (Warming Process)</h2>
            <p>Mesmo na API Oficial, existe um conceito chamado <strong>Tier de Reputação</strong>. Novos números começam no Tier 1 (limite de 1.000 conversas por 24h). Tentar disparar 50.000 mensagens no primeiro dia é um sinal de alerta vermelho para o sistema de spam.</p>
            <p>Nossa recomendação estratégica envolve o aumento gradual:
                <ul>
                    <li><strong>Semana 1:</strong> Foco em leads quentes e clientes ativos.</li>
                    <li><strong>Semana 2:</strong> Expansão para base de interesse recente.</li>
                    <li><strong>Semana 3:</strong> Monitoramento de feedback e qualidade das conversas.</li>
                </ul>
            </p>

            <h2>3. Qualidade do Conteúdo e Feedback do Usuário</h2>
            <p>O bloqueio não acontece apenas por robôs, mas por denúncias. Se sua mensagem é invasiva ou irrelevante, o usuário clica em "Denunciar Spam". A Plug & Sales ajuda você a estruturar mensagens com botões de <strong>Opt-out</strong> (Sair da lista), o que reduz drasticamente as denúncias negativas.</p>
            
            <div class="info-box">
                Lembre-se: O Google e a Meta priorizam a experiência do usuário. Conteúdo de valor gera engajamento, não denúncias.
            </div>
        `
    },
    'estrategias-disparo-em-massa-alta-conversao': {
        title: 'Estratégias de Disparo em Massa: Como Gerar ROI de 300% com WhatsApp',
        description: 'Descubra como estruturar campanhas de disparos em massa que não apenas entregam mensagens, mas convertem leads em vendas reais com alta taxa de abertura.',
        category: 'Marketing de Performance',
        author: 'Ricardo Willer',
        date: '03 Mai, 2026',
        readTime: '12 min',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
        content: `
            <p>Enviar mensagens para milhares de pessoas é uma commodity. O que separa os amadores dos profissionais de elite é a <strong>taxa de conversão</strong>. Na Plug & Sales, nossa arquitetura foi desenhada para maximizar cada centavo investido em tráfego e base de dados.</p>
            
            <h2>A Engenharia da Mensagem Perfeita</h2>
            <p>Para obter alta conversão, sua mensagem precisa seguir a estrutura <strong>AIDA</strong> (Atenção, Interesse, Desejo e Ação), mas adaptada para o formato dinâmico do WhatsApp. Mensagens longas e cansativas são o caminho mais rápido para o arquivamento.</p>
            
            <h3>O Poder das Variáveis Dinâmicas</h3>
            <p>A personalização vai muito além de apenas citar o nome do cliente. Com nossa ferramenta, você pode inserir variáveis baseadas no comportamento de compra anterior ou na origem do lead. "Olá João, vi que você se interessou pelo produto X" é infinitamente mais poderoso que um "Confira nossas ofertas".</p>
            
            <h2>Timing e Segmentação: A Chave do Lucro</h2>
            <p>Disparar para toda a base ao mesmo tempo é um desperdício de potencial. Segmentar sua base por <strong>Nível de Consciência</strong> permite que você envie a oferta certa para quem está pronto para comprar e conteúdo educativo para quem ainda está no topo do funil.</p>
            
            <div class="info-box">
                Dica de Ouro: Use botões de resposta rápida. Eles facilitam a interação do usuário e aumentam a taxa de resposta em até 45% em comparação a links tradicionais.
            </div>
        `
    }
};

const recommendations = [
    {
        title: 'Estratégias de disparo em massa para 2026',
        slug: 'estrategias-disparo-em-massa-alta-conversao',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400'
    },
    {
        title: 'Benefícios de um Chatbot inteligente',
        slug: 'beneficios-chatbot-inteligente-whatsapp',
        image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&q=80&w=400'
    },
    {
        title: 'Como integrar CRM com WhatsApp',
        slug: 'integracao-crm-whatsapp',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400'
    }
];

const BlogPostPage = () => {
    const { slug } = useParams();
    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userReaction, setUserReaction] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [modalMode, setModalMode] = useState<'login' | 'register'>('login');
    const [postReactions, setPostReactions] = useState({
        fire: 12,
        rocket: 8,
        heart: 15,
        clap: 5
    });
    const [scrollProgress, setScrollProgress] = useState(0);
    const [commentsList, setCommentsList] = useState<any[]>([]);

    useEffect(() => {
        const updateScroll = () => {
            const height = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress((window.scrollY / height) * 100);
        };
        window.addEventListener('scroll', updateScroll);
        return () => window.removeEventListener('scroll', updateScroll);
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('pns_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            setIsLoggedIn(true);
        }
    }, []);

    useEffect(() => {
        const loadPost = async () => {
            setIsLoading(true);
            const staticPost = initialPosts[slug as keyof typeof initialPosts];
            if (staticPost) {
                setPost(staticPost);
            } else {
                const dynamicPosts = await dbService.getBlogPosts();
                const found = dynamicPosts.find((p: any) => p.slug === slug);
                if (found) {
                    setPost(found);
                }
            }

            const dbComments = await dbService.getBlogComments(slug as string);
            if (dbComments && dbComments.length > 0) {
                setCommentsList(dbComments);
            } else {
                setCommentsList([
                    { id: 1, user: 'André Santos', text: 'Excelente artigo! O warming do número realmente é onde a maioria das pessoas erra.', date: 'Há 2 horas', likes: 24, userLiked: false },
                    { id: 2, user: 'Mariana Lima', text: 'Vocês recomendam algum limite específico por dia durante a primeira semana?', date: 'Há 5 horas', likes: 4, userLiked: false }
                ]);
            }
            setIsLoading(false);
        };

        loadPost();
    }, [slug]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }
        if (!comment.trim()) return;

        const newCommentObj = {
            postSlug: slug as string,
            userId: currentUser?.id || 999,
            userName: currentUser?.name || 'Membro do Fórum',
            text: comment
        };

        const result = await dbService.addBlogComment(newCommentObj);

        const newComment = {
            id: result.id || Date.now(),
            user: currentUser?.name || 'Membro do Fórum',
            text: comment,
            date: 'Agora mesmo',
            likes: 0,
            userLiked: false
        };
        setCommentsList(prev => [newComment, ...prev]);
        setComment('');
    };

    const handleLikeComment = (id: number) => {
        setCommentsList(prev => prev.map(c => {
            if (c.id === id) {
                return { ...c, likes: c.userLiked ? c.likes - 1 : c.likes + 1, userLiked: !c.userLiked };
            }
            return c;
        }));
    };

    const handleReaction = (type: keyof typeof postReactions) => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }
        setPostReactions(prev => {
            const newReactions = { ...prev };
            newReactions[type] = (newReactions[type] || 0) + 1;
            return newReactions;
        });
        setUserReaction(type);
    };

    const handleSimulatedLogin = async () => {
        setIsLoading(true);
        try {
            const forumUser = { 
                name: modalMode === 'login' ? 'Visitante VIP' : 'Novo Membro', 
                role: 'usuario_forum', 
                email: 'user@forum.com',
                password: 'password123',
                avatar: modalMode === 'login' ? 'V' : 'N'
            };

            let finalUser;
            if (modalMode === 'register') {
                finalUser = await dbService.register(forumUser);
            } else {
                finalUser = await dbService.login({ email: forumUser.email, password: forumUser.password });
            }

            const userToStore = finalUser && !finalUser.error ? finalUser : forumUser;
            localStorage.setItem('pns_user', JSON.stringify(userToStore));
            setCurrentUser(userToStore);
            setIsLoggedIn(true);
            setShowLoginModal(false);
            window.location.reload(); 
        } catch (err) {
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container" style={{ padding: '200px 24px', textAlign: 'center' }}>
                <div className="animate-pulse">
                    <Zap size={48} color="var(--primary-color)" style={{ margin: '0 auto 20px' }} />
                    <h2 style={{ color: 'var(--primary-color)' }}>CARREGANDO ARTIGO...</h2>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container" style={{ padding: '200px 24px', textAlign: 'center' }}>
                <h1>Artigo não encontrado</h1>
                <Link to="/blog" className="btn btn-primary mt-4">Voltar para o Blog</Link>
            </div>
        );
    }

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com.br" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://plugesales.com.br/blog" },
            { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://plugesales.com.br/blog/${slug}` }
        ]
    };

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.description,
        "image": post.image,
        "author": { "@type": "Person", "name": post.author, "url": "https://plugesales.com.br/sobre" },
        "publisher": { "@type": "Organization", "name": "Plug & Sales", "logo": { "@type": "ImageObject", "url": "https://plugesales.com.br/logo-supreme.png" } },
        "datePublished": "2026-05-05T08:00:00+08:00",
        "dateModified": new Date().toISOString()
    };

    return (
        <>
            <div className="reading-progress-bar" style={{ width: `${scrollProgress}%` }}></div>

            <div className="blog-post-page animate-fade-in">
                <SEO 
                    title={post.title} 
                    description={post.description}
                    ogImage={post.image}
                    ogType="article"
                    schema={[breadcrumbSchema, articleSchema]}
                />

                <header className="post-hero-supreme" style={{ backgroundImage: `url(${post.image})` }}>
                    <div className="hero-overlay-supreme"></div>
                    <div className="container hero-content-wrapper">
                        <nav className="breadcrumbs-supreme">
                            <Link to="/"><Home size={14} /> Início</Link>
                            <ChevronRight size={14} />
                            <Link to="/blog">Blog</Link>
                            <ChevronRight size={14} />
                            <span className="current-crumb">{post.category}</span>
                        </nav>
                        
                        <div className="hero-text-content">
                            <span className="post-category-badge-supreme">{post.category}</span>
                            <h1 className="post-title-supreme">{post.title}</h1>
                            <div className="post-meta-supreme">
                                <div className="author-info-supreme">
                                    <div className="author-avatar-mini">{post.author.charAt(0)}</div>
                                    <div className="author-details">
                                        <span className="author-label">Escrito por</span>
                                        <span className="author-name">{post.author}</span>
                                    </div>
                                </div>
                                <div className="meta-divider"></div>
                                <div className="meta-stats-supreme">
                                    <span className="meta-stat"><Calendar size={16} /> {post.date}</span>
                                    <span className="meta-stat"><Clock size={16} /> {post.readTime} de leitura</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container">
                    <div className="post-main-layout">
                        <div className="post-content-area">
                            <div className="post-body-card glass-card-supreme">
                                <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                            </div>

                            <div className="post-tags">
                                <span>#WhatsAppAPI</span><span>#Segurança</span><span>#Escala</span><span>#Meta</span>
                            </div>

                            <div className="post-share-section">
                                <div className="reaction-bar glass-card-supreme">
                                    <h4>O que achou deste artigo?</h4>
                                    <div className="reaction-btns">
                                        <button onClick={() => handleReaction('fire')} className={`reaction-btn ${userReaction === 'fire' ? 'active' : ''}`}>🔥 <span>{postReactions.fire}</span></button>
                                        <button onClick={() => handleReaction('rocket')} className={`reaction-btn ${userReaction === 'rocket' ? 'active' : ''}`}>🚀 <span>{postReactions.rocket}</span></button>
                                        <button onClick={() => handleReaction('heart')} className={`reaction-btn ${userReaction === 'heart' ? 'active' : ''}`}>❤️ <span>{postReactions.heart}</span></button>
                                        <button onClick={() => handleReaction('clap')} className={`reaction-btn ${userReaction === 'clap' ? 'active' : ''}`}>👏 <span>{postReactions.clap}</span></button>
                                    </div>
                                </div>
                                <h4 style={{ marginTop: '40px' }}>Compartilhe:</h4>
                                <div className="share-btns">
                                    <button className="share-btn fb"><Facebook size={20} /> Facebook</button>
                                    <button className="share-btn tw"><Twitter size={20} /> Twitter</button>
                                    <button className="share-btn lk"><LinkIcon size={20} /> Copiar Link</button>
                                </div>
                            </div>

                            <div className="comments-section">
                                <h3>Discussão ({commentsList.length})</h3>
                                {!isLoggedIn ? (
                                    <div className="login-prompt glass-card-supreme">
                                        <User size={40} color="var(--primary-color)" />
                                        <div>
                                            <h4>Faça parte da nossa comunidade</h4>
                                            <p>Entre para comentar, curtir e interagir com outros especialistas.</p>
                                            <button className="action-btn primary-btn" onClick={() => setShowLoginModal(true)}>FAZER LOGIN RÁPIDO</button>
                                        </div>
                                    </div>
                                ) : (
                                    <form className="comment-form" onSubmit={handleCommentSubmit}>
                                        <div className="comment-input-wrapper">
                                            <textarea 
                                                placeholder={`E aí ${currentUser?.name.split(' ')[0]}, o que achou?`} 
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            ></textarea>
                                            <div className="comment-actions">
                                                <button type="submit" className="send-comment-btn">Enviar Comentário <Send size={16} /></button>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                <div className="comments-list">
                                    {commentsList.map(c => (
                                        <div key={c.id} className={`comment-item ${c.id === 1 ? 'highlighted' : ''}`}>
                                            <div className="comment-avatar">{c.user[0]}</div>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <strong>{c.user}</strong><span>{c.date}</span>
                                                </div>
                                                <p>{c.text}</p>
                                                <div className="comment-footer">
                                                    <button className={`comment-action-btn ${c.userLiked ? 'liked' : ''}`} onClick={() => handleLikeComment(c.id)}><ThumbsUp size={14} /> {c.likes}</button>
                                                    <button className="comment-action-btn">Responder</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <aside className="post-sidebar">
                            <div className="sidebar-widget glass-card-supreme search-widget">
                                <div className="search-input-group"><Search size={18} /><input type="text" placeholder="Pesquisar..." /></div>
                            </div>
                            <div className="sidebar-widget glass-card-supreme trending-widget">
                                <h3><TrendingUp size={20} color="var(--primary-color)" /> Em Alta</h3>
                                <div className="trending-list">
                                    {recommendations.map((rec, i) => (
                                        <Link to={`/blog/${rec.slug}`} key={i} className="trending-item">
                                            <span className="trending-rank">0{i + 1}</span>
                                            <div className="trending-info">
                                                <h4>{rec.title}</h4>
                                                <span className="trending-meta"><Clock size={12} /> 5 min</span>
                                            </div>
                                            <ArrowUpRight size={16} className="trend-icon" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="sidebar-widget newsletter-widget-premium">
                                <div className="newsletter-content">
                                    <Zap size={32} color="#000" />
                                    <h4>Segredos da Escala</h4>
                                    <div className="newsletter-form-sidebar">
                                        <input type="email" placeholder="Seu e-mail" /><button><Mail size={18} /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="sidebar-widget glass-card-supreme categories-widget">
                                <h3>Tópicos</h3>
                                <div className="category-pills">
                                    {['WABA', 'CRM', 'Vendas', 'SEO'].map(cat => <button key={cat} className="cat-pill">{cat}</button>)}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                <style>{`
                    * { box-sizing: border-box; }
                    .reading-progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: var(--primary-gradient); z-index: 100000; transition: width 0.1s ease; box-shadow: 0 0 10px var(--primary-color); }
                    .blog-post-page { background: #05070a; color: #fff; padding-bottom: 100px; overflow-x: hidden; width: 100%; position: relative; }
                    .container { width: 100%; max-width: 1300px; margin: 0 auto; padding: 0 24px; position: relative; }
                    .post-hero-supreme { height: 100vh; min-height: 850px; background-size: cover; background-position: center; position: relative; display: flex; align-items: center; margin-top: -100px; z-index: 1; overflow: hidden; }
                    .hero-overlay-supreme { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(5,7,10,0.1) 0%, #05070a 100%), linear-gradient(to bottom, rgba(5,7,10,0.7) 0%, transparent 30%, #05070a 100%); z-index: 1; }
                    .hero-content-wrapper { position: relative; z-index: 10; width: 100%; animation: supremeHeroFadeUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; flex-direction: column; gap: 40px; padding-top: clamp(100px, 15vh, 160px); }
                    .breadcrumbs-supreme { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.4); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
                    .breadcrumbs-supreme a { color: var(--primary-color); text-decoration: none; display: flex; align-items: center; gap: 6px; transition: 0.3s; opacity: 0.7; }
                    .breadcrumbs-supreme a:hover { opacity: 1; color: #fff; }
                    .post-title-supreme { font-size: clamp(2.5rem, 8vw, 6rem); font-weight: 950; margin-bottom: 20px; background: linear-gradient(to right, #fff 20%, rgba(172, 248, 0, 0.9) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; position: relative; z-index: 12; line-height: 1.05; letter-spacing: -3px; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.7)); }
                    
                    @keyframes supremeHeroFadeUp {
                        from { opacity: 0; transform: translateY(40px) scale(0.98); filter: blur(10px); }
                        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
                    }
                    .post-main-layout { display: grid; grid-template-columns: 1fr 380px; gap: 40px; margin-top: -120px; position: relative; z-index: 10; width: 100%; }
                    .post-body-card { background: rgba(10, 12, 18, 0.8); backdrop-filter: blur(20px); border-radius: 40px; padding: 60px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 40px 80px rgba(0,0,0,0.5); width: 100%; overflow-wrap: break-word; }
                    .post-body { font-size: 1.2rem; line-height: 2; color: rgba(255,255,255,0.8); }
                    .post-body img { max-width: 100%; height: auto; border-radius: 20px; }
                    .post-body p { margin-bottom: 24px; }
                    .post-body h2 { color: #fff; margin: 48px 0 24px; font-weight: 800; font-size: 2rem; }
                    @media (max-width: 1024px) {
                        .post-main-layout { grid-template-columns: 1fr; margin-top: -100px; padding: 0 20px; }
                        .post-hero-supreme { height: 80vh; min-height: 700px; }
                        .post-title-supreme { letter-spacing: -2px; }
                        .post-body-card { padding: 40px; }
                        .post-sidebar { margin-top: 40px; width: 100%; }
                    }

                    @media (max-width: 768px) {
                        .post-hero-supreme { height: 85vh; margin-top: -80px; min-height: 600px; }
                        .hero-content-wrapper { padding-top: 120px; gap: 24px; }
                        .post-title-supreme { font-size: 2.8rem; letter-spacing: -1.5px; }
                        .post-meta-supreme { gap: 15px; }
                        .author-info-supreme { padding: 10px 20px; width: 100%; box-sizing: border-box; }
                        .meta-divider { display: none; }
                        .meta-stats-supreme { width: 100%; justify-content: space-between; padding: 0 10px; }
                        .post-body-card { padding: 30px 20px; border-radius: 30px; margin-top: 0; width: 100%; }
                        .post-body { font-size: 1.05rem; line-height: 1.8; }
                        .post-body h2 { font-size: 1.6rem; margin: 32px 0 16px; }
                        .reaction-bar { flex-direction: column; gap: 20px; text-align: center; width: 100%; }
                        .comments-section h3 { font-size: 1.4rem; flex-direction: column; align-items: flex-start; }
                        .comment-item { padding: 24px; flex-direction: column; gap: 15px; }
                        .comment-avatar { width: 45px; height: 45px; font-size: 1rem; }
                    }

                    @media (max-width: 480px) {
                        .post-hero-supreme { height: 90vh; }
                        .post-title-supreme { font-size: 2.2rem; line-height: 1.1; }
                        .meta-stats-supreme { flex-direction: column; align-items: flex-start; gap: 10px; }
                        .breadcrumbs-supreme { flex-wrap: wrap; }
                        .comment-header { flex-direction: column; align-items: flex-start; gap: 5px; }
                    }

                    @media (max-width: 480px) {
                        .post-hero-supreme { height: 45vh; }
                        .post-title-supreme { font-size: 1.6rem; }
                        .post-body-card { padding: 30px 20px; }
                        .comment-item { padding: 20px; flex-direction: column; gap: 15px; }
                        .comment-avatar { width: 40px; height: 40px; font-size: 1rem; }
                        .reaction-btns { flex-wrap: wrap; justify-content: center; }
                    }

                    .post-body h2 { color: #fff; margin: 48px 0 24px; font-weight: 800; }
                    .reaction-bar { padding: 32px; border-radius: 24px; margin-top: 40px; border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); }
                    .reaction-btns { display: flex; gap: 15px; }
                    .reaction-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px 24px; border-radius: 12px; color: #fff; cursor: pointer; transition: 0.3s; font-weight: 700; }
                    .reaction-btn:hover { background: rgba(172, 248, 0, 0.1); border-color: var(--primary-color); }
                    .share-btns { display: flex; gap: 15px; margin-top: 24px; }
                    .share-btn { flex: 1; padding: 16px; border-radius: 14px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 800; transition: 0.3s; }
                    .share-btn.fb { background: #1877f2; color: #fff; }
                    .share-btn.tw { background: #1da1f2; color: #fff; }
                    .share-btn.lk { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
                    .comment-form { margin-top: 40px; margin-bottom: 48px; }
                    .comment-input-wrapper { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 25px; transition: 0.3s; }
                    .comment-input-wrapper:focus-within { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.05); box-shadow: 0 0 30px rgba(172, 248, 0, 0.1); }
                    .comment-input-wrapper textarea { width: 100%; background: none; border: none; color: #fff; font-size: 1.1rem; min-height: 120px; resize: none; outline: none; }
                    .comment-actions { display: flex; justify-content: flex-end; margin-top: 15px; }
                    .send-comment-btn { background: var(--primary-gradient); color: #000; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
                    .send-comment-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(172, 248, 0, 0.3); }

                    .post-meta-supreme { display: flex; align-items: center; gap: 32px; flex-wrap: wrap; margin-top: 20px; }
                    .author-info-supreme { display: flex; align-items: center; gap: 18px; background: rgba(255,255,255,0.05); padding: 14px 28px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); transition: 0.3s; cursor: default; }
                    .author-info-supreme:hover { background: rgba(255,255,255,0.08); border-color: var(--primary-color); transform: translateY(-3px); }
                    .author-avatar-mini { width: 42px; height: 42px; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 900; font-size: 1.1rem; box-shadow: 0 0 15px rgba(172, 248, 0, 0.4); }
                    .author-details { display: flex; flex-direction: column; }
                    .author-label { font-size: 0.65rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 900; margin-bottom: 2px; }
                    .author-name { font-size: 1rem; font-weight: 800; color: #fff; letter-spacing: 0.5px; }
                    .meta-divider { width: 1px; height: 40px; background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent); }
                    .meta-stats-supreme { display: flex; align-items: center; gap: 30px; }
                    .meta-stat { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; color: rgba(255,255,255,0.7); font-weight: 700; transition: 0.3s; }
                    .meta-stat:hover { color: #fff; }
                    .meta-stat svg { color: var(--primary-color); filter: drop-shadow(0 0 5px var(--primary-color)); }

                    .comments-section { margin-top: 80px; }
                    .comments-section h3 { font-size: 1.8rem; font-weight: 900; margin-bottom: 40px; color: #fff; display: flex; align-items: center; gap: 15px; }
                    .comments-section h3::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, rgba(255,255,255,0.1), transparent); }
                    
                    .comment-item { display: flex; gap: 24px; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 32px; border-radius: 32px; border: 1px solid rgba(255,255,255,0.05); transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); position: relative; overflow: hidden; }
                    .comment-item:hover { background: rgba(255,255,255,0.04); border-color: rgba(172, 248, 0, 0.3); transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
                    .comment-item.highlighted { border-left: 4px solid var(--primary-color); background: rgba(172, 248, 0, 0.03); }
                    
                    .comment-avatar { width: 56px; height: 56px; background: var(--primary-gradient); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 900; font-size: 1.2rem; flex-shrink: 0; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
                    .comment-content { flex: 1; }
                    .comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                    .comment-header strong { font-size: 1.1rem; color: #fff; font-weight: 800; }
                    .comment-header span { font-size: 0.8rem; color: rgba(255,255,255,0.4); font-weight: 600; }
                    .comment-content p { color: rgba(255,255,255,0.7); line-height: 1.7; font-size: 1.05rem; }
                    
                    .comment-footer { display: flex; gap: 24px; margin-top: 20px; }
                    .comment-action-btn { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 700; transition: 0.3s; font-size: 0.9rem; }
                    .comment-action-btn:hover { color: var(--primary-color); }
                    .comment-action-btn.liked { color: var(--primary-color); }
                    .comment-action-btn svg { transition: 0.3s; }
                    .comment-action-btn:hover svg { transform: scale(1.2); }

                    .post-sidebar { display: flex; flex-direction: column; gap: 32px; }
                    .sidebar-widget { padding: 32px; border-radius: 28px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }
                    .sidebar-widget h3 { font-size: 1.2rem; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; font-weight: 800; }
                    .search-input-group { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.3); background: rgba(0,0,0,0.2); padding: 15px 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
                    .search-input-group:focus-within { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.05); }
                    .search-input-group input { background: none; border: none; color: #fff; width: 100%; outline: none; font-size: 0.95rem; }

                    .trending-item { display: flex; gap: 18px; text-decoration: none; color: #fff; margin-bottom: 20px; transition: 0.3s; }
                    .trending-item:hover { transform: translateX(5px); }
                    .newsletter-widget-premium { background: var(--primary-gradient); color: #000; padding: 40px; border-radius: 32px; box-shadow: 0 20px 40px rgba(172, 248, 0, 0.2); }
                    .newsletter-form-sidebar { display: flex; gap: 10px; margin-top: 20px; background: rgba(0,0,0,0.1); padding: 5px; border-radius: 14px; }
                    .newsletter-form-sidebar input { flex: 1; background: none; border: none; padding: 12px; font-weight: 600; outline: none; color: #000; }
                    .newsletter-form-sidebar button { background: #000; color: var(--primary-color); border: none; width: 45px; height: 45px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                    .cat-pill { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 12px; color: #fff; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: 0.3s; }
                    .cat-pill:hover { background: var(--primary-color); color: #000; }

                    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; z-index: 100000; }
                    .modal-content { background: #080a0f; padding: 60px; border-radius: 40px; width: 100%; max-width: 480px; text-align: center; border: 1px solid rgba(255,255,255,0.1); position: relative; box-shadow: 0 40px 80px rgba(0,0,0,0.5); }
                    .modal-input-group { display: flex; flexDirection: column; gap: 15px; text-align: left; margin-top: 30px; }
                    .modal-input { padding: 18px 24px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #fff; font-size: 1rem; outline: none; transition: 0.3s; }
                    .modal-input:focus { border-color: var(--primary-color); background: rgba(172, 248, 0, 0.05); box-shadow: 0 0 30px rgba(172, 248, 0, 0.15); }
                    .modal-primary-btn { background: var(--primary-gradient); border: none; padding: 20px; border-radius: 16px; fontWeight: 900; cursor: pointer; marginTop: 10px; color: #000; transition: 0.3s; }
                    .modal-primary-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(172, 248, 0, 0.3); }
                    .close-modal-x { position: absolute; top: 30px; right: 30px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
                    .close-modal-x:hover { background: #ff4d4d; color: #fff; border-color: #ff4d4d; }
                `}</style>
            </div>

            {showLoginModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card-supreme">
                        <button className="close-modal-x" onClick={() => setShowLoginModal(false)}><X size={24} /></button>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '10px' }}>{modalMode === 'login' ? 'Entrar' : 'Cadastrar'}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '30px' }}>{modalMode === 'login' ? 'Acesse sua conta para interagir.' : 'Crie sua conta em segundos.'}</p>
                        
                        <div className="modal-input-group">
                            <input type="email" placeholder="E-mail corporativo" className="modal-input" />
                            <input type="password" placeholder="Senha segura" className="modal-input" />
                            <button className="modal-primary-btn" onClick={handleSimulatedLogin}>{modalMode === 'login' ? 'ENTRAR AGORA' : 'FINALIZAR'}</button>
                        </div>

                        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button onClick={() => setModalMode(modalMode === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 800, cursor: 'pointer' }}>
                                {modalMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BlogPostPage;
