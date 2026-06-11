import { renderHtml } from './template.js';

const SITE_URL = 'https://plugesales.com';

export const homeRenderer = () => {
    return renderHtml({
        title: 'Plug & Sales — Disparo em Massa no WhatsApp | API Oficial Meta',
        description: 'Infraestrutura de disparo em massa no WhatsApp via API Oficial da Meta. Envie milhares de mensagens por dia sem bloqueio. Ative sua estrutura em 24h.',
        canonical: SITE_URL + '/',
        ogImage: SITE_URL + '/og-image.png',
        keywords: 'disparo em massa whatsapp, api oficial whatsapp, whatsapp business api, disparo whatsapp, waba',
        schema: [
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Plug & Sales",
                "url": SITE_URL,
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": SITE_URL + "/?s={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Plug & Sales",
                "url": SITE_URL,
                "logo": SITE_URL + "/logo-supreme.png",
                "description": "Solução de disparo em massa no WhatsApp via API Oficial da Meta.",
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "sales",
                    "telephone": "+55-31-98399-4058",
                    "areaServed": "BR"
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Plug & Sales",
                "operatingSystem": "Web",
                "applicationCategory": "BusinessApplication",
                "description": "Plataforma de disparo em massa no WhatsApp via API Oficial da Meta",
                "url": SITE_URL
            },
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    { "@type": "Question", "name": "Meu número pode ser bloqueado?", "acceptedAnswer": { "@type": "Answer", "text": "Não. Os disparos são feitos através da nossa estrutura com números próprios, sob nossa responsabilidade." } },
                    { "@type": "Question", "name": "Existe limite mínimo para o disparo em massa?", "acceptedAnswer": { "@type": "Answer", "text": "Sim, o mínimo é de 10 mil contatos por disparo." } },
                    { "@type": "Question", "name": "Como é realizada a cobrança?", "acceptedAnswer": { "@type": "Answer", "text": "A cobrança é feita apenas por mensagem entregue, com taxa que varia de acordo com o volume de leads." } },
                    { "@type": "Question", "name": "Em quanto tempo as mensagens são entregues?", "acceptedAnswer": { "@type": "Answer", "text": "As mensagens são disparadas em poucos minutos. Recomendamos aguardar até 1 hora para consolidação total." } }
                ]
            }
        ],
        content: `
            <div class="ssr-badge">PLUG & SALES</div>
            <h1 class="ssr-title">A estrutura invisível por trás das operações mais lucrativas do Brasil</h1>
            <p class="ssr-subtitle">Pare de perder tempo com configurações, BM, aquecimento de chips ou risco de banimento. Nós já temos a estrutura pronta para você escalar agora.</p>
            <a href="/lead-flow" class="ssr-cta">Quero Ativar Minha Estrutura Agora</a>

            <div class="ssr-section" style="margin-top: 80px;">
                <h2>O Que Fazemos</h2>
                <p>Somos especialistas em transformar bases de leads em lucro com disparos massivos via API Oficial do WhatsApp + estrutura de conversão automatizada. Com a Plug & Sales, você alcança milhares de contatos por dia com integração oficial, vendas em escala, relatórios e otimização em tempo real.</p>
            </div>

            <div class="ssr-section">
                <h2>Por que somente nós fazemos isso</h2>
                <ul>
                    <li>Infraestrutura homologada — Tudo 100% dentro das diretrizes da Meta</li>
                    <li>Volume real de disparos — Sem limites fantasiosos, entregamos escala de verdade</li>
                    <li>Conversão automatizada — Não focamos apenas na entrega, mas no resultado final</li>
                    <li>Velocidade de ativação — Sua estrutura rodando em tempo recorde</li>
                    <li>Exclusividade por região e segmento</li>
                    <li>Equipe interna de suporte e operação</li>
                </ul>
            </div>

            <div class="ssr-section">
                <h2>Recursos disponíveis</h2>
                <ul>
                    <li>Envio de texto, imagem, áudio e vídeo</li>
                    <li>Botões com link e variáveis personalizadas</li>
                    <li>Agendamento de envio (pagamento + materiais + aprovação 48h antes)</li>
                    <li>Relatórios diretos da plataforma</li>
                    <li>Selo de verificação opcional</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">ATIVAR MINHA ESTRUTURA AGORA</a>
            </div>
        `
    });
};

export const aboutRenderer = () => {
    return renderHtml({
        title: 'Sobre a Plug & Sales — Líder em API Oficial WhatsApp | Disparo em Massa, Chatbot e Automação',
        description: 'Conheça a Plug & Sales: líder em soluções de disparo em massa no WhatsApp via API Oficial da Meta (WABA). Chatbot com IA, Plug Cards, consultoria especializada e infraestrutura de alta performance para empresas que querem escalar vendas sem bloqueios.',
        canonical: SITE_URL + '/sobre',
        keywords: 'sobre plug sales, empresa disparo whatsapp, infraestrutura waba, chatbot whatsapp, api oficial whatsapp, plug cards, disparo em massa brasil, automação whatsapp',
        schema: [
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Plug & Sales",
                "alternateName": "Plugesales",
                "url": SITE_URL,
                "logo": SITE_URL + "/logo-supreme.png",
                "description": "Líder nacional em soluções de escala via API Oficial do WhatsApp (WABA), focada em alta performance de disparos, chatbots inteligentes e automação de vendas sem risco de bloqueio.",
                "foundingDate": "2023",
                "contactPoint": { "@type": "ContactPoint", "telephone": "+55-31-98399-4058", "contactType": "customer service", "areaServed": "BR" },
                "sameAs": ["https://www.instagram.com/plugesales", "https://www.linkedin.com/company/plugesales"],
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Serviços Plug & Sales",
                    "itemListElement": [
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Disparo em Massa WhatsApp" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "API Oficial WhatsApp (WABA)" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Chatbot Inteligente WhatsApp" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Plug Cards — Planos de Disparo" } }
                    ]
                }
            },
            {
                "@context": "https://schema.org", "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                    { "@type": "ListItem", "position": 2, "name": "Sobre Nós", "item": SITE_URL + "/sobre" }
                ]
            },
            {
                "@context": "https://schema.org", "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "A Plug & Sales usa a API Oficial da Meta?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Sim, operamos exclusivamente via API Oficial da Meta (WABA), garantindo 100% de segurança contra bloqueios e estabilidade na entrega." }
                    },
                    {
                        "@type": "Question",
                        "name": "Quais serviços a Plug & Sales oferece?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Oferecemos disparo em massa no WhatsApp via API Oficial, chatbots inteligentes com IA, consultoria WABA e os Plug Cards — planos pré-pagos de disparo." }
                    },
                    {
                        "@type": "Question",
                        "name": "O chatbot da Plug & Sales usa inteligência artificial?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Sim! Nosso chatbot inteligente utiliza IA generativa para entender e responder clientes de forma natural, integrado a CRM e sistemas terceiros." }
                    }
                ]
            }
        ],
        content: `
            <div class="ssr-badge">QUEM SOMOS</div>
            <h1 class="ssr-title">A Infraestrutura Definitiva para Escalar no WhatsApp</h1>
            <p class="ssr-subtitle">Somos especialistas em API Oficial da Meta (WABA), disparo em massa, chatbots inteligentes e automação de vendas. Nossa missão é substituir ferramentas não-oficiais e BSPs caros por uma solução completa, segura e com ROI comprovado.</p>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 48px 0;">
                <div style="text-align: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(172,248,0,0.1); padding: 32px 16px; border-radius: 14px;">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #acf800;">5+</div>
                    <div style="color: #999; font-size: 0.9rem;">Anos de Mercado</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(172,248,0,0.1); padding: 32px 16px; border-radius: 14px;">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #acf800;">2Bi+</div>
                    <div style="color: #999; font-size: 0.9rem;">Mensagens Entregues</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(172,248,0,0.1); padding: 32px 16px; border-radius: 14px;">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #acf800;">500+</div>
                    <div style="color: #999; font-size: 0.9rem;">Clientes Ativos</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(172,248,0,0.1); padding: 32px 16px; border-radius: 14px;">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #acf800;">99.8%</div>
                    <div style="color: #999; font-size: 0.9rem;">Taxa de Entrega</div>
                </div>
            </div>

            <div class="ssr-section">
                <h2>Nossa História</h2>
                <p>A Plug & Sales nasceu da observação de um problema recorrente: empresas que dependiam de ferramentas não-oficiais de disparo no WhatsApp estavam tendo seus números bloqueados diariamente. Enquanto os BSPs (Business Solution Providers) cobravam taxas abusivas com suporte genérico.</p>
                <p>Fundada em 2023, surgimos como alternativa direta aos BSPs tradicionais: a mesma tecnologia de ponta da API Oficial da Meta, com preços justos, suporte humanizado e plataforma construída para o mercado nacional. Hoje processamos bilhões de mensagens por ano com segurança e conformidade total.</p>
            </div>

            <div class="ssr-section">
                <h2>Nossos Serviços</h2>
                <ul>
                    <li><strong>Disparo em Massa WhatsApp</strong> — Campanhas para milhares de contatos via API Oficial, templates multimídia e relatórios detalhados</li>
                    <li><strong>API Oficial (WABA)</strong> — Ativação e gestão completa da sua WhatsApp Business API</li>
                    <li><strong>Chatbot com IA</strong> — Automação de vendas e suporte com inteligência artificial generativa</li>
                    <li><strong>Plug Cards</strong> — Planos pré-pagos de 10 mil a 500 mil disparos, sem assinatura</li>
                </ul>
            </div>

            <div class="ssr-section">
                <h2>Nossa Infraestrutura</h2>
                <ul>
                    <li>Ambiente multi-tenant isolado para cada cliente</li>
                    <li>Gerenciamento contínuo de tiers WABA para aumento de limites diários</li>
                    <li>Redundância e failover automático em múltiplas zonas</li>
                    <li>Relatórios em tempo real de entregas, aberturas e cliques</li>
                    <li>Conformidade total com as políticas da Meta</li>
                    <li>SLA de 99.9% de uptime</li>
                </ul>
            </div>

            <div class="ssr-section">
                <h2>O Que Nos Diferencia</h2>
                <ul>
                    <li>API Oficial Meta 100% — sem risco de bloqueio</li>
                    <li>Templates multimídia ilimitados</li>
                    <li>Chatbot com IA inclusa</li>
                    <li>Suporte humanizado especializado</li>
                    <li>Preço justo, sem taxa de setup</li>
                    <li>Consultoria de growth inclusa</li>
                </ul>
            </div>

            <div class="ssr-section">
                <h2>Soluções por Setor</h2>
                <ul>
                    <li><strong>E-commerce:</strong> Carrinho abandonado, ofertas, recuperação de clientes</li>
                    <li><strong>Imobiliárias:</strong> Disparo de imóveis, lembretes de visita, follow-up</li>
                    <li><strong>Educação:</strong> Matrículas, lembretes de aula, comunicados</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 60px;">
                <a href="https://wa.me/5531983994058?text=Olá! Quero saber mais sobre a Plug & Sales e os planos de disparo." target="_blank" rel="noopener noreferrer" class="ssr-cta">FALAR CONOSCO</a>
            </div>
        `
    });
};

