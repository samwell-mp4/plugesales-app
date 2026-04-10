import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Componente que gerencia o Meta Pixel condicionalmente para o Ricardo Willer
 */
const MetaPixel = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Condições: landing/1 OU lead-flow com agent=Ricardo+Willer
    const agent = searchParams.get('agent');
    
    // Normaliza o nome do agente (pode vir com '+' ou espaço dependendo do tratamento da URL)
    const normalizedAgent = agent?.replace(/\+/g, ' ') || '';
    const isRicardoLanding = location.pathname === '/landing/1';
    const isRicardoLeadFlow = location.pathname === '/lead-flow' && normalizedAgent === 'Ricardo Willer';
    const isRicardoThankYou = location.pathname === '/obrigado/1';

    const shouldTrack = isRicardoLanding || isRicardoLeadFlow || isRicardoThankYou;

    if (shouldTrack) {
      console.log("Meta Pixel: Condição atendida para Ricardo Willer. Inicializando/Rastreando...");
      
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

        window.fbq('init', '695128547016451');
      }

      // Dispara o PageView
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
        
        // Dispara o evento de Lead apenas na página de obrigado
        if (isRicardoThankYou) {
          window.fbq('track', 'Lead');
          console.log("Meta Pixel: Tracked Lead event for Ricardo Willer (Obrigado Page Load)");
        }
      }
    }
  }, [location.pathname, searchParams]);

  return null; // Este componente não renderiza nada visualmente
};

export default MetaPixel;
