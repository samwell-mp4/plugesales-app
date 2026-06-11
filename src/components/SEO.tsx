import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    schema?: any;
    noindex?: boolean;
    keywords?: string;
}

const DEFAULT_OG_IMAGE = 'https://plugesales.com/logo-supreme.png';

const SEO = ({ 
    title, 
    description, 
    canonical, 
    ogImage = DEFAULT_OG_IMAGE, 
    ogType = 'website',
    schema,
    noindex,
    keywords
}: SEOProps) => {
    const siteTitle = 'Plug & Sales | Disparo em Massa WhatsApp';
    const fullTitle = title.includes('|') ? title : `${title} | ${siteTitle}`;

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            {canonical && <link rel="canonical" href={canonical} />}
            {canonical && <link rel="alternate" hrefLang="pt-BR" href={canonical} />}
            {canonical && <link rel="alternate" hrefLang="x-default" href={canonical} />}
            {noindex && <meta name="robots" content="noindex, follow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content="Plug & Sales" />
            <meta property="og:locale" content="pt_BR" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Schema.org JSON-LD */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