export const blogRenderer = () => {
    return renderHtml({
        title: 'Blog — Disparo em Massa WhatsApp | API Oficial | Plug & Sales',
        description: 'Acompanhe as últimas tendências em disparo em massa no WhatsApp, API Oficial da Meta, WABA, chatbots e estratégias de vendas digitais.',
        canonical: SITE_URL + '/blog',
        keywords: 'blog disparo whatsapp, api whatsapp, waba, chatbot whatsapp',
        schema: [
            {
                "@context": "https://schema.org", "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                    { "@type": "ListItem", "position": 2, "name": "Blog", "item": SITE_URL + "/blog" }
                ]
            },
            {
                "@context": "https://schema.org", "@type": "Blog",
                "name": "Blog Plug & Sales",
                "description": "Conteúdo sobre disparo em massa WhatsApp, API Oficial, WABA e estratégias de vendas.",
                "url": SITE_URL + "/blog"
            }
        ],
        content: `
            <div class="ssr-badge">CONTEÚDO EXCLUSIVO</div>
            <h1 class="ssr-title">Hub de Inteligência Plug & Sales</h1>
            <p class="ssr-subtitle">Estratégias avançadas para quem não quer apenas disparar mensagens, mas construir uma máquina de vendas.</p>
            
            <div class="ssr-section">
                <h2>Últimos Artigos</h2>
                <ul>
                    <li><a href="/blog/como-evitar-bloqueios-whatsapp-api" style="color:#acf800;text-decoration:none;">Como evitar bloqueios usando a API Oficial do WhatsApp</a></li>
                    <li><a href="/blog/estrategias-disparo-em-massa-alta-conversao" style="color:#acf800;text-decoration:none;">Estratégias de disparo em massa para alta conversão</a></li>
                    <li><a href="/blog/beneficios-chatbot-inteligente-whatsapp" style="color:#acf800;text-decoration:none;">Benefícios de um Chatbot inteligente no seu WhatsApp</a></li>
                    <li><a href="/blog/integracao-crm-whatsapp" style="color:#acf800;text-decoration:none;">Como integrar CRM com WhatsApp</a></li>
                </ul>
            </div>
        `
    });
};

export const blogPostRenderer = (post) => {
    const postUrl = SITE_URL + '/blog/' + post.slug;
    const datePublished = post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString();
    const dateModified = post.updated_at ? new Date(post.updated_at).toISOString() : datePublished;
    const ogImage = post.image || SITE_URL + '/og-image.png';
    const cleanContent = (post.content || post.excerpt || '').replace(/<[^>]*>/g, '').substring(0, 300);

    return renderHtml({
        title: post.title + ' | Blog Plug & Sales',
        description: post.excerpt || cleanContent.substring(0, 160),
        canonical: postUrl,
        ogImage: ogImage,
        ogType: 'article',
        keywords: 'blog disparo whatsapp, ' + (post.category || '').toLowerCase() + ', ' + post.title.toLowerCase(),
        schema: [
            {
                "@context": "https://schema.org", "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                    { "@type": "ListItem", "position": 2, "name": "Blog", "item": SITE_URL + "/blog" },
                    { "@type": "ListItem", "position": 3, "name": post.title, "item": postUrl }
                ]
            },
            {
                "@context": "https://schema.org", "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt || cleanContent.substring(0, 160),
                "image": ogImage,
                "author": {
                    "@type": "Person",
                    "name": post.author || "Plug & Sales"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Plug & Sales",
                    "logo": { "@type": "ImageObject", "url": SITE_URL + "/logo-supreme.png" }
                },
                "datePublished": datePublished,
                "dateModified": dateModified,
                "mainEntityOfPage": { "@type": "WebPage", "@id": postUrl }
            }
        ],
        content: `
            <div class="ssr-badge">${post.category || 'ARTIGO'}</div>
            <h1 class="ssr-title">${post.title}</h1>
            <p class="ssr-subtitle">${post.excerpt || cleanContent.substring(0, 160)}</p>
            <div style="color:#999;font-size:0.85rem;margin-bottom:32px;display:flex;gap:16px;flex-wrap:wrap;">
                ${post.author ? `<span>✍️ ${post.author}</span>` : ''}
                <span>📅 ${new Date(datePublished).toLocaleDateString('pt-BR')}</span>
                ${post.read_time ? `<span>⏱ ${post.read_time}</span>` : ''}
            </div>
            <div class="ssr-section">
                ${post.content ? post.content.substring(0, 5000) : `<p>${cleanContent.substring(0, 500)}</p>`}
            </div>
            <div style="text-align:center;margin-top:48px;padding-top:32px;border-top:1px solid rgba(255,255,255,0.05);">
                <a href="/blog" class="ssr-cta">← VER TODOS OS ARTIGOS</a>
            </div>
        `
    });
};

export const servicoDisparoRenderer = () => {
    return renderHtml({
        title: 'Disparo em Massa no WhatsApp | API Oficial Meta | Plug & Sales',
        description: 'Serviço de disparo em massa no WhatsApp via API Oficial da Meta. Envio de milhares de mensagens por dia sem bloqueio, com templates personalizados e relatórios.',
        canonical: SITE_URL + '/servicos/disparo-em-massa-whatsapp',
        keywords: 'disparo em massa whatsapp, envio em massa whatsapp, mensagem em massa whatsapp',
        schema: [
            {
                "@context": "https://schema.org", "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                    { "@type": "ListItem", "position": 2, "name": "Disparo em Massa WhatsApp", "item": SITE_URL + "/servicos/disparo-em-massa-whatsapp" }
                ]
            },
            {
                "@context": "https://schema.org", "@type": "Service",
                "name": "Disparo em Massa no WhatsApp via API Oficial",
                "description": "Serviço de envio em larga escala via API Oficial da Meta (WABA), com capacidade ilimitada e personalização visual.",
                "provider": { "@type": "Organization", "name": "Plug & Sales", "url": SITE_URL },
                "areaServed": "BR"
            },
            {
                "@context": "https://schema.org", "@type": "FAQPage",
                "mainEntity": [
                    { "@type": "Question", "name": "O disparo em massa pelo WhatsApp pode bloquear meu número?", "acceptedAnswer": { "@type": "Answer", "text": "Não. Utilizamos a API Oficial da Meta (WABA) com estrutura própria de números." } },
                    { "@type": "Question", "name": "Qual o volume mínimo de disparo?", "acceptedAnswer": { "@type": "Answer", "text": "O mínimo é de 10 mil contatos por disparo. Não há limite máximo." } }
                ]
            }
        ],
        content: `
            <div class="ssr-badge">SERVIÇO PREMIUM</div>
            <h1 class="ssr-title">Disparo em Massa no WhatsApp</h1>
            <p class="ssr-subtitle">Envie milhares de mensagens por dia via API Oficial da Meta, com templates personalizados, foto, vídeo, áudio e botões. Sem bloqueio, sem burocracia, sem risco.</p>
            <a href="/lead-flow" class="ssr-cta">QUERO COMEÇAR AGORA</a>

            <div class="ssr-section" style="margin-top: 80px;">
                <h2>O que você pode enviar</h2>
                <ul>
                    <li>Texto personalizado</li>
                    <li>Imagens e vídeos</li>
                    <li>Áudio e documentos</li>
                    <li>Botões com link</li>
                    <li>Variáveis dinâmicas por contato</li>
                </ul>
            </div>

            <div class="ssr-section">
                <h2>Vantagens</h2>
                <ul>
                    <li>Sem risco de bloqueio — API Oficial com estrutura própria</li>
                    <li>Ativação em 24h — Sem configurações complexas</li>
                    <li>Volume real sem limites — De 10 mil a milhões por dia</li>
                    <li>Relatórios detalhados em tempo real</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">ATIVAR AGORA</a>
            </div>
        `
    });
};

export const servicoApiOficialRenderer = () => {
    return renderHtml({
        title: 'API Oficial do WhatsApp para Empresas (WABA) | Plug & Sales',
        description: 'Solução completa de API Oficial do WhatsApp (WABA) para empresas. Disparo em massa com segurança, templates multimídia, botões e relatórios.',
        canonical: SITE_URL + '/servicos/api-oficial-whatsapp',
        keywords: 'api oficial whatsapp, waba, whatsapp business api, api whatsapp empresarial',
        schema: [
            {
                "@context": "https://schema.org", "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                    { "@type": "ListItem", "position": 2, "name": "API Oficial WhatsApp", "item": SITE_URL + "/servicos/api-oficial-whatsapp" }
                ]
            },
            {
                "@context": "https://schema.org", "@type": "FAQPage",
                "mainEntity": [
                    { "@type": "Question", "name": "O que é a API Oficial do WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "É a WhatsApp Business API (WABA), a solução oficial da Meta para empresas enviarem mensagens em escala com segurança e recursos avançados." } },
                    { "@type": "Question", "name": "Preciso criar uma Business Manager (BM)?", "acceptedAnswer": { "@type": "Answer", "text": "Não. Com a Plug & Sales, você não precisa criar ou verificar BM. Utilizamos nossa própria infraestrutura homologada." } }
                ]
            }
        ],
        content: `
            <div class="ssr-badge">TECNOLOGIA WABA</div>
            <h1 class="ssr-title">API Oficial do WhatsApp para Empresas</h1>
            <p class="ssr-subtitle">A WhatsApp Business API (WABA) é a única solução homologada pela Meta para disparos em massa. Conecte sua operação diretamente aos servidores oficiais do WhatsApp com segurança total.</p>
            <a href="/lead-flow" class="ssr-cta">ATIVAR API OFICIAL</a>

            <div class="ssr-section" style="margin-top: 80px;">
                <h2>Diferenças: API Oficial vs Não-Oficial</h2>
                <ul>
                    <li>Segurança contra bloqueio — API Oficial: Total | Não-Oficial: Alto risco</li>
                    <li>Limite de envio — API Oficial: Ilimitado | Não-Oficial: Restrito</li>
                    <li>Templates com botões — API Oficial: Sim | Não-Oficial: Não</li>
                    <li>Homologação Meta — API Oficial: Sim | Não-Oficial: Violação de ToS</li>
                </ul>
            </div>

            <div class="ssr-section">
                <h2>Diferenciais Plug & Sales</h2>
                <ul>
                    <li>Infraestrutura homologada — 100% dentro das diretrizes Meta</li>
                    <li>Sem necessidade de BM própria</li>
                    <li>Escala imediata — estrutura pronta para alto volume desde o dia 1</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">ATIVAR AGORA</a>
            </div>
        `
    });
};

