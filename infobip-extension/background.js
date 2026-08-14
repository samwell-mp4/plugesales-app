// ============================================================
// Infobip Report Automator - Background Service Worker
// Recebe links salvos no popup, roda via timer (a cada 2 horas)
// ou manualmente. Abre cada link, verifica Pendentes = 0,
// tira screenshot da página inteira e clica em "Obter relatório".
// ============================================================

const STORAGE_KEY = 'infobip_links';
const ALARM_NAME = 'every2h';

let processing = false;
let keepAliveId = null;

// ---------- helpers de estado (storage.session sobrevive ao encerramento do SW) ----------

function sGet(key, def) {
  return new Promise(resolve => {
    chrome.storage.session.get(key, d => resolve(d[key] !== undefined ? d[key] : def));
  });
}

function sSet(key, val) {
  return chrome.storage.session.set({ [key]: val });
}

function log(text) {
  console.log('[Infobip]', text);
  try {
    const entry = `${new Date().toLocaleTimeString()} - ${text}`;
    chrome.storage.local.get({ ib_status: 'Nenhuma execução ainda.', ib_logs: [] }, d => {
      const logs = (d.ib_logs || []).concat(entry).slice(-30);
      chrome.storage.local.set({ ib_status: entry, ib_logs: logs });
    });
  } catch (e) {}
  try {
    chrome.runtime.sendMessage({ action: 'log', text }).catch(() => {});
  } catch (e) {}
}

function showNotify(message) {
  try {
    chrome.notifications.create('ib-notify', {
      type: 'basic',
      title: 'Infobip Automator',
      message
    });
  } catch (e) {
    log(message);
  }
}

function getQueue() {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEY, data => resolve(data[STORAGE_KEY] || []));
  });
}

function setQueue(queue) {
  return new Promise(resolve => chrome.storage.local.set({ [STORAGE_KEY]: queue }, resolve));
}

function getAlarm(name) {
  return new Promise(resolve => chrome.alarms.get(name, a => resolve(a || null)));
}

function safeName(s) {
  const clean = String(s || '').replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').slice(0, 60);
  return clean || 'relatorio';
}

function timestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

// Mantém o service worker acordado enquanto houver processamento
function startKeepAlive() {
  stopKeepAlive();
  keepAliveId = setInterval(async () => {
    try { await chrome.runtime.getPlatformInfo(); } catch (e) {}
  }, 15000);
}

function stopKeepAlive() {
  if (keepAliveId) {
    clearInterval(keepAliveId);
    keepAliveId = null;
  }
}

// ---------------- Timer ----------------

function ensureTimer() {
  chrome.alarms.get(ALARM_NAME, alarm => {
    if (!alarm) {
      chrome.alarms.create(ALARM_NAME, { delayInMinutes: 120, periodInMinutes: 120 });
    }
  });
}

chrome.runtime.onInstalled.addListener(ensureTimer);
chrome.runtime.onStartup.addListener(ensureTimer);

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === ALARM_NAME) {
    log('Timer de 2h disparado. Iniciando processamento.');
    startProcessing('timer');
  }
});

// ---------------- Fila de processamento ----------------

async function startProcessing(source) {
  const busy = await sGet('processing', false);
  if (busy) {
    log('Já existe um processamento em andamento.');
    return;
  }
  await sSet('processing', true);
  processing = true;

  const links = await getQueue();
  if (!links.length) {
    await sSet('processing', false);
    processing = false;
    log('Nenhum link salvo para processar.');
    showNotify('Nenhum link salvo. Cole os links no popup e clique em Salvar.');
    return;
  }

  startKeepAlive();
  log(`Iniciando processamento (${source}). ${links.length} link(s) na fila.`);
  showNotify(`Iniciando processamento de ${links.length} link(s)...`);
  processNext();
}

async function openTabAndInject(url, name, isTest) {
  // Em modo teste, marca a URL para o content.js saber (sem depender de estado)
  let finalUrl = url;
  if (isTest) {
    finalUrl = url.split('#')[0] + '#ibtest';
  }

  let tab;
  try {
    tab = await chrome.tabs.create({ url: finalUrl, active: true });
  } catch (e) {
    log('Falha ao abrir aba: ' + e);
    return false;
  }

  await waitForTabLoad(tab.id, 45000);

  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    log('Script injetado na página.');
    return true;
  } catch (e) {
    log('Falha ao injetar script: ' + e);
    showNotify('Falha ao injetar o script na página: ' + String(e).slice(0, 120));
    try { await chrome.tabs.remove(tab.id); } catch (_) {}
    return false;
  }
}

// Polling com chamadas de API em voo mantém o service worker vivo
async function waitForTabLoad(tabId, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab && tab.status === 'complete') return true;
    } catch (e) {
      return false;
    }
    await new Promise(r => setTimeout(r, 1200));
  }
  return false;
}

function processNext() {
  getQueue().then(async queue => {
    if (!queue.length) {
      await sSet('processing', false);
      processing = false;
      stopKeepAlive();
      log('Todos os links foram processados.');
      showNotify('Processamento concluído!');
      return;
    }

    const item = queue.shift();
    await setQueue(queue);
    log(`Processando: ${item.name} (restam ${queue.length})`);

    const ok = await openTabAndInject(item.url, item.name, false);
    if (!ok) processNext();
  });
}

