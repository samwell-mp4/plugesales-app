import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Componente que gerencia o Meta Pixel condicionalmente para múltiplos agentes (Ricardo, Augusto, Thiago, etc.)
 */
const MetaPixel = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Condições: landing/1 OU lead-flow com agent=Ricardo+Willer
    const agent = searchParams.get('agent');
    const normalizedAgent = agent?.replace(/\+/g, ' ') || agent?.replace(/-/g, ' ') || '';

    // Configuração de Pixels por Agente
    const pixelConfigs = [
      { id: '1', name: 'Ricardo Willer', pixelId: '695128547016451' },
      { id: '3', name: 'Augusto Fagundes', pixelId: '1701137238002049' },
      { id: '12', name: 'Thiago Rocha', pixelId: '4283807375217824' },
      { id: '7', name: 'Samwell Souza', pixelId: '2397997580627148' }
    ];

    // Encontra se a página atual pertence a algum agente configurado
    const activeConfig = pixelConfigs.find(config => {
      const isLanding = location.pathname === `/landing/${config.id}`;
      const isThankYou = location.pathname === `/obrigado/${config.id}`;
      const isLeadFlow = location.pathname === '/lead-flow' && normalizedAgent === config.name;
      return isLanding || isThankYou || isLeadFlow;
    });

    if (activeConfig) {
      const isThankYouPage = location.pathname === `/obrigado/${activeConfig.id}`;
      console.log(`Meta Pixel: Condição atendida para ${activeConfig.name}. Inicializando/Rastreando ID: ${activeConfig.pixelId}`);
      
      // Injeção do Script do Meta Pixel (se já não existir)
      if (!window.fbq) {
        /* eslint-disable */
        // @ts-ignore
        !(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        /* eslint-enable */
      }

      // Inicializa o Pixel específico (pode ser chamado múltiplas vezes com IDs diferentes com segurança)
      window.fbq('init', activeConfig.pixelId);

      // Dispara o PageView
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
        
        // Dispara o evento de Lead apenas na página de obrigado
        if (isThankYouPage) {
          window.fbq('track', 'Lead');
          console.log(`Meta Pixel: Tracked Lead event for ${activeConfig.name} (Obrigado Page Load)`);
        }
      }
    }
  }, [location.pathname, searchParams]);

  return null; // Este componente não renderiza nada visualmente
};

export default MetaPixel;