export const servicoChatbotRenderer = () => {
    return renderHtml({
        title: 'Chatbot Inteligente para WhatsApp | Automação de Vendas | Plug & Sales',
        description: 'Chatbot inteligente para WhatsApp com IA. Automatize atendimento, qualifique leads e aumente vendas 24h por dia. Integração com API Oficial da Meta.',
        canonical: SITE_URL + '/servicos/chatbot-whatsapp',
        keywords: 'chatbot whatsapp, bot whatsapp, atendimento automatizado whatsapp',
        schema: [
            {
                "@context": "https://schema.org", "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                    { "@type": "ListItem", "position": 2, "name": "Chatbot WhatsApp", "item": SITE_URL + "/servicos/chatbot-whatsapp" }
                ]
            },
            {
                "@context": "https://schema.org", "@type": "FAQPage",
                "mainEntity": [
                    { "@type": "Question", "name": "Como funciona o chatbot da Plug & Sales?", "acceptedAnswer": { "@type": "Answer", "text": "Utilizamos inteligência artificial para criar fluxos de conversa automatizados que qualificam leads, respondem perguntas frequentes e agendam vendas 24/7." } },
                    { "@type": "Question", "name": "O chatbot pode ser personalizado?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. Criamos fluxos personalizados com a identidade visual e tom de voz da sua marca, com respostas inteligentes baseadas no seu produto ou serviço." } }
                ]
            }
        ],
        content: `
            <div class="ssr-badge">AUTOMAÇÃO INTELIGENTE</div>
            <h1 class="ssr-title">Chatbot Inteligente para WhatsApp</h1>
            <p class="ssr-subtitle">Automatize seu atendimento com IA. Fluxos inteligentes que qualificam leads, respondem dúvidas e fecham vendas enquanto você dorme.</p>
            <a href="/lead-flow" class="ssr-cta">CRIAR MEU CHATBOT</a>

            <div class="ssr-section" style="margin-top: 80px;">
                <h2>O que nosso chatbot faz</h2>
                <ul>
                    <li>Respostas inteligentes com IA treinada no seu produto</li>
                    <li>Qualificação automática de leads</li>
                    <li>Métricas completas de conversão</li>
                    <li>Funciona 24 horas por dia, 7 dias por semana</li>
                </ul>
            </div>

            <div class="ssr-section">
                <h2>Benefícios</h2>
                <ul>
                    <li>Redução de custos — Diminua sua equipe em até 70%</li>
                    <li>Aumento de conversão — Leads respondidos em segundos convertem 5x mais</li>
                    <li>Escalabilidade — Atenda milhares simultaneamente</li>
                    <li>Learning contínuo — Melhora com cada interação</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">CRIAR MEU CHATBOT</a>
            </div>
        `
    });
};

export const presentationsRenderer = () => {
    return renderHtml({
        title: 'Apresentações Plug & Sales — Plataforma de Disparo em Massa WhatsApp, Chatbot e API Oficial',
        description: 'Conheça todos os recursos da Plug & Sales: disparo em massa via API Oficial da Meta, chatbot inteligente com IA, dashboard em tempo real, analytics e automação.',
        canonical: SITE_URL + '/apresentacoes',
        keywords: 'apresentação plug sales, plataforma disparo whatsapp, dashboard disparo em massa, recursos api oficial whatsapp, demo disparo whatsapp',
        schema: [
            {
                "@context": "https://schema.org", "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                    { "@type": "ListItem", "position": 2, "name": "Apresentações", "item": SITE_URL + "/apresentacoes" }
                ]
            },
            {
                "@context": "https://schema.org",
                "@type": "PresentationDigitalDocument",
                "name": "Plug & Sales — Plataforma de Disparo em Massa WhatsApp",
                "description": "Apresentação completa dos recursos da plataforma: API Oficial Meta, disparos em massa, dashboard, analytics, chatbot e automação.",
                "author": { "@type": "Organization", "name": "Plug & Sales" }
            }
        ],
        content: `
            <div class="ssr-badge">EXPLORE A PLATAFORMA</div>
            <h1 class="ssr-title">Tudo que você precisa para dominar o WhatsApp</h1>
            <p class="ssr-subtitle">Uma plataforma completa de disparo em massa, chatbot com IA e API Oficial da Meta. Dashboard poderoso, analytics em tempo real e suporte que realmente resolve.</p>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 48px 0;">
                <div style="text-align: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(172,248,0,0.1); padding: 32px 16px; border-radius: 14px;">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #acf800;">2Bi+</div>
                    <div style="color: #999; font-size: 0.9rem;">Mensagens Entregues</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(172,248,0,0.1); padding: 32px 16px; border-radius: 14px;">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #acf800;">99.8%</div>
                    <div style="color: #999; font-size: 0.9rem;">Taxa de Entrega</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(172,248,0,0.1); padding: 32px 16px; border-radius: 14px;">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #acf800;">500+</div>
                    <div style="color: #999; font-size: 0.9rem;">Clientes Ativos</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(172,248,0,0.1); padding: 32px 16px; border-radius: 14px;">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #acf800;">4.9/5</div>
                    <div style="color: #999; font-size: 0.9rem;">Avaliação Média</div>
                </div>
            </div>

            <div class="ssr-section">
                <h2>Recursos Premium</h2>
                <ul>
                    <li><strong>API Oficial Meta</strong> — Segurança total contra bloqueios. Conformidade 100%</li>
                    <li><strong>Disparo em Massa</strong> — Milhares de mensagens por minuto com entrega garantida</li>
                    <li><strong>Dashboard Completo</strong> — Métricas em tempo real e exportação de relatórios</li>
                    <li><strong>Analytics Avançado</strong> — Saiba quem recebeu, leu, clicou e respondeu</li>
                    <li><strong>Chatbot com IA</strong> — Automação de vendas e suporte com inteligência artificial</li>
                    <li><strong>Multi-Números</strong> — Gerencie dezenas de números em uma única plataforma</li>
                    <li><strong>Segmentação</strong> — Segmentos dinâmicos por comportamento e localização</li>
                </ul>
            </div>

            <div class="ssr-section">
                <h2>Jornada do Cliente</h2>
                <ol style="list-style: decimal; padding-left: 20px; color: #ccc;">
                    <li style="margin-bottom: 12px;"><strong style="color:#acf800;">01.</strong> Escolha seu Plug Card — plano ideal sem assinatura</li>
                    <li style="margin-bottom: 12px;"><strong style="color:#acf800;">02.</strong> Ativação WABA — API pronta em até 24h</li>
                    <li style="margin-bottom: 12px;"><strong style="color:#acf800;">03.</strong> Crie templates multimídia com aprovação rápida</li>
                    <li style="margin-bottom: 12px;"><strong style="color:#acf800;">04.</strong> Importe e segmente sua base de contatos</li>
                    <li style="margin-bottom: 12px;"><strong style="color:#acf800;">05.</strong> Dispare campanhas e acompanhe métricas ao vivo</li>
                </ol>
            </div>

            <div class="ssr-section">
                <h2>Por que escolher a Plug & Sales</h2>
                <ul>
                    <li>API Oficial Meta — sem risco de bloqueio</li>
                    <li>Chatbot com IA integrado</li>
                    <li>Dashboard em tempo real</li>
                    <li>Suporte humanizado especializado</li>
                    <li>Preço justo, sem taxa de setup</li>
                    <li>Plug Cards pré-pagos flexíveis</li>
                    <li>Analytics avançado incluso</li>
                    <li>Consultoria de growth inclusa</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 60px;">
                <a href="https://wa.me/5531983994058?text=Olá! Quero uma demonstração da plataforma Plug & Sales." target="_blank" rel="noopener noreferrer" class="ssr-cta">SOLICITAR DEMO</a>
            </div>
        `
    });
};

export const guiaDisparoMassaRenderer = () => {
    return renderHtml({
        title: 'Guia Completo de Disparo em Massa no WhatsApp | API Oficial 2026',
        description: 'Guia definitivo sobre disparo em massa no WhatsApp via API Oficial da Meta. Aprenda como funciona, custos, como evitar bloqueio, melhores práticas e tudo que você precisa para escalar.',
        canonical: SITE_URL + '/guia/disparo-em-massa-whatsapp',
        keywords: 'guia disparo em massa whatsapp, como fazer disparo em massa no whatsapp, tutorial disparo whatsapp',
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Guia", "item": SITE_URL + "/guia/disparo-em-massa-whatsapp" },
                { "@type": "ListItem", "position": 3, "name": "Disparo em Massa WhatsApp", "item": SITE_URL + "/guia/disparo-em-massa-whatsapp" }
            ]},
            { "@context": "https://schema.org", "@type": "HowTo", "name": "Como fazer disparo em massa no WhatsApp com API Oficial", "description": "Guia passo a passo para configurar e realizar disparos em massa no WhatsApp usando a API Oficial da Meta.", "step": [
                { "@type": "HowToStep", "position": 1, "name": "Escolha seu plano de disparo", "text": "Selecione o Plug Card ideal para seu volume." },
                { "@type": "HowToStep", "position": 2, "name": "Prepare sua base de contatos", "text": "Organize sua lista com nomes, telefones e dados de personalização." },
                { "@type": "HowToStep", "position": 3, "name": "Crie seus templates de mensagem", "text": "Desenvolva mensagens com texto, imagem, vídeo ou botões." },
                { "@type": "HowToStep", "position": 4, "name": "Envie materiais para aprovação", "text": "Submeta templates e lista de contatos para aprovação em até 48h." },
                { "@type": "HowToStep", "position": 5, "name": "Acompanhe resultados em tempo real", "text": "Monitore entregas, aberturas e cliques direto do dashboard." }
            ]}
        ],
        content: `
            <div class="ssr-badge">GUIA COMPLETO 2026</div>
            <h1 class="ssr-title">Disparo em Massa no WhatsApp: O Guia Definitivo</h1>
            <p class="ssr-subtitle">Tudo que você precisa saber para enviar milhares de mensagens por dia com segurança, dentro da lei, e sem risco de bloqueio.</p>
            <div class="ssr-section">
                <h2>O que é disparo em massa no WhatsApp?</h2>
                <p>Disparo em massa no WhatsApp é a prática de enviar mensagens para um grande número de contatos simultaneamente através da API Oficial da Meta (WABA). Diferente de listas de transmissão (limitadas a 256 contatos), o disparo em massa profissional pode alcançar milhares ou milhões de pessoas por dia.</p>
                <p>O WhatsApp tem uma taxa de abertura de 98% — contra 20% do e-mail marketing. Para empresas que dependem de comunicação com clientes, o disparo em massa via API Oficial é a estratégia mais eficiente.</p>
            </div>
            <div class="ssr-section">
                <h2>API Oficial vs Disparador Web</h2>
                <p>A API Oficial (WABA) é homologada pela Meta, sem risco de bloqueio e com templates multimídia. Disparadores web automatizam o WhatsApp Web, violam os Termos de Serviço e resultam em banimento.</p>
            </div>
            <div class="ssr-section">
                <h2>Como funciona a WABA?</h2>
                <p>A WhatsApp Business API opera nos servidores da Meta, sem precisar de celular conectado. Utiliza um sistema de Tiers de Reputação (1 a 3) que determinam o volume diário de conversas. Com a Plug & Sales, você começa em tiers elevados.</p>
            </div>
            <div class="ssr-section">
                <h2>Custos do disparo em massa em 2026</h2>
                <p>Com a Plug & Sales, você paga de R$ 97 (10 mil disparos) a R$ 3.497 (500 mil disparos). Até 95% menos que BSPs tradicionais. Sem taxa de setup, sem surpresas.</p>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">COMEÇAR MEUS DISPAROS</a>
            </div>
        `
    });
};

