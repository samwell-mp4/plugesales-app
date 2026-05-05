import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Calendar, User, ArrowRight, Search, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { dbService } from '../services/dbService';

const initialPosts = [
    {
        id: 1,
        slug: 'como-evitar-bloqueios-whatsapp-api',
        title: 'Como evitar bloqueios usando a API Oficial do WhatsApp',
        excerpt: 'Descubra as melhores práticas para manter seus números seguros e sua operação escalável dentro das normas da Meta.',
        category: 'Segurança',
        author: 'Time Plug & Sales',
        date: '05 Mai, 2026',
        readTime: '8 min',
        image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 2,
        slug: 'estrategias-disparo-em-massa-alta-conversao',
        title: 'Estratégias de disparo em massa para alta conversão',
        excerpt: 'Aprenda como estruturar suas mensagens e ofertas para garantir o máximo de engajamento na sua base de leads.',
        category: 'Marketing',
        author: 'Ricardo Willer',
        date: '03 Mai, 2026',
        readTime: '10 min',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 3,
        slug: 'beneficios-chatbot-inteligente-whatsapp',
        title: 'Benefícios de um Chatbot inteligente no seu WhatsApp',
        excerpt: 'Reduza custos operacionais e aumente a satisfação do cliente com automações que realmente funcionam.',
        category: 'Tecnologia',
        author: 'Time Plug & Sales',
        date: '01 Mai, 2026',
        readTime: '6 min',
        image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 4,
        slug: 'integracao-crm-whatsapp',
        title: 'Como integrar CRM com WhatsApp',
        excerpt: 'O guia definitivo para centralizar suas comunicações e nunca mais perder um lead.',
        category: 'Vendas',
        author: 'Especialista CRM',
        date: '28 Abr, 2026',
        readTime: '12 min',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'
    }
];

