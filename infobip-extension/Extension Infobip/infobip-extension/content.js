// ============================================================
// Infobip Report Automator - Content Script (injetado na aba)
// 1) Lê a página e verifica se PENDENTES está zerado (= 0)
// 2) Se = 0, tira screenshot da página inteira
// 3) Clica em "Obter relatório" e confirma o popup
// Mostra um painel de progresso no canto da própria página.
// ============================================================

(() => {
  if (window.__ibAutoStarted) return;
  window.__ibAutoStarted = true;

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  // ---------- Painel de progresso na página ----------
  function createUI() {
    if (document.getElementById('ib-ui-box')) return document.getElementById('ib-ui-box');
    const box = document.createElement('div');
    box.id = 'ib-ui-box';
    box.style.cssText =
      'position:fixed;bottom:16px;right:16px;z-index:999999;max-width:300px;' +
      'background:rgba(20,24,33,.95);color:#fff;padding:10px 12px;border-radius:8px;' +
      'font:12px/1.5 sans-serif;box-shadow:0 2px 12px rgba(0,0,0,.4);';
    box.innerHTML =
      '<div style="font-weight:700;margin-bottom:4px">Infobip Automator</div>' +
      '<div id="ib-ui-msg">Iniciando...</div>';
    document.documentElement.appendChild(box);
    return box;
  }

  function setUI(text) {
    try {
      const box = createUI();
      const msg = document.getElementById('ib-ui-msg');
      if (msg) msg.textContent = text;
    } catch (e) {}
  }

  function log(text) {
    console.log('[Infobip]', text);
    setUI(text);
    try { chrome.runtime.sendMessage({ action: 'log', text }).catch(() => {}); } catch (e) {}
  }

  function sendMsg(message, timeoutMs = 15000) {
    return new Promise(resolve => {
      let settled = false;
      const done = val => { if (!settled) { settled = true; resolve(val); } };
      try {
        chrome.runtime.sendMessage(message, resp => {
          if (chrome.runtime.lastError) { done(null); return; }
          done(resp);
        });
      } catch (e) {
        done(null);
      }
      setTimeout(() => done(null), timeoutMs);
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

  // ---------- Leitura de Pendentes ----------
  function numberNearLabel(t) {
    let m = t.match(/pendente[s]?[^\d]{0,25}?\(?\s*(\d+)/i);
    if (m) return parseInt(m[1], 10);
    m = t.match(/\(?\s*(\d+)\s*\)?[^\d]{0,15}pendente[s]?/i);
    if (m) return parseInt(m[1], 10);
    return null;
  }

  function readPendentes() {
    const labelRe = /pendente|pending/i;

    // 1) elementos cujo texto contém "pendente/pending"
    const matches = [];
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      if (el.children.length > 5) continue; // ignora containers gigantes
      const t = (el.innerText || '').trim();
      if (!t || !labelRe.test(t)) continue;
      matches.push({ el, t, len: t.length });
    }
    matches.sort((a, b) => a.len - b.len);

    for (const m of matches) {
      const n = numberNearLabel(m.t);
      if (n !== null) return n;
    }

    // 2) label separado do número (ex.: <span>Pendentes</span><span>0</span>)
    for (const el of Array.from(document.querySelectorAll('span, div, td, li, strong, b, badge'))) {
      const txt = (el.innerText || '').trim();
      if (!/^\d+$/.test(txt)) continue;
      const parent = el.parentElement;
      if (parent && labelRe.test(parent.innerText || '')) return parseInt(txt, 10);
    }

    // 3) fallback por atributos/classe contendo "pendent"
    const byAttr = Array.from(document.querySelectorAll(
      '[class*="pendent" i], [id*="pendent" i], [title*="pendent" i], [aria-label*="pendent" i], [data-tag*="pendent" i]'
    ));
    for (const el of byAttr) {
      const n = numberNearLabel(el.innerText || '');
      if (n !== null) return n;
      const m = (el.innerText || '').match(/(\d+)/);
      if (m) return parseInt(m[1], 10);
      const at = (el.getAttribute('title') || '') + ' ' + (el.getAttribute('aria-label') || '');
      const m2 = at.match(/(\d+)/);
      if (m2) return parseInt(m2[1], 10);
    }

    return null;
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
        setUI(`Capturando tela... (${i + 1}/${steps})`);
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
    setUI('Carregando script...');

    // Descobre se está em modo teste (execução de URL única do botão "Testar")
    let isTest = false;
    const r = await sendMsg({ action: 'get_test_mode' });
    isTest = !!(r && r.testMode);

    log(`Iniciando automação da página: ${pageName}${isTest ? ' (TESTE)' : ''}`);

    // 1) Espera a página carregar (botão + status de pendentes)
    for (let i = 0; i < 60; i++) {
      const hasBtn = !!findButtonByText('Obter relatório');
      const hasPend = readPendentes() !== null;
      setUI(`Aguardando carregamento... (${i + 1}s) Botão: ${hasBtn ? 'sim' : 'não'} | Pendentes: ${hasPend ? 'ok' : '...'}`);
      if (hasBtn && hasPend) break;
      await wait(1000);
    }

    const btnObter = findButtonByText('Obter relatório');
    if (!btnObter) {
      log('Botão "Obter relatório" não encontrado. Pulando.');
      await sendMsg({ action: 'report_skipped', name: pageName, count: '?' });
      await sendMsg({ action: 'close_tab_and_next' });
      setTimeout(() => setUI('Concluído: botão não encontrado.'), 1500);
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
      setTimeout(() => setUI('Concluído: leitura de pendentes.'), 1500);
      return;
    }

    // 3) Pendentes zerados -> tira screenshot da página inteira
    log('Pendentes = 0. Capturando screenshot...');
    const dataUrl = await captureFullPage();
    if (dataUrl) {
      log('Enviando screenshot para download...');
      const r2 = await sendMsg({ action: 'save_screenshot', dataUrl, name: pageName });
      void r2;
    } else {
      log('Falha ao capturar screenshot, seguindo para o relatório.');
    }

    // 4) Clica em "Obter relatório"
    log('Clicando em "Obter relatório"...');
    setUI('Clicando em "Obter relatório"...');
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
    setUI('Finalizando...');
    await sendMsg({ action: 'close_tab_and_next' });
  }

  run();
})();