export const precosRenderer = () => {
    return renderHtml({
        title: 'Preços — Planos de Disparo em Massa WhatsApp | Plug & Sales',
        description: 'Compare todos os planos de disparo em massa no WhatsApp. De R$ 97 (10 mil disparos) a R$ 3.497 (500 mil disparos). Pré-pago, sem surpresas, API Oficial da Meta.',
        canonical: SITE_URL + '/precos',
        keywords: 'preço disparo em massa whatsapp, plano disparo whatsapp, quanto custa disparo em massa whatsapp, plug cards preço',
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Preços", "item": SITE_URL + "/precos" }
            ]},
            { "@context": "https://schema.org", "@type": "Product", "name": "Plug Cards — Planos de Disparo em Massa WhatsApp", "description": "Planos pré-pagos de disparo em massa no WhatsApp via API Oficial da Meta.", "brand": { "@type": "Brand", "name": "Plug & Sales" }, "offers": { "@type": "AggregateOffer", "priceCurrency": "BRL", "lowPrice": "97", "highPrice": "3497", "offerCount": "5", "availability": "https://schema.org/InStock" } }
        ],
        content: `
            <div class="ssr-badge">PLANOS</div>
            <h1 class="ssr-title">Planos de Disparo em Massa WhatsApp</h1>
            <p class="ssr-subtitle">Escolha o Plug Card ideal para seu volume. Pré-pago, sem taxa de setup, sem surpresas.</p>
            <div class="ssr-section">
                <h2>Preços dos Plug Cards</h2>
                <ul>
                    <li><strong>PC-10 Foundation Card</strong> — 10.000 disparos por R$ 97</li>
                    <li><strong>PC-20 Growth Card</strong> — 20.000 disparos por R$ 197</li>
                    <li><strong>PC-50 Performance Card</strong> — 50.000 disparos por R$ 497</li>
                    <li><strong>PC-100 Scale Card</strong> — 100.000 disparos por R$ 897</li>
                    <li><strong>PC-500 Apex Card</strong> — 500.000 disparos por R$ 3.497</li>
                </ul>
                <p>Todos os planos incluem API Oficial da Meta, templates multimídia e suporte dedicado.</p>
            </div>
            <div class="ssr-section">
                <h2>Vantagens</h2>
                <ul>
                    <li>Custo até 95% menor que BSPs tradicionais</li>
                    <li>Sem risco de bloqueio — API Oficial homologada</li>
                    <li>Ativação em 24h — sem BM própria necessária</li>
                    <li>Pré-pago — sem surpresas na fatura</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">ESCOLHER MEU PLANO</a>
            </div>
        `
    });
};

export const comparacaoApiOficialRenderer = () => {
    return renderHtml({
        title: 'API Oficial vs Disparador Web — Comparação Completa | Plug & Sales',
        description: 'Comparação definitiva entre API Oficial do WhatsApp (WABA) e disparadores web não-oficiais. Entenda riscos, limites e custos de cada abordagem.',
        canonical: SITE_URL + '/comparacao/api-oficial-vs-disparador-web',
        keywords: 'api oficial vs disparador web, comparativo api whatsapp, waba vs disparador',
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Comparação", "item": SITE_URL + "/comparacao/api-oficial-vs-disparador-web" }
            ]},
            { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
                { "@type": "Question", "name": "Qual a diferença entre API Oficial e disparador web?", "acceptedAnswer": { "@type": "Answer", "text": "A API Oficial (WABA) é homologada pela Meta, sem risco de bloqueio. Disparadores web automatizam o WhatsApp Web e violam os Termos de Serviço." } },
                { "@type": "Question", "name": "Disparador web pode bloquear meu número?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. O bloqueio é questão de tempo quando usado um disparador web não-oficial." } }
            ]}
        ],
        content: `
            <div class="ssr-badge">COMPARAÇÃO DEFINITIVA</div>
            <h1 class="ssr-title">API Oficial vs Disparador Web</h1>
            <p class="ssr-subtitle">Nem toda ferramenta de disparo em massa é igual. Compare lado a lado e entenda por que a escolha certa define o futuro da sua operação.</p>
            <div class="ssr-section">
                <h2>Diferenças principais</h2>
                <ul>
                    <li><strong>Homologação Meta</strong> — API Oficial: Sim | Disparador Web: Não (viola ToS)</li>
                    <li><strong>Risco de bloqueio</strong> — API Oficial: Zero | Disparador Web: Alto</li>
                    <li><strong>Templates com botões</strong> — API Oficial: Sim | Disparador Web: Não</li>
                    <li><strong>Limite de envio</strong> — API Oficial: Ilimitado | Disparador Web: 100-500/dia</li>
                    <li><strong>Número verificado</strong> — API Oficial: Sim | Disparador Web: Não</li>
                </ul>
            </div>
            <div class="ssr-section">
                <h2>Custos comparados</h2>
                <ul>
                    <li>Plug & Sales (API Oficial): a partir de R$ 97</li>
                    <li>BSP Tradicional: R$ 200-800/mês + R$ 0,18/msg</li>
                    <li>Disparador Web: R$ 97-497/mês (com risco de banimento)</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">ATIVAR API OFICIAL</a>
            </div>
        `
    });
};

export const paraEcommerceRenderer = () => {
    return renderHtml({
        title: 'Disparo em Massa WhatsApp para E-commerce | API Oficial | Plug & Sales',
        description: 'Aumente suas vendas com disparo em massa no WhatsApp para e-commerce. Recupere carrinhos abandonados, envie ofertas personalizadas e automatize confirmações com API Oficial da Meta.',
        canonical: SITE_URL + '/para/ecommerce',
        keywords: 'disparo whatsapp ecommerce, whatsapp para loja virtual, recuperação carrinho abandonado whatsapp',
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Para E-commerce", "item": SITE_URL + "/para/ecommerce" }
            ]},
            { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
                { "@type": "Question", "name": "Como usar WhatsApp para recuperar carrinho abandonado?", "acceptedAnswer": { "@type": "Answer", "text": "Com a API Oficial, você cria um template com imagem do produto + link direto para o checkout. Taxa de conversão de até 15%." } },
                { "@type": "Question", "name": "Posso enviar ofertas personalizadas por WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. A API Oficial suporta variáveis dinâmicas como nome, produto e valor para cada cliente." } }
            ]}
        ],
        content: `
            <div class="ssr-badge">PARA E-COMMERCE</div>
            <h1 class="ssr-title">Disparo em Massa no WhatsApp para E-commerce</h1>
            <p class="ssr-subtitle">Transforme o WhatsApp no seu principal canal de vendas. Recupere carrinhos abandonados, dispare ofertas personalizadas e aumente o ticket médio.</p>
            <div class="ssr-section">
                <h2>Por que WhatsApp para E-commerce?</h2>
                <p>98% de taxa de abertura. Mensagens lidas em até 3 minutos. Recuperação de carrinho abandonado com até 15% de conversão — contra 3-5% do e-mail marketing.</p>
            </div>
            <div class="ssr-section">
                <h2>Fluxos de venda</h2>
                <ul>
                    <li>Confirmação de pedido com resumo e prazo de entrega</li>
                    <li>Atualização de frete com código de rastreio</li>
                    <li>Follow-up pós-compra para avaliação</li>
                    <li>Ofertas segmentadas por histórico de compras</li>
                    <li>Lembrete de reposição para produtos consumíveis</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">COMEÇAR AGORA</a>
            </div>
        `
    });
};

export const guiaEscolherBSPRenderer = () => {
    return renderHtml({
        title: 'Como Escolher um BSP WhatsApp | Guia Completo 2026 | Plug & Sales',
        description: 'Guia completo para escolher o melhor BSP (Business Solution Provider) para WhatsApp Business API. Compare preços, recursos, suporte e infraestrutura.',
        canonical: SITE_URL + '/guia/como-escolher-bsp-whatsapp',
        keywords: 'bsp whatsapp, business solution provider whatsapp, escolher bsp whatsapp, melhor bsp whatsapp',
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Guia", "item": SITE_URL + "/guia/como-escolher-bsp-whatsapp" },
                { "@type": "ListItem", "position": 3, "name": "Como Escolher um BSP WhatsApp", "item": SITE_URL + "/guia/como-escolher-bsp-whatsapp" }
            ]}
        ],
        content: `
            <div class="ssr-badge">GUIA COMPLETO 2026</div>
            <h1 class="ssr-title">Como Escolher o Melhor BSP WhatsApp</h1>
            <p class="ssr-subtitle">Escolher o BSP certo para sua operação de WhatsApp Business API é a decisão mais importante que você vai tomar. Este guia mostra exatamente o que avaliar.</p>
            <div class="ssr-section">
                <h2>O que é um BSP WhatsApp?</h2>
                <p>BSP (Business Solution Provider) é uma empresa parceira oficial da Meta que fornece a infraestrutura para acessar a WhatsApp Business API (WABA). A Meta não permite que empresas comuns se conectem diretamente à WABA — todo acesso precisa ser intermediado por um BSP homologado.</p>
            </div>
            <div class="ssr-section">
                <h2>Critérios para escolher</h2>
                <ul>
                    <li>Homologação Meta — parceiro oficial</li>
                    <li>Facilidade de ativação — ativação em 24-48h</li>
                    <li>Modelo de precificação — pré-pago vs taxa mensal</li>
                    <li>Suporte em português</li>
                    <li>Recursos disponíveis (templates, botões, variáveis)</li>
                </ul>
            </div>
            <div class="ssr-section">
                <h2>Comparação de preços</h2>
                <p>A Plug & Sales oferece o melhor custo-benefício: R$ 0 de taxa mensal, a partir de R$ 97 por 10 mil disparos. Economia de até 95% comparado a BSPs tradicionais.</p>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">ESCOLHER MEU BSP</a>
            </div>
        `
    });
};

