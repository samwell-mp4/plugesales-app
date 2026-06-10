const CRAWLER_REGEX = /googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|twitterbot|whatsapp|facebot|telegrambot|slackbot|discordbot|pinterest|applebot|semrush|ahrefs|dotbot/i;

export const isCrawler = (userAgent) => {
    if (!userAgent) return false;
    return CRAWLER_REGEX.test(userAgent);
};

export const crawlerMiddleware = (req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    if (CRAWLER_REGEX.test(ua)) {
        req.isCrawler = true;
    }
    next();
};

export const SEO_PATHS = [
    { path: '/', renderer: 'home' },
    { path: '/sobre', renderer: 'about' },
    { path: '/apresentacoes', renderer: 'presentations' },
    { path: '/blog', renderer: 'blog' },
    { path: '/servicos/disparo-em-massa-whatsapp', renderer: 'servicoDisparo' },
    { path: '/servicos/api-oficial-whatsapp', renderer: 'servicoApiOficial' },
];
