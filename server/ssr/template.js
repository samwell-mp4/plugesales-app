export const renderHtml = ({ title, description, canonical, ogImage, keywords, schema, content, bodyClass = '' }) => {
    const schemaHtml = Array.isArray(schema)
        ? schema.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')
        : schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : '';

    return `<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#000000" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    ${keywords ? `<meta name="keywords" content="${keywords}" />` : ''}
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/png" href="/logo-supreme.png" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogImage || 'https://plugesales.com/logo-supreme.png'}" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="Plug & Sales" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage || 'https://plugesales.com/logo-supreme.png'}" />

    ${schemaHtml}

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #05070a; color: #fff; line-height: 1.6; }
        .ssr-container { max-width: 800px; margin: 0 auto; padding: 60px 24px; }
        .ssr-title { font-size: 2.5rem; margin-bottom: 24px; background: linear-gradient(135deg, #fff, #acf800); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ssr-subtitle { font-size: 1.2rem; color: #999; margin-bottom: 40px; }
        .ssr-section { margin-bottom: 48px; }
        .ssr-section h2 { font-size: 1.8rem; margin-bottom: 16px; color: #acf800; }
        .ssr-section p { color: #ccc; margin-bottom: 16px; font-size: 1.05rem; }
        .ssr-section ul { list-style: none; padding: 0; }
        .ssr-section ul li { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ccc; }
        .ssr-section ul li::before { content: '✓ '; color: #acf800; font-weight: bold; }
        .ssr-badge { display: inline-block; background: #acf800; color: #000; padding: 8px 16px; border-radius: 8px; font-weight: 800; font-size: 0.75rem; letter-spacing: 2px; margin-bottom: 16px; text-transform: uppercase; }
        .ssr-cta { display: inline-block; background: linear-gradient(135deg, #acf800, #8cd000); color: #000; padding: 16px 40px; border-radius: 12px; font-weight: 800; font-size: 1.1rem; text-decoration: none; margin-top: 24px; }
        .ssr-footer { text-align: center; padding: 40px; color: #555; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 60px; }
    </style>
</head>
<body class="${bodyClass}">
    <div class="ssr-container">
        ${content}
        <div class="ssr-footer">
            <p>Plug & Sales — Disparo em Massa no WhatsApp via API Oficial da Meta</p>
        </div>
    </div>
</body>
</html>`;
};