export const guiaEstrategiasConversaoRenderer = () => {
    return renderHtml({
        title: 'Estratégias de Conversão no WhatsApp | Guia Completo 2026 | Plug & Sales',
        description: 'Guia completo com estratégias de conversão para disparo em massa no WhatsApp. Aprenda a segmentar, personalizar e otimizar campanhas para máximo ROI.',
        canonical: SITE_URL + '/guia/estrategias-conversao-whatsapp',
        keywords: 'estratégias conversão whatsapp, aumentar conversão whatsapp, otimizar disparo whatsapp, roi whatsapp',
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Guia", "item": SITE_URL + "/guia/estrategias-conversao-whatsapp" },
                { "@type": "ListItem", "position": 3, "name": "Estratégias de Conversão WhatsApp", "item": SITE_URL + "/guia/estrategias-conversao-whatsapp" }
            ]}
        ],
        content: `
            <div class="ssr-badge">GUIA COMPLETO 2026</div>
            <h1 class="ssr-title">Estratégias de Conversão no WhatsApp</h1>
            <p class="ssr-subtitle">Não basta enviar mensagens — você precisa converter. Este guia ensina as estratégias avançadas que usamos para gerar ROI de 300%+ nos disparos em massa.</p>
            <div class="ssr-section">
                <h2>Os 4 Pilares da Conversão</h2>
                <ul>
                    <li>Segmentação — a pessoa certa</li>
                    <li>Mensagem — o conteúdo certo</li>
                    <li>Timing — o momento certo</li>
                    <li>CTA — a ação certa</li>
                </ul>
            </div>
            <div class="ssr-section">
                <h2>Framework AIDA para WhatsApp</h2>
                <p>Atenção (3s): primeira linha personalizada. Interesse (10s): conecte o produto à necessidade. Desejo (5s): botão com oferta. Ação: um único CTA.</p>
            </div>
            <div class="ssr-section">
                <h2>Segmentação por Nível de Consciência</h2>
                <p>Inconsciente → conteúdo educativo. Consciente do problema → benefícios. Consciente da solução → oferta. Mais consciente → cross-sell.</p>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">COMEÇAR AGORA</a>
            </div>
        `
    });
};

export const paraImobiliariasRenderer = () => {
    return renderHtml({
        title: 'Disparo em Massa WhatsApp para Imobiliárias | API Oficial | Plug & Sales',
        description: 'Aumente as vendas da sua imobiliária com disparo em massa no WhatsApp. Envie novos imóveis, agende visitas e mantenha contato com leads via API Oficial da Meta.',
        canonical: SITE_URL + '/para/imobiliarias',
        keywords: 'whatsapp imobiliária, disparo em massa imobiliária, vendas imóveis whatsapp, agendar visita whatsapp',
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Para Imobiliárias", "item": SITE_URL + "/para/imobiliarias" }
            ]}
        ],
        content: `
            <div class="ssr-badge">PARA IMOBILIÁRIAS</div>
            <h1 class="ssr-title">Disparo em Massa no WhatsApp para Imobiliárias</h1>
            <p class="ssr-subtitle">Envie novos imóveis para leads segmentados, agende visitas automaticamente e feche mais negócios com a API Oficial da Meta.</p>
            <div class="ssr-section">
                <h2>Fluxos para imobiliárias</h2>
                <ul>
                    <li>Novos imóveis segmentados por bairro e preço</li>
                    <li>Agendamento automático de visitas com botões</li>
                    <li>Lembrete de visita 24h antes (reduz absenteísmo em 60%)</li>
                    <li>Follow-up pós-visita automatizado</li>
                    <li>Relatórios de desempenho completo</li>
                </ul>
            </div>
            <div class="ssr-section">
                <h2>Case de sucesso</h2>
                <p>Imobiliária em MG: 230% mais agendamentos, tempo de venda caiu de 90 para 45 dias, ROI de 12x no primeiro mês.</p>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">ATIVAGOR AGORA</a>
            </div>
        `
    });
};

export const paraEducacaoRenderer = () => {
    return renderHtml({
        title: 'Disparo em Massa WhatsApp para Educação | API Oficial | Plug & Sales',
        description: 'Aumente matrículas e engajamento com disparo em massa no WhatsApp para instituições de ensino. Campanhas sazonais, lembretes de boleto e comunicação com alunos.',
        canonical: SITE_URL + '/para/educacao',
        keywords: 'whatsapp educação, disparo em massa escola, matrícula whatsapp, comunicação escolar whatsapp',
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Para Educação", "item": SITE_URL + "/para/educacao" }
            ]}
        ],
        content: `
            <div class="ssr-badge">PARA EDUCAÇÃO</div>
            <h1 class="ssr-title">Disparo em Massa no WhatsApp para Educação</h1>
            <p class="ssr-subtitle">Aumente matrículas, reduza inadimplência e engaje alunos com comunicação via API Oficial da Meta. Campanhas segmentadas com 98% de taxa de abertura.</p>
            <div class="ssr-section">
                <h2>Fluxos para educação</h2>
                <ul>
                    <li>Campanhas sazonais de matrícula (40% de conversão)</li>
                    <li>Lembretes de boleto (30% mais pagamentos em dia)</li>
                    <li>Materiais didáticos por WhatsApp</li>
                    <li>Comunicados e avisos institucionais</li>
                    <li>Pesquisa de satisfação NPS automatizada</li>
                </ul>
            </div>
            <div class="ssr-section">
                <h2>Case de sucesso</h2>
                <p>Faculdade EAD: 40% de conversão em matrícula, 65% menos inadimplência, ROI de 12x no semestre.</p>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">ATIVAR AGORA</a>
            </div>
        `
    });
};

export const buscaRenderer = () => {
    return renderHtml({
        title: 'Busca — Plug & Sales | Disparo em Massa WhatsApp',
        description: 'Encontre informações sobre disparo em massa no WhatsApp, API Oficial da Meta, Plug Cards e muito mais.',
        canonical: SITE_URL + '/busca',
        content: `
            <div class="ssr-badge">BUSCA</div>
            <h1 class="ssr-title">O que você está buscando?</h1>
            <p class="ssr-subtitle">Utilize o campo de busca no site para encontrar informações sobre disparo em massa, API Oficial, planos e muito mais.</p>
            <div class="ssr-section">
                <h2>Páginas principais</h2>
                <ul>
                    <li><a href="/" style="color:#acf800;">Disparo em Massa WhatsApp</a></li>
                    <li><a href="/precos" style="color:#acf800;">Planos e Preços</a></li>
                    <li><a href="/guia/disparo-em-massa-whatsapp" style="color:#acf800;">Guia Completo de Disparo</a></li>
                    <li><a href="/comparacao/api-oficial-vs-disparador-web" style="color:#acf800;">Comparação: API Oficial vs Disparador Web</a></li>
                    <li><a href="/para/ecommerce" style="color:#acf800;">Disparo para E-commerce</a></li>
                </ul>
            </div>
        `
    });
};

export const comoEnviarMensagemEmMassaRenderer = () => {
    return renderHtml({
        title: 'Como Enviar Mensagem em Massa no WhatsApp | Tutorial Passo a Passo 2026',
        description: 'Aprenda como enviar mensagem em massa no WhatsApp do jeito certo. Tutorial completo com passo a passo, ferramentas, dicas de segmentação e como evitar bloqueio.',
        canonical: SITE_URL + '/guia/como-enviar-mensagem-em-massa-whatsapp',
        keywords: 'como enviar mensagem em massa no whatsapp, enviar whatsapp em massa, mandar mensagem em massa whatsapp, como enviar mensagens em massa no whatsapp',
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Guia", "item": SITE_URL + "/guia/como-enviar-mensagem-em-massa-whatsapp" },
                { "@type": "ListItem", "position": 3, "name": "Como Enviar Mensagem em Massa no WhatsApp", "item": SITE_URL + "/guia/como-enviar-mensagem-em-massa-whatsapp" }
            ]},
            { "@context": "https://schema.org", "@type": "HowTo", "name": "Como enviar mensagem em massa no WhatsApp", "description": "Guia passo a passo para enviar mensagens em massa no WhatsApp de forma segura e profissional usando a API Oficial da Meta.", "step": [
                { "@type": "HowToStep", "position": 1, "name": "Escolha entre WhatsApp Business e API Oficial", "text": "Para uso profissional com mais de 256 contatos, escolha a API Oficial da Meta (WABA) através de um BSP como a Plug & Sales." },
                { "@type": "HowToStep", "position": 2, "name": "Crie sua conta no BSP", "text": "Cadastre-se na Plug & Sales. Não precisa de Business Manager próprio nem configuração técnica." },
                { "@type": "HowToStep", "position": 3, "name": "Prepare sua lista de contatos", "text": "Organize sua base com nomes, telefones com DDD e dados de personalização. Todos os contatos precisam ter opt-in." },
                { "@type": "HowToStep", "position": 4, "name": "Crie os templates de mensagem", "text": "Desenvolva mensagens com texto, imagem, vídeo ou botões. Os templates passam por aprovação da Meta." },
                { "@type": "HowToStep", "position": 5, "name": "Dispare e acompanhe resultados", "text": "Envie sua campanha e monitore entregas, aberturas e cliques em tempo real no dashboard." }
            ]}
        ],
        content: `
            <div class="ssr-badge">TUTORIAL COMPLETO</div>
            <h1 class="ssr-title">Como Enviar Mensagem em Massa no WhatsApp</h1>
            <p class="ssr-subtitle">Aprenda o passo a passo completo para enviar mensagens em massa no WhatsApp de forma profissional, segura e sem risco de bloqueio. Do básico ao avançado.</p>
            <div class="ssr-section">
                <h2>As 3 Formas de Enviar Mensagem em Massa</h2>
                <p><strong>Lista de Transmissão:</strong> WhatsApp comum, limite de 256 contatos. Não escala.</p>
                <p><strong>Disparador Web (QR Code):</strong> Viola os Termos de Serviço, bloqueio é questão de tempo.</p>
                <p><strong>API Oficial da Meta (WABA):</strong> A única solução profissional. Zero risco de bloqueio, escala ilimitada.</p>
            </div>
            <div class="ssr-section">
                <h2>Passo a Passo</h2>
                <ol>
                    <li>Escolha um BSP homologado pela Meta — <a href="${SITE_URL}" style="color:#acf800">Plug & Sales</a> ativa em 24h</li>
                    <li>Prepare sua lista de contatos com opt-in (LGPD)</li>
                    <li>Crie templates de mensagem com botões e mídia</li>
                    <li>Submeta para aprovação da Meta (48h úteis)</li>
                    <li>Acompanhe resultados em tempo real</li>
                </ol>
            </div>
            <div class="ssr-section">
                <h2>Como evitar bloqueio</h2>
                <ul>
                    <li>Use a API Oficial — nunca disparador web</li>
                    <li>Respeite os limites do seu Tier de reputação</li>
                    <li>Mantenha taxa de denúncias abaixo de 0,1%</li>
                    <li>Sempre inclua opt-out nas mensagens</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">COMEÇAR MEU DISPARO AGORA</a>
            </div>
        `
    });
};

