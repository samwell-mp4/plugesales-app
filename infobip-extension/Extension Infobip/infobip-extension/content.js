// ============================================================
// Infobip Report Automator - Content Script (injetado na aba)
// 1) Lê a página e verifica se PENDENTES está zerado (= 0)
// 2) Se = 0, tira screenshot da página inteira
// 3) Clica em "Obter relatório" e confirma o popup
// ============================================================

(() => {
  if (window.__ibAutoStarted) return;
  window.__ibAutoStarted = true;

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  function log(text) {
    try { chrome.runtime.sendMessage({ action: 'log', text }).catch(() => {}); } catch (e) {}
  }

  function sendMsg(message) {
    return new Promise(resolve => {
      try {
        chrome.runtime.sendMessage(message, resp => resolve(resp));
      } catch (e) {
        resolve(null);
      }
    });
  }

  const pageName = (() => {
    const m = location.pathname.match(/\/([^/]+)\/?$/);
    return m ? decodeURIComponent(m[1]) : 'relatorio';
  })();

  function findButtonByText(textPartial) {
    const search = textPartial.toLowerCase();
    const els = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    return els.find(el => {
      const txt = (el.innerText || '').toLowerCase();
      const attr = (el.getAttribute('text') || '').toLowerCase();
      const aria = (el.getAttribute('aria-label') || '').toLowerCase();
      const title = (el.getAttribute('title') || '').toLowerCase();
      return txt.includes(search) || attr.includes(search) || aria.includes(search) || title.includes(search);
    });
  }

  function readPendentes() {
    const matches = [];
    const els = Array.from(document.querySelectorAll('body *'));
    for (const el of els) {
      const t = (el.innerText || '').trim();
      if (!t || !/pendent/i.test(t)) continue;
      matches.push({ el, t, len: t.length });
    }

    // os elementos mais específicos (menor texto) primeiro
    matches.sort((a, b) => a.len - b.len);

    for (const m of matches) {
      const t = m.t;
      let mm = t.match(/pendente[s]?[^\d]*\(?\s*(\d+)/i);
      if (mm) return parseInt(mm[1], 10);
      mm = t.match(/\(?\s*(\d+)\s*\)?[^\d]{0,15}pendente[s]?/i);
      if (mm) return parseInt(mm[1], 10);
    }

    // fallback: elementos cujos atributos/filtros contenham "pendent"
    const byAttr = Array.from(document.querySelectorAll(
      '[class*="pendent" i], [id*="pendent" i], [title*="pendent" i], [aria-label*="pendent" i], [data-tag*="pendent" i]'
    ));
    for (const el of byAttr) {
      const txt = (el.innerText || '').trim();
      let mm = txt.match(/(\d+)/);
      if (mm) return parseInt(mm[1], 10);
    }

    return null; // não conseguiu detectar
  }

  async function readPendentesWithRetry(maxSeconds) {
    for (let i = 0; i < maxSeconds; i++) {
      const count = readPendentes();
      if (count !== null) return count;
      await wait(1000);
    }
    return null;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function captureFullPage() {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const winH = Math.max(window.innerHeight, 1);
    const docH = Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0
    );
    const steps = Math.max(1, Math.ceil(docH / winH));

    try {
      const images = [];
      for (let i = 0; i < steps; i++) {
        window.scrollTo(0, i * winH);
        await wait(500);
        const resp = await sendMsg({ action: 'capture_viewport' });
        if (!resp || !resp.ok || !resp.dataUrl) throw new Error('captura do viewport falhou');
        images.push(await loadImage(resp.dataUrl));
      }

      const totalH = images.reduce((sum, img) => sum + img.height, 0);
      const canvas = document.createElement('canvas');
      canvas.width = images[0].width;
      canvas.height = totalH;
      const ctx = canvas.getContext('2d');
      let y = 0;
      for (const img of images) {
        ctx.drawImage(img, 0, y);
        y += img.height;
      }
      return canvas.toDataURL('image/png');
    } catch (e) {
      log('Erro na captura da tela: ' + e);
      return null;
    } finally {
      window.scrollTo(scrollX, scrollY);
    }
  }

  async function run() {
    // Descobre se está em modo teste (execução de URL única do botão "Testar")
    let isTest = false;
    try {
      const r = await sendMsg({ action: 'get_test_mode' });
      isTest = !!(r && r.testMode);
    } catch (e) {}

    log(`Iniciando automação da página: ${pageName}${isTest ? ' (TESTE)' : ''}`);

    // 1) Espera a página carregar (botão + status de pendentes)
    let ready = false;
    for (let i = 0; i < 60; i++) {
      const hasBtn = !!findButtonByText('Obter relatório');
      const hasPend = readPendentes() !== null;
      if (hasBtn && hasPend) { ready = true; break; }
      await wait(1000);
    }

    const btnObter = findButtonByText('Obter relatório');
    if (!btnObter) {
      log('Botão "Obter relatório" não encontrado. Pulando.');
      await sendMsg({ action: 'report_skipped', name: pageName, count: '?' });
      await sendMsg({ action: 'close_tab_and_next' });
      return;
    }

    // 2) Verifica se Pendentes = 0
    const pendentes = await readPendentesWithRetry(30);
    log(`Pendentes = ${pendentes === null ? 'não detectado' : pendentes}`);

    if (pendentes === null || pendentes !== 0) {
      log(`Pendentes = ${pendentes ?? '?'} (diferente de 0). Não vou gerar o relatório.`);

      // No modo teste, mesmo assim tira o print para validar a captura
      if (isTest) {
        log('Modo TESTE: capturando screenshot mesmo assim.');
        const dataUrl = await captureFullPage();
        if (dataUrl) {
          await sendMsg({ action: 'save_screenshot', dataUrl, name: pageName + '_TESTE' });
        } else {
          log('Falha ao capturar screenshot.');
        }
      }

      await sendMsg({ action: 'report_skipped', name: pageName, count: pendentes === null ? '?' : pendentes });
      await sendMsg({ action: 'close_tab_and_next' });
      return;
    }

    // 3) Pendentes zerados -> tira screenshot da página inteira
    log('Pendentes = 0. Capturando screenshot...');
    const dataUrl = await captureFullPage();
    if (dataUrl) {
      log('Enviando screenshot para download...');
      await sendMsg({ action: 'save_screenshot', dataUrl, name: pageName });
    } else {
      log('Falha ao capturar screenshot, seguindo para o relatório.');
    }

    // 4) Clica em "Obter relatório"
    log('Clicando em "Obter relatório"...');
    btnObter.click();
    await wait(1500);

    // 5) Confirma o popup
    let btnConfirmar = null;
    for (let i = 0; i < 20; i++) {
      btnConfirmar =
        findButtonByText('Gerar') ||
        findButtonByText('Exportar') ||
        findButtonByText('Baixar') ||
        findButtonByText('Confirmar') ||
        findButtonByText('Cancelar');
      if (btnConfirmar && btnConfirmar.offsetParent !== null) break;
      await wait(1000);
    }

    if (btnConfirmar) {
      await wait(1000);
      const label = (btnConfirmar.innerText || btnConfirmar.getAttribute('aria-label') || '').trim();
      log(`Confirmando popup: "${label}".`);
      btnConfirmar.click();
    } else {
      log('Popup de confirmação não encontrado.');
    }

    await wait(5000);
    log('Concluído, fechando aba.');
    await sendMsg({ action: 'close_tab_and_next' });
  }

  run();
})();