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
        title: 'Sobre a Plug & Sales — Líder em API Oficial WhatsApp | Disparo em Massa',
        description: 'Conheça a infraestrutura por trás da Plug & Sales. Especialistas em API Oficial da Meta para disparos em massa, chatbots e escala de vendas sem bloqueios.',
        canonical: SITE_URL + '/sobre',
        keywords: 'sobre plug sales, empresa disparo whatsapp, infraestrutura waba',
        schema: [
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Plug & Sales",
                "alternateName": "Plugesales",
                "url": SITE_URL,
                "logo": SITE_URL + "/logo-supreme.png",
                "description": "Líder nacional em soluções de escala via API Oficial do WhatsApp (WABA).",
                "contactPoint": { "@type": "ContactPoint", "telephone": "+55-31-98399-4058", "contactType": "customer service", "areaServed": "BR" },
                "sameAs": ["https://www.instagram.com/plugesales", "https://www.linkedin.com/company/plugesales"]
            },
            {
                "@context": "https://schema.org", "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Início", "item": SITE_URL },
                    { "@type": "ListItem", "position": 2, "name": "Sobre Nós", "item": SITE_URL + "/sobre" }
                ]
            }
        ],
        content: `
            <div class="ssr-badge">INFRAESTRUTURA DE ELITE</div>
            <h1 class="ssr-title">Liderando a Revolução da Comunicação em Escala</h1>
            <p class="ssr-subtitle">Não somos apenas uma plataforma de disparos. Somos a arquitetura tecnológica que permite empresas escalarem de milhares para milhões de conversas com segurança absoluta e conformidade com a Meta.</p>
            
            <div class="ssr-section">
                <h2>Nossa Missão</h2>
                <p>Transformar a maneira como as empresas se conectam com seus clientes, tornando o WhatsApp o canal de vendas mais eficiente e seguro do mundo.</p>
            </div>
            
            <div class="ssr-section">
                <h2>Nossa Visão</h2>
                <p>Ser a plataforma de referência global em automação de WhatsApp API, reconhecida pela excelência tecnológica e compromisso com o sucesso do cliente.</p>
            </div>
            
            <div style="text-align: center; margin-top: 60px;">
                <a href="/lead-flow" class="ssr-cta">FALE CONOSCO</a>
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

export const presentationsRenderer = () => {
    return renderHtml({
        title: 'Apresentações Plug & Sales — Disparo em Massa WhatsApp',
        description: 'Conheça nossas apresentações institucionais sobre disparo em massa no WhatsApp via API Oficial da Meta.',
        canonical: SITE_URL + '/apresentacoes',
        content: `
            <div class="ssr-badge">MATERIAIS</div>
            <h1 class="ssr-title">Apresentações Plug & Sales</h1>
            <p class="ssr-subtitle">Materiais institucionais sobre nossa infraestrutura de disparo em massa no WhatsApp.</p>
            <p style="color: #999;">Para acessar as apresentações completas, utilize o menu de navegação do site.</p>
        `
    });
};

const renderers = {
    home: homeRenderer,
    about: aboutRenderer,
    blog: blogRenderer,
    servicoDisparo: servicoDisparoRenderer,
    servicoApiOficial: servicoApiOficialRenderer,
    presentations: presentationsRenderer,
};

export default renderers;