export const disparoAutomaticoWhatsAppRenderer = () => {
    return renderHtml({
        title: 'Disparo Automático no WhatsApp: Como Automatizar Mensagens em Massa | Plug & Sales',
        description: 'Guia completo sobre disparo automático no WhatsApp. Aprenda como automatizar o envio de mensagens em massa com segurança usando a API Oficial da Meta.',
        canonical: SITE_URL + '/guia/disparo-automatico-whatsapp',
        keywords: 'disparo automatico whatsapp, automatizar mensagens whatsapp, envio automatico whatsapp, disparo automático whatsapp',
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Guia", "item": SITE_URL + "/guia/disparo-automatico-whatsapp" },
                { "@type": "ListItem", "position": 3, "name": "Disparo Automático WhatsApp", "item": SITE_URL + "/guia/disparo-automatico-whatsapp" }
            ]}
        ],
        content: `
            <div class="ssr-badge">GUIA COMPLETO</div>
            <h1 class="ssr-title">Disparo Automático no WhatsApp</h1>
            <p class="ssr-subtitle">Automatize o envio de mensagens em massa no WhatsApp sem risco de bloqueio. Guia completo sobre ferramentas, configuração e melhores práticas.</p>
            <div class="ssr-section">
                <h2>O que é Disparo Automático?</h2>
                <p>Disparo automático é o envio programado de mensagens sem intervenção manual. Você configura gatilhos e o sistema dispara automaticamente: formulário preenchido, carrinho abandonado, aniversário, etc.</p>
            </div>
            <div class="ssr-section">
                <h2>API Oficial vs Automação Web</h2>
                <p><strong>API Oficial (WABA):</strong> Automática, segura, homologada pela Meta. Milhares de mensagens/dia sem risco.</p>
                <p><strong>Automação Web (QR Code):</strong> Viola os Termos de Serviço. Bloqueio é inevitável.</p>
            </div>
            <div class="ssr-section">
                <h2>Fluxos que vendem</h2>
                <ul>
                    <li>Boas-vindas automáticas — lead chega, mensagem em segundos</li>
                    <li>Recuperação de carrinho — oferta automática 1h depois (até 15% de recuperação)</li>
                    <li>Aniversário — parabéns + oferta especial</li>
                    <li>Reengajamento — cliente sem comprar há 30 dias</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">CONFIGURAR DISPARO AUTOMÁTICO</a>
            </div>
        `
    });
};

export const disparoGratuitoVsApiOficialRenderer = () => {
    return renderHtml({
        title: 'Disparo em Massa WhatsApp Grátis vs API Oficial: Qual escolher? | Plug & Sales',
        description: 'Comparação completa entre disparo em massa WhatsApp grátis e API Oficial da Meta. Entenda os riscos de ferramentas gratuitas e por que a API Oficial é a única opção profissional.',
        canonical: SITE_URL + '/comparacao/disparo-gratuito-vs-api-oficial',
        keywords: 'disparo em massa whatsapp gratuito, disparador de mensagem whatsapp gratuito, disparo whatsapp grátis',
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Comparação", "item": SITE_URL + "/comparacao/disparo-gratuito-vs-api-oficial" },
                { "@type": "ListItem", "position": 3, "name": "Disparo Grátis vs API Oficial", "item": SITE_URL + "/comparacao/disparo-gratuito-vs-api-oficial" }
            ]},
            { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
                { "@type": "Question", "name": "Existe disparo em massa no WhatsApp grátis?", "acceptedAnswer": { "@type": "Answer", "text": "O WhatsApp Business App permite listas de até 256 contatos gratuitamente. Para envio profissional para milhares, é necessária a API Oficial." } },
                { "@type": "Question", "name": "Vale a pena pagar por disparo em massa?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. Com R$ 97 (10 mil disparos), o retorno é imediato. O custo de perder um número por ferramenta grátis é muito maior." } }
            ]}
        ],
        content: `
            <div class="ssr-badge">COMPARAÇÃO DEFINITIVA</div>
            <h1 class="ssr-title">Disparo em Massa WhatsApp Grátis vs Oficial</h1>
            <p class="ssr-subtitle">Entenda de uma vez por todas a diferença entre enviar mensagem em massa de graça (e arriscar seu número) vs usar a API Oficial profissionalmente.</p>
            <div class="ssr-section">
                <h2>O Custo Oculto do "Grátis"</h2>
                <p><strong>Disparador Web Grátis:</strong> Bloqueio permanente do número, perda da base de contatos, operação parada.</p>
                <p><strong>API Oficial (a partir de R$ 97):</strong> Zero risco de bloqueio, milhares de mensagens/dia, templates multimídia, ROI médio de 5x a 12x.</p>
            </div>
            <div class="ssr-section">
                <h2>Comparação lado a lado</h2>
                <ul>
                    <li><strong>Preço:</strong> Grátis (Business App) vs R$ 97+ (API Oficial)</li>
                    <li><strong>Limite:</strong> 256 contatos vs Ilimitado</li>
                    <li><strong>Risco de bloqueio:</strong> Baixo (Business) / Altíssimo (Web) vs Zero (API)</li>
                    <li><strong>Templates:</strong> Apenas texto vs Multimídia com botões</li>
                    <li><strong>Relatórios:</strong> Básico vs Detalhado</li>
                </ul>
            </div>
            <div class="ssr-section">
                <h2>Conta rápida</h2>
                <p>PC-10 Foundation Card (R$ 97) = 10 mil mensagens. Se 2% converterem em vendas de R$ 50 = R$ 10.000 em receita. ROI de 10.000%.</p>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">COMEÇAR AGORA</a>
            </div>
        `
    });
};