// ---------------- Mensagens ----------------

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {

        case 'save_links': {
          const links = request.links || [];
          await setQueue(links);
          ensureTimer();
          log(`${links.length} link(s) salvos.`);
          sendResponse({ ok: true, count: links.length });
          return;
        }

        case 'get_links': {
          const links = await getQueue();
          const alarm = await getAlarm(ALARM_NAME);
          const local = await new Promise(res =>
            chrome.storage.local.get(['ib_status', 'ib_logs'], res)
          );
          sendResponse({
            ok: true,
            links,
            timerOn: !!alarm,
            nextRun: alarm ? new Date(alarm.scheduledTime).toLocaleString() : null,
            lastStatus: local.ib_status || null,
            logs: local.ib_logs || []
          });
          return;
        }

        case 'run_now': {
          sendResponse({ ok: true });
          startProcessing('manual');
          return;
        }

        // Executa o fluxo completo em UM único link (modo teste)
        case 'run_test': {
          const testUrl = request.url;
          if (!testUrl || !/^https?:\/\//i.test(testUrl)) {
            sendResponse({ ok: false, error: 'URL inválida para o teste' });
            return;
          }
          // Limpa qualquer processamento antigo que tenha ficado pendurado
          await sSet('processing', false);
          await sSet('test_mode', true);
          processing = true;
          startKeepAlive();
          log(`=== MODO TESTE === ${testUrl}`);
          showNotify('Iniciando teste do link...');

          const ok = await openTabAndInject(testUrl, 'TESTE', true);
          if (!ok) {
            await sSet('test_mode', false);
            await sSet('processing', false);
            processing = false;
            stopKeepAlive();
            log('Falha ao iniciar o teste.');
          }
          sendResponse({ ok: true });
          return;
        }

        case 'get_test_mode': {
          const isTest = await sGet('test_mode', false);
          sendResponse({ ok: true, testMode: !!isTest });
          return;
        }

        case 'toggle_timer': {
          const alarm = await getAlarm(ALARM_NAME);
          if (alarm) {
            await chrome.alarms.clear(ALARM_NAME);
            log('Timer desativado.');
          } else {
            chrome.alarms.create(ALARM_NAME, { delayInMinutes: 0.2, periodInMinutes: 120 });
            log('Timer ativado (a cada 2 horas).');
          }
          sendResponse({ ok: true });
          return;
        }

        case 'log': {
          log(request.text || '');
          sendResponse({ ok: true });
          return;
        }

        // Captura o viewport atual da aba (chamado pelo content.js durante o scroll)
        case 'capture_viewport': {
          if (!sender.tab) {
            sendResponse({ ok: false, error: 'sem aba' });
            return;
          }
          try {
            await chrome.tabs.update(sender.tab.id, { active: true });
            await chrome.windows.update(sender.tab.windowId, { focused: true });
            let dataUrl;
            try {
              dataUrl = await chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' });
            } catch (e) {
              dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
            }
            sendResponse({ ok: true, dataUrl });
          } catch (e) {
            sendResponse({ ok: false, error: String(e) });
          }
          return;
        }

        case 'save_screenshot': {
          // O Chrome só aceita caminho RELATIVO à pasta padrão de downloads.
          // A subpasta "disparo" é criada automaticamente.
          const filename = `disparo/infobip_${safeName(request.name)}_${timestamp()}.png`;
          try {
            let blobUrl = null;
            try {
              const blob = await (await fetch(request.dataUrl)).blob();
              blobUrl = URL.createObjectURL(blob);
            } catch (e) {}
            const downloadId = await chrome.downloads.download({
              url: blobUrl || request.dataUrl,
              filename,
              saveAs: false,
              conflictAction: 'uniquify'
            });
            if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);

            // Descobre o caminho absoluto onde o arquivo realmente foi salvo
            try {
              const items = await chrome.downloads.search({ id: downloadId });
              if (items && items[0]) {
                log(`Screenshot salvo em: ${items[0].filename}`);
              } else {
                log(`Screenshot salvo: ${filename}`);
              }
            } catch (e) {
              log(`Screenshot salvo: ${filename}`);
            }
          } catch (e) {
            log('Falha ao salvar screenshot: ' + e);
          }
          sendResponse({ ok: true });
          return;
        }

        case 'report_skipped': {
          const name = request.name || '?';
          const count = request.count ?? '?';
          log(`[PULADO] ${name}: Pendentes = ${count} (diferente de 0). Relatório NÃO gerado.`);
          const isTestNow = await sGet('test_mode', false);
          if (isTestNow) {
            showNotify(`Teste: ${name} pulado (Pendentes = ${count}).`);
          }
          sendResponse({ ok: true });
          return;
        }

        case 'close_tab_and_next': {
          if (sender.tab) {
            try { await chrome.tabs.remove(sender.tab.id); } catch (e) {}
          }
          const wasTest = await sGet('test_mode', false);
          if (wasTest) {
            await sSet('test_mode', false);
            await sSet('processing', false);
            processing = false;
            stopKeepAlive();
            log('Teste concluído.');
            showNotify('Teste concluído!');
          } else {
            processNext();
          }
          sendResponse({ ok: true });
          return;
        }

        default:
          sendResponse({ ok: false, error: 'ação desconhecida' });
      }
    } catch (e) {
      log('Erro no handler: ' + e);
      sendResponse({ ok: false, error: String(e) });
    }
  })();
  return true; // resposta assíncrona
});