const BlogPage = () => {
    const [dynamicPosts, setDynamicPosts] = useState<any[]>([]);

    useEffect(() => {
        dbService.getBlogPosts().then(posts => {
            // Merge dynamic posts with initial ones, putting dynamic first (newest)
            setDynamicPosts(posts);
        });
    }, []);

    const allPosts = [...dynamicPosts, ...initialPosts];

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://plugesales.com.br" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://plugesales.com.br/blog" }
        ]
    };

    return (
        <div className="blog-page animate-fade-in">
            <SEO 
                title="Blog Corporativo" 
                description="Acompanhe as últimas tendências em automação, API do WhatsApp e estratégias de vendas digitais."
                schema={breadcrumbSchema}
            />

            {/* Background Blobs for Visual Depth */}
            <div className="sp-blob sp-blob-1"></div>
            <div className="sp-blob sp-blob-2"></div>

            <div className="breadcrumb-wrapper container">
                <nav className="breadcrumbs">
                    <Link to="/">Início</Link>
                    <ChevronRight size={14} />
                    <span>Blog</span>
                </nav>
            </div>

            <section className="blog-hero">
                <div className="container">
                    <span className="section-tag">CONTEÚDO EXCLUSIVO</span>
                    <h1 className="hero-title">Hub de Inteligência <span className="text-gradient">Plug & Sales</span></h1>
                    <p className="hero-subtitle">
                        Estratégias avançadas para quem não quer apenas disparar mensagens, mas construir uma máquina de vendas.
                    </p>
                    
                    <div className="blog-search-bar">
                        <Search size={20} color="var(--text-muted)" />
                        <input type="text" placeholder="Pesquisar por tema, funcionalidade ou estratégia..." />
                    </div>
                </div>
            </section>

            <section className="featured-posts section-padding">
                <div className="container">
                    <div className="section-header-compact">
                        <h2><TrendingUp size={24} color="var(--primary-color)" /> Em Destaque</h2>
                    </div>
                    
                    <div className="blog-main-grid">
                        {allPosts.map((post) => (
                            <Link to={`/blog/${post.slug}`} key={post.id} className="blog-premium-card">
                                <div className="card-image">
                                    <img src={post.image} alt={post.title} />
                                    <div className="card-overlay"></div>
                                    <span className="card-badge">{post.category}</span>
                                </div>
                                <div className="card-body">
                                    <div className="card-meta">
                                        <span><Calendar size={14} /> {post.date}</span>
                                        <span><Clock size={14} /> {post.readTime}</span>
                                    </div>
                                    <h3>{post.title}</h3>
                                    <p>{post.description || post.excerpt}</p>
                                    <div className="card-footer">
                                        <div className="author">
                                            <div className="avatar">{(post.author || 'T')[0]}</div>
                                            <span>{post.author}</span>
                                        </div>
                                        <ArrowRight size={20} className="arrow-icon" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <style>{`
                .blog-page { padding-bottom: 100px; position: relative; overflow: hidden; background: #05070a; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 2; }
                
                /* Spectactular Background Blobs */
                .sp-blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.12; z-index: 1; pointer-events: none; }
                .sp-blob-1 { width: 500px; height: 500px; background: var(--primary-color); top: -100px; left: -100px; }
                .sp-blob-2 { width: 400px; height: 400px; background: #3b82f6; bottom: 10%; right: -50px; }

                .breadcrumb-wrapper { padding-top: 120px; margin-bottom: -100px; position: relative; z-index: 10; }
                .breadcrumbs { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.4); font-size: 0.85rem; font-weight: 500; justify-content: center; }
                .breadcrumbs a { color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.3s; }
                .breadcrumbs a:hover { color: var(--primary-color); }
                .breadcrumbs span { color: var(--primary-color); font-weight: 700; }

                .blog-hero { padding: 120px 0 80px; text-align: center; position: relative; }
                .hero-title { font-size: clamp(2.5rem, 6vw, 4.8rem); margin-bottom: 24px; font-weight: 900; letter-spacing: -3px; }
                .hero-subtitle { font-size: 1.3rem; color: var(--text-secondary); max-width: 800px; margin: 0 auto 48px; line-height: 1.6; }
                
                .text-gradient {
                    background: var(--primary-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .blog-search-bar { max-width: 650px; margin: 0 auto; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); padding: 8px 28px; border-radius: 24px; display: flex; align-items: center; gap: 16px; backdrop-filter: blur(20px); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
                .blog-search-bar input { flex: 1; background: none; border: none; padding: 18px 0; color: #fff; font-size: 1.1rem; outline: none; }

                .section-header-compact { display: flex; align-items: center; gap: 16px; margin-bottom: 50px; border-left: 4px solid var(--primary-color); padding-left: 20px; }
                .section-header-compact h2 { font-size: 2.2rem; margin: 0; font-weight: 800; letter-spacing: -1px; }

                .blog-main-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 40px; }
                
                .blog-premium-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 40px; overflow: hidden; text-decoration: none; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; }
                .blog-premium-card:hover { transform: translateY(-15px); border-color: rgba(172, 248, 0, 0.4); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6); background: rgba(255,255,255,0.05); }
                
                .card-image { position: relative; height: 280px; overflow: hidden; }
                .card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s ease; }
                .blog-premium-card:hover .card-image img { transform: scale(1.15); }
                .card-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, transparent 40%, rgba(5, 7, 10, 0.9)); }
                .card-badge { position: absolute; top: 24px; right: 24px; background: var(--primary-color); color: #000; padding: 8px 20px; border-radius: 14px; font-weight: 900; font-size: 0.75rem; text-transform: uppercase; z-index: 10; box-shadow: 0 0 15px rgba(172, 248, 0, 0.3); }

                .card-body { padding: 40px; flex: 1; display: flex; flex-direction: column; }
                .card-meta { display: flex; gap: 24px; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px; font-weight: 500; }
                .card-meta span { display: flex; align-items: center; gap: 8px; }
                
                .card-body h3 { font-size: 1.8rem; margin-bottom: 20px; color: #fff; line-height: 1.25; font-weight: 800; transition: color 0.3s; letter-spacing: -0.5px; }
                .blog-premium-card:hover h3 { color: var(--primary-color); }
                .card-body p { color: var(--text-secondary); line-height: 1.7; margin-bottom: 32px; font-size: 1rem; opacity: 0.8; }
                
                .card-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.05); }
                .author { display: flex; align-items: center; gap: 14px; }
                .avatar { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; color: var(--primary-color); }
                .author span { font-size: 1rem; color: var(--text-primary); font-weight: 700; }
                
                .arrow-icon { color: var(--text-muted); transition: all 0.3s; }
                .blog-premium-card:hover .arrow-icon { color: var(--primary-color); transform: translateX(8px); }

                @media (max-width: 1024px) {
                    .blog-main-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; }
                    .hero-title { font-size: 3.5rem; }
                }

                @media (max-width: 768px) {
                    .blog-main-grid { grid-template-columns: 1fr; }
                    .sp-blob { display: none; }
                    .breadcrumb-wrapper { padding-top: 100px; margin-bottom: -60px; }
                    .blog-hero { padding: 80px 0 60px; }
                    .hero-title { font-size: 2.5rem; letter-spacing: -1.5px; }
                    .hero-subtitle { font-size: 1.1rem; margin-bottom: 32px; }
                    .blog-search-bar { padding: 5px 20px; }
                    .blog-search-bar input { font-size: 1rem; }
                    .section-header-compact h2 { font-size: 1.8rem; }
                    .card-body { padding: 30px; }
                    .card-body h3 { font-size: 1.5rem; }
                }

                @media (max-width: 480px) {
                    .hero-title { font-size: 2.2rem; }
                    .card-image { height: 220px; }
                    .card-body { padding: 25px 20px; }
                    .card-body h3 { font-size: 1.4rem; }
                }
            `}</style>
        </div>
    );
};

export default BlogPage;