const stateData = {
    ac: { nome: 'Acre', sigla: 'AC', capital: 'Rio Branco', capital_slug: 'rio-branco', populacao: '830 mil', descricao_curta: 'O Acre é um estado estratégico na região Norte com crescimento no setor de serviços e comércio.' },
    al: { nome: 'Alagoas', sigla: 'AL', capital: 'Maceió', capital_slug: 'maceio', populacao: '3.1 milhões', descricao_curta: 'Alagoas é um estado nordestino com forte potencial no setor de turismo e comércio.' },
    am: { nome: 'Amazonas', sigla: 'AM', capital: 'Manaus', capital_slug: 'manaus', populacao: '3.9 milhões', descricao_curta: 'O Amazonas é o maior estado da região Norte, com forte polo industrial em Manaus.' },
    ap: { nome: 'Amapá', sigla: 'AP', capital: 'Macapá', capital_slug: 'macapa', populacao: '845 mil', descricao_curta: 'O Amapá é um estado da região Norte com economia baseada em serviços e extrativismo.' },
    ba: { nome: 'Bahia', sigla: 'BA', capital: 'Salvador', capital_slug: 'salvador', populacao: '14.1 milhões', descricao_curta: 'A Bahia é o maior estado do Nordeste, com economia diversificada e forte mercado consumidor.' },
    ce: { nome: 'Ceará', sigla: 'CE', capital: 'Fortaleza', capital_slug: 'fortaleza', populacao: '8.8 milhões', descricao_curta: 'O Ceará tem uma das economias mais dinâmicas do Nordeste, com forte presença digital.' },
    df: { nome: 'Distrito Federal', sigla: 'DF', capital: 'Brasília', capital_slug: 'brasilia', populacao: '2.8 milhões', descricao_curta: 'Brasília é o centro político do Brasil com a maior renda per capita do país.' },
    es: { nome: 'Espírito Santo', sigla: 'ES', capital: 'Vitória', capital_slug: 'vitoria', populacao: '3.9 milhões', descricao_curta: 'O Espírito Santo é um estado estratégico no Sudeste com forte atividade portuária.' },
    go: { nome: 'Goiás', sigla: 'GO', capital: 'Goiânia', capital_slug: 'goiania', populacao: '7.1 milhões', descricao_curta: 'Goiás é um estado estratégico no Centro-Oeste com forte agronegócio e comércio.' },
    ma: { nome: 'Maranhão', sigla: 'MA', capital: 'São Luís', capital_slug: 'sao-luis', populacao: '7.2 milhões', descricao_curta: 'O Maranhão é um estado nordestino com crescente digitalização do comércio.' },
    mg: { nome: 'Minas Gerais', sigla: 'MG', capital: 'Belo Horizonte', capital_slug: 'belo-horizonte', populacao: '20.5 milhões', descricao_curta: 'Minas Gerais é o segundo estado mais populoso do Sudeste com economia diversificada.' },
    ms: { nome: 'Mato Grosso do Sul', sigla: 'MS', capital: 'Campo Grande', capital_slug: 'campo-grande', populacao: '2.8 milhões', descricao_curta: 'Mato Grosso do Sul é referência no agronegócio e tem mercado digital crescente.' },
    mt: { nome: 'Mato Grosso', sigla: 'MT', capital: 'Cuiabá', capital_slug: 'cuiaba', populacao: '3.7 milhões', descricao_curta: 'Mato Grosso é líder do agronegócio brasileiro com economia em expansão.' },
    pa: { nome: 'Pará', sigla: 'PA', capital: 'Belém', capital_slug: 'belem', populacao: '8.1 milhões', descricao_curta: 'O Pará é o maior estado da região Norte em população e economia.' },
    pb: { nome: 'Paraíba', sigla: 'PB', capital: 'João Pessoa', capital_slug: 'joao-pessoa', populacao: '4 milhões', descricao_curta: 'A Paraíba tem economia diversificada e mercado digital em expansão.' },
    pe: { nome: 'Pernambuco', sigla: 'PE', capital: 'Recife', capital_slug: 'recife', populacao: '9.1 milhões', descricao_curta: 'Pernambuco é um dos estados mais inovadores do Nordeste, com forte polo tecnológico.' },
    pi: { nome: 'Piauí', sigla: 'PI', capital: 'Teresina', capital_slug: 'teresina', populacao: '3.3 milhões', descricao_curta: 'O Piauí tem economia em crescimento e mercado digital emergente.' },
    pr: { nome: 'Paraná', sigla: 'PR', capital: 'Curitiba', capital_slug: 'curitiba', populacao: '11.4 milhões', descricao_curta: 'O Paraná é um dos estados mais industrializados do Sul com economia forte.' },
    rj: { nome: 'Rio de Janeiro', sigla: 'RJ', capital: 'Rio de Janeiro', capital_slug: 'rio-de-janeiro', populacao: '16.1 milhões', descricao_curta: 'O Rio de Janeiro é o terceiro maior mercado do Brasil, com economia diversificada.' },
    rn: { nome: 'Rio Grande do Norte', sigla: 'RN', capital: 'Natal', capital_slug: 'natal', populacao: '3.5 milhões', descricao_curta: 'O Rio Grande do Norte tem economia baseada em turismo, comércio e serviços.' },
    ro: { nome: 'Rondônia', sigla: 'RO', capital: 'Porto Velho', capital_slug: 'porto-velho', populacao: '1.6 milhões', descricao_curta: 'Rondônia é um estado da região Norte com economia baseada no agronegócio.' },
    rr: { nome: 'Roraima', sigla: 'RR', capital: 'Boa Vista', capital_slug: 'boa-vista', populacao: '636 mil', descricao_curta: 'Roraima é o estado menos populoso do Brasil, com economia baseada em serviços.' },
    rs: { nome: 'Rio Grande do Sul', sigla: 'RS', capital: 'Porto Alegre', capital_slug: 'porto-alegre', populacao: '10.9 milhões', descricao_curta: 'O Rio Grande do Sul é um dos estados mais industrializados do Brasil.' },
    sc: { nome: 'Santa Catarina', sigla: 'SC', capital: 'Florianópolis', capital_slug: 'florianopolis', populacao: '7.6 milhões', descricao_curta: 'Santa Catarina é referência nacional em tecnologia, inovação e qualidade de vida.' },
    se: { nome: 'Sergipe', sigla: 'SE', capital: 'Aracaju', capital_slug: 'aracaju', populacao: '2.2 milhões', descricao_curta: 'Sergipe é o menor estado do Nordeste, mas com economia digital crescente.' },
    sp: { nome: 'São Paulo', sigla: 'SP', capital: 'São Paulo', capital_slug: 'sao-paulo', populacao: '44.4 milhões', descricao_curta: 'São Paulo é o maior mercado do Brasil, responsável por cerca de 30% do PIB nacional.' },
    to: { nome: 'Tocantins', sigla: 'TO', capital: 'Palmas', capital_slug: 'palmas', populacao: '1.5 milhões', descricao_curta: 'Tocantins é o estado mais novo do Brasil, com economia baseada no agronegócio.' },
};
const cityData = {
    'mg/belo-horizonte': { nome: 'Belo Horizonte', populacao: '2.5 milhões', destaque: 'Capital mineira, polo de tecnologia e inovação, 3º maior mercado do Sudeste.' },
    'mg/contagem': { nome: 'Contagem', populacao: '673 mil', destaque: 'Segundo maior polo industrial de Minas Gerais.' },
    'mg/uberlandia': { nome: 'Uberlândia', populacao: '706 mil', destaque: '2ª maior cidade de MG, polo logístico e agroindustrial do Triângulo Mineiro.' },
    'mg/juiz-de-fora': { nome: 'Juiz de Fora', populacao: '573 mil', destaque: 'Terceira maior cidade de MG, polo industrial e universitário.' },
    'mg/montes-claros': { nome: 'Montes Claros', populacao: '423 mil', destaque: 'Principal cidade do Norte de MG, polo regional de saúde e comércio.' },
    'sp/sao-paulo': { nome: 'São Paulo', populacao: '12.3 milhões', destaque: 'Maior cidade da América Latina, maior mercado do Brasil.' },
    'sp/campinas': { nome: 'Campinas', populacao: '1.2 milhão', destaque: 'Maior polo tecnológico do interior do Brasil.' },
    'sp/guarulhos': { nome: 'Guarulhos', populacao: '1.4 milhão', destaque: '2ª maior cidade de SP, maior aeroporto da América Latina.' },
    'sp/ribeirao-preto': { nome: 'Ribeirão Preto', populacao: '723 mil', destaque: 'Principal centro econômico do interior de SP, polo do agronegócio.' },
    'sp/sao-bernardo-do-campo': { nome: 'São Bernardo do Campo', populacao: '845 mil', destaque: 'Capital do ABC Paulista, polo automotivo e industrial.' },
    'sp/santo-andre': { nome: 'Santo André', populacao: '723 mil', destaque: 'Principal cidade do ABC Paulista, polo industrial e comercial.' },
    'sp/osasco': { nome: 'Osasco', populacao: '701 mil', destaque: 'Um dos maiores centros econômicos da Grande SP.' },
    'sp/sao-jose-dos-campos': { nome: 'São José dos Campos', populacao: '737 mil', destaque: 'Capital do Vale do Paraíba, polo aeroespacial e tecnológico.' },
    'sp/sorocaba': { nome: 'Sorocaba', populacao: '703 mil', destaque: 'Principal polo industrial do interior de SP.' },
    'sp/santos': { nome: 'Santos', populacao: '433 mil', destaque: 'Maior porto da América Latina, centro logístico e comercial.' },
    'rj/rio-de-janeiro': { nome: 'Rio de Janeiro', populacao: '6.7 milhões', destaque: '2ª maior cidade do Brasil, maior destino turístico.' },
    'rj/duque-de-caxias': { nome: 'Duque de Caxias', populacao: '924 mil', destaque: 'Maior polo industrial da Baixada Fluminense.' },
    'rj/sao-goncalo': { nome: 'São Gonçalo', populacao: '1.1 milhão', destaque: '2ª maior cidade do RJ em população.' },
    'rj/niteroi': { nome: 'Niterói', populacao: '516 mil', destaque: 'Melhor IDH do RJ, mercado de alto poder aquisitivo.' },
    'rj/petropolis': { nome: 'Petrópolis', populacao: '307 mil', destaque: 'Principal destino turístico da serra fluminense.' },
    'rj/volta-redonda': { nome: 'Volta Redonda', populacao: '273 mil', destaque: 'Polo industrial do Sul Fluminense, sede da CSN.' },
    'ba/salvador': { nome: 'Salvador', populacao: '2.9 milhões', destaque: '3ª maior cidade do Brasil, maior mercado do Nordeste.' },
    'ba/feira-de-santana': { nome: 'Feira de Santana', populacao: '624 mil', destaque: 'Segunda maior cidade da Bahia, principal entroncamento rodoviário do Nordeste.' },
    'ce/fortaleza': { nome: 'Fortaleza', populacao: '2.7 milhões', destaque: '4ª maior cidade do Brasil, maior mercado do Norte/Nordeste.' },
    'pr/curitiba': { nome: 'Curitiba', populacao: '1.9 milhão', destaque: 'Capital da inovação, polo tecnológico.' },
    'pr/londrina': { nome: 'Londrina', populacao: '588 mil', destaque: 'Segunda maior cidade do PR, polo de saúde e educação.' },
    'pr/maringa': { nome: 'Maringá', populacao: '436 mil', destaque: 'Terceira maior cidade do PR, referência em qualidade de vida.' },
    'rs/porto-alegre': { nome: 'Porto Alegre', populacao: '1.5 milhão', destaque: 'Capital do RS, maior centro econômico do Sul.' },
    'sc/florianopolis': { nome: 'Florianópolis', populacao: '508 mil', destaque: 'Capital da inovação, maior polo de tecnologia do Sul.' },
    'sc/joinville': { nome: 'Joinville', populacao: '604 mil', destaque: 'Maior cidade de SC, polo industrial metalmecânico e têxtil.' },
    'pe/recife': { nome: 'Recife', populacao: '1.7 milhão', destaque: 'Capital de PE, Porto Digital.' },
    'pe/jaboatao-dos-guararapes': { nome: 'Jaboatão dos Guararapes', populacao: '706 mil', destaque: '2ª maior cidade de PE, polo industrial do Grande Recife.' },
    'go/goiania': { nome: 'Goiânia', populacao: '1.6 milhão', destaque: 'Capital de Goiás, polo regional de saúde e comércio.' },
    'pa/belem': { nome: 'Belém', populacao: '1.5 milhão', destaque: 'Maior mercado da região Norte.' },
    'pa/ananindeua': { nome: 'Ananindeua', populacao: '535 mil', destaque: '2ª maior cidade do PA, parte vital da Grande Belém.' },
    'ma/sao-luis': { nome: 'São Luís', populacao: '1.1 milhão', destaque: 'Capital do Maranhão, centro econômico e turístico.' },
    'am/manaus': { nome: 'Manaus', populacao: '2.3 milhões', destaque: 'Maior cidade da região Norte, Zona Franca.' },
    'es/vitoria': { nome: 'Vitória', populacao: '369 mil', destaque: 'Capital do ES, maior porto do Brasil.' },
    'es/cariacica': { nome: 'Cariacica', populacao: '384 mil', destaque: 'Importante polo industrial e comercial da Grande Vitória.' },
    'df/brasilia': { nome: 'Brasília', populacao: '2.8 milhões', destaque: 'Maior renda per capita do Brasil.' },
    'rn/natal': { nome: 'Natal', populacao: '896 mil', destaque: 'Capital do RN, principal destino turístico do Nordeste.' },
    'pb/joao-pessoa': { nome: 'João Pessoa', populacao: '826 mil', destaque: 'Capital da Paraíba, cidade que mais cresce no Nordeste.' },
    'pi/teresina': { nome: 'Teresina', populacao: '871 mil', destaque: 'Capital do Piauí, centro econômico do estado.' },
    'al/maceio': { nome: 'Maceió', populacao: '1 milhão', destaque: 'Capital de Alagoas, principal destino turístico do Nordeste.' },
    'se/aracaju': { nome: 'Aracaju', populacao: '602 mil', destaque: 'Capital com melhor qualidade de vida do Nordeste.' },
    'ro/porto-velho': { nome: 'Porto Velho', populacao: '548 mil', destaque: 'Capital de Rondônia, centro econômico do estado.' },
    'ac/rio-branco': { nome: 'Rio Branco', populacao: '419 mil', destaque: 'Capital do Acre, centro econômico do estado.' },
    'rr/boa-vista': { nome: 'Boa Vista', populacao: '419 mil', destaque: 'Última fronteira econômica do Brasil.' },
    'ap/macapa': { nome: 'Macapá', populacao: '503 mil', destaque: 'Capital do Amapá, centro econômico da região norte.' },
    'to/palmas': { nome: 'Palmas', populacao: '306 mil', destaque: 'Capital de Tocantins, última capital planejada do Brasil.' },
    'mt/cuiaba': { nome: 'Cuiabá', populacao: '651 mil', destaque: 'Capital do agronegócio brasileiro.' },
    'ms/campo-grande': { nome: 'Campo Grande', populacao: '906 mil', destaque: 'Capital de MS, centro regional de comércio e serviços.' },
};

export const stateRenderer = (uf) => {
    const st = stateData[uf];
    if (!st) return null;
    return renderHtml({
        title: `Disparo em Massa WhatsApp em ${st.nome} | API Oficial | Plug & Sales`,
        description: `Empresa de disparo em massa no WhatsApp em ${st.nome}. ${st.descricao_curta} API Oficial da Meta sem risco de bloqueio. Ative em 24h.`,
        canonical: `${SITE_URL}/servicos/disparo-em-massa-whatsapp/${uf}`,
        keywords: `disparo em massa whatsapp ${uf}, disparo whatsapp ${st.nome}, disparo em massa ${st.nome}, api oficial whatsapp ${st.nome}, empresa de disparo whatsapp ${st.nome}`,
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Disparo em Massa WhatsApp", "item": `${SITE_URL}/servicos/disparo-em-massa-whatsapp` },
                { "@type": "ListItem", "position": 3, "name": `Disparo em ${st.nome}`, "item": `${SITE_URL}/servicos/disparo-em-massa-whatsapp/${uf}` }
            ]},
            { "@context": "https://schema.org", "@type": "Service", "name": `Disparo em Massa WhatsApp em ${st.nome}`, "description": `Serviço de disparo em massa no WhatsApp via API Oficial da Meta para empresas em ${st.nome}.`, "provider": { "@type": "Organization", "name": "Plug & Sales" }, "areaServed": { "@type": "State", "name": st.nome } },
            { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
                { "@type": "Question", "name": `Como fazer disparo em massa no WhatsApp em ${st.nome}?`, "acceptedAnswer": { "@type": "Answer", "text": `Com a Plug & Sales, você ativa sua estrutura de disparo em massa em ${st.nome} em até 24h. Utilizamos a API Oficial da Meta (WABA), sem risco de bloqueio.` } },
                { "@type": "Question", "name": `Qual a melhor empresa de disparo WhatsApp em ${st.nome}?`, "acceptedAnswer": { "@type": "Answer", "text": `A Plug & Sales é a melhor opção para disparo em massa em ${st.nome}. Infraestrutura homologada pela Meta, templates multimídia e relatórios em tempo real.` } }
            ]}
        ],
        content: `
            <div class="ssr-badge">DISPARO EM MASSA EM ${st.nome.toUpperCase()}</div>
            <h1 class="ssr-title">Disparo em Massa no WhatsApp em ${st.nome}</h1>
            <p class="ssr-subtitle">Sua empresa em ${st.nome} merece uma estrutura profissional de disparo em massa no WhatsApp. ${st.descricao_curta} API Oficial da Meta sem risco de bloqueio. Ative em 24h.</p>
            <a href="/lead-flow" class="ssr-cta">ATIVAR EM ${st.nome.toUpperCase()} AGORA</a>
            <div class="ssr-section" style="margin-top: 80px;">
                <h2>Disparo em Massa WhatsApp em ${st.nome}</h2>
                <p>${st.nome} é um mercado estratégico para disparo em massa no WhatsApp. Com ${st.populacao} de habitantes, o estado oferece um mercado consumidor significativo para empresas que querem escalar suas comunicações via WhatsApp. A Plug & Sales oferece a infraestrutura mais completa de disparo via API Oficial da Meta, com ativação em 24h e planos a partir de R$ 97.</p>
                <p>Diferente de ferramentas não-oficiais que violam os Termos de Serviço do WhatsApp e podem causar bloqueio permanente do número, a API Oficial da Meta (WABA) é 100% homologada e segura. Sua operação em ${st.nome} fica protegida.</p>
            </div>
            <div class="ssr-section">
                <h2>Benefícios para empresas em ${st.nome}</h2>
                <ul>
                    <li>Zero risco de bloqueio — API Oficial homologada pela Meta</li>
                    <li>Milhares de mensagens por dia — sem limites artificiais</li>
                    <li>Templates multimídia com botões — imagem, vídeo, áudio</li>
                    <li>Relatórios em tempo real — entregas, aberturas e cliques</li>
                    <li>Ativação em 24h — sem BM própria ou configuração técnica</li>
                    <li>Planos a partir de R$ 97 — PC-10 Foundation Card</li>
                </ul>
            </div>
            <div class="ssr-section">
                <h2>Capital: ${st.capital}</h2>
                <p>${st.capital} é a capital de ${st.nome} e o principal centro econômico do estado. Empresas em ${st.capital} que utilizam disparo em massa no WhatsApp via API Oficial se destacam da concorrência local.</p>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">ATIVAR EM ${st.nome.toUpperCase()} AGORA</a>
            </div>
        `
    });
};

export const cityRenderer = (uf, cidadeSlug) => {
    const st = stateData[uf];
    const key = `${uf}/${cidadeSlug}`;
    const ct = cityData[key];
    if (!st || !ct) return null;
    return renderHtml({
        title: `Disparo em Massa WhatsApp em ${ct.nome} - ${st.nome} | API Oficial | Plug & Sales`,
        description: `Empresa de disparo em massa no WhatsApp em ${ct.nome}, ${st.nome}. ${ct.destaque} API Oficial da Meta sem risco de bloqueio. Ative sua estrutura em 24h.`,
        canonical: `${SITE_URL}/servicos/disparo-em-massa-whatsapp/${uf}/${cidadeSlug}`,
        keywords: `disparo em massa whatsapp ${ct.nome.toLowerCase()}, disparo whatsapp ${ct.nome.toLowerCase()}, disparo em massa ${ct.nome.toLowerCase()}, enviar mensagem em massa ${ct.nome.toLowerCase()}, disparo em massa ${ct.nome.toLowerCase()} ${st.sigla.toLowerCase()}`,
        schema: [
            { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Disparo em Massa WhatsApp", "item": `${SITE_URL}/servicos/disparo-em-massa-whatsapp` },
                { "@type": "ListItem", "position": 3, "name": `Disparo em ${st.nome}`, "item": `${SITE_URL}/servicos/disparo-em-massa-whatsapp/${uf}` },
                { "@type": "ListItem", "position": 4, "name": `Disparo em ${ct.nome}`, "item": `${SITE_URL}/servicos/disparo-em-massa-whatsapp/${uf}/${cidadeSlug}` }
            ]},
            { "@context": "https://schema.org", "@type": "Service", "name": `Disparo em Massa WhatsApp em ${ct.nome}`, "description": `Serviço de disparo em massa no WhatsApp via API Oficial da Meta para empresas em ${ct.nome}, ${st.nome}.`, "provider": { "@type": "Organization", "name": "Plug & Sales" }, "areaServed": { "@type": "City", "name": ct.nome } },
            { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
                { "@type": "Question", "name": `Como fazer disparo em massa no WhatsApp em ${ct.nome}?`, "acceptedAnswer": { "@type": "Answer", "text": `Com a Plug & Sales, você ativa sua estrutura de disparo em massa em ${ct.nome} em até 24h. Utilizamos a API Oficial da Meta (WABA), sem risco de bloqueio.` } },
                { "@type": "Question", "name": `Qual o valor do disparo em massa em ${ct.nome}?`, "acceptedAnswer": { "@type": "Answer", "text": `Os planos começam em R$ 97 para 10 mil disparos (PC-10 Foundation Card). Pré-pago, sem surpresas.` } }
            ]}
        ],
        content: `
            <div class="ssr-badge">DISPARO EM MASSA EM ${ct.nome.toUpperCase()}</div>
            <h1 class="ssr-title">Disparo em Massa no WhatsApp em ${ct.nome} - ${st.nome}</h1>
            <p class="ssr-subtitle">Sua empresa em ${ct.nome}, ${st.nome}, merece uma estrutura profissional de disparo em massa no WhatsApp. Ative a API Oficial da Meta em 24h.</p>
            <a href="/lead-flow" class="ssr-cta">ATIVAR EM ${ct.nome.toUpperCase()} AGORA</a>
            <div class="ssr-section" style="margin-top: 80px;">
                <h2>Sobre ${ct.nome}</h2>
                <p>${ct.destaque} Com mais de ${ct.populacao} de habitantes, ${ct.nome} oferece um mercado consumidor significativo para empresas que querem escalar suas comunicações via WhatsApp.</p>
                <p>A Plug & Sales oferece infraestrutura de disparo em massa no WhatsApp via API Oficial da Meta para empresas em ${ct.nome}. Com ativação em 24h, sua empresa começa a enviar milhares de mensagens por dia sem risco de bloqueio.</p>
            </div>
            <div class="ssr-section">
                <h2>Por que escolher a Plug & Sales em ${ct.nome}?</h2>
                <ul>
                    <li>API Oficial da Meta (WABA) — zero risco de bloqueio</li>
                    <li>Ativação em 24h — sem configuração técnica</li>
                    <li>Planos a partir de R$ 97 — 10 mil disparos</li>
                    <li>Templates multimídia com botões</li>
                    <li>Relatórios em tempo real</li>
                    <li>Suporte dedicado em português</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">ATIVAR EM ${ct.nome.toUpperCase()} AGORA</a>
            </div>
        `
    });
};

const renderers = {
    home: homeRenderer,
    about: aboutRenderer,
    blog: blogRenderer,
    blogPost: blogPostRenderer,
    servicoDisparo: servicoDisparoRenderer,
    stateRenderer: stateRenderer,
    cityRenderer: cityRenderer,
    servicoApiOficial: servicoApiOficialRenderer,
    servicoChatbot: servicoChatbotRenderer,
    presentations: presentationsRenderer,
    guiaDisparoMassa: guiaDisparoMassaRenderer,
    guiaEscolherBSP: guiaEscolherBSPRenderer,
    guiaEstrategiasConversao: guiaEstrategiasConversaoRenderer,
    comoEnviarMensagemEmMassa: comoEnviarMensagemEmMassaRenderer,
    disparoAutomaticoWhatsApp: disparoAutomaticoWhatsAppRenderer,
    precos: precosRenderer,
    comparacaoApiOficial: comparacaoApiOficialRenderer,
    disparoGratuitoVsApiOficial: disparoGratuitoVsApiOficialRenderer,
    paraEcommerce: paraEcommerceRenderer,
    paraImobiliarias: paraImobiliariasRenderer,
    paraEducacao: paraEducacaoRenderer,
    busca: buscaRenderer,
};

export default renderers;
