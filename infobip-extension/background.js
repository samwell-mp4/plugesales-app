// ============================================================
// Infobip Report Automator - Background Service Worker
// Recebe links salvos no popup, roda via timer (a cada 2 horas)
// ou manualmente. Abre cada link, verifica Pendentes = 0,
// tira screenshot da página inteira e clica em "Obter relatório".
// ============================================================

const STORAGE_KEY = 'infobip_links';
const ALARM_NAME = 'every2h';

let processing = false;
let testMode = false;

function log(text) {
  console.log('[Infobip]', text);
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
  if (processing) return;
  processing = true;
  const links = await getQueue();
  if (!links.length) {
    processing = false;
    log('Nenhum link salvo para processar.');
    showNotify('Nenhum link salvo. Cole os links no popup e clique em Salvar.');
    return;
  }
  log(`Iniciando processamento (${source}). ${links.length} link(s) na fila.`);
  showNotify(`Iniciando processamento de ${links.length} link(s)...`);
  processNext();
}

async function openTabAndInject(url, name) {
  let tab;
  try {
    tab = await chrome.tabs.create({ url, active: true });
  } catch (e) {
    log('Falha ao abrir aba: ' + e);
    return false;
  }

  await waitForTabLoad(tab.id, 45000).catch(() => {
    log('Tempo esgotado aguardando carregamento da página.');
  });

  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    return true;
  } catch (e) {
    log('Falha ao injetar script: ' + e);
    try { await chrome.tabs.remove(tab.id); } catch (_) {}
    return false;
  }
}

function processNext() {
  getQueue().then(async queue => {
    if (!queue.length) {
      processing = false;
      log('Todos os links foram processados.');
      showNotify('Processamento concluído!');
      return;
    }

    const item = queue.shift();
    await setQueue(queue);
    log(`Processando: ${item.name} (restam ${queue.length})`);

    const ok = await openTabAndInject(item.url, item.name);
    if (!ok) processNext();
  });
}

function waitForTabLoad(tabId, timeoutMs) {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = ok => {
      if (done) return;
      done = true;
      chrome.tabs.onUpdated.removeListener(listener);
      ok ? resolve() : reject(new Error('timeout'));
    };
    const listener = (id, info) => {
      if (id === tabId && info.status === 'complete') finish(true);
    };
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.get(tabId, tab => {
      if (tab && tab.status === 'complete') finish(true);
    });
    setTimeout(() => finish(false), timeoutMs);
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
          sendResponse({
            ok: true,
            links,
            timerOn: !!alarm,
            nextRun: alarm ? new Date(alarm.scheduledTime).toLocaleString() : null
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
          if (processing && !testMode) {
            log('Já existe um processamento em andamento; teste ignorado.');
            sendResponse({ ok: false, error: 'Ocupado' });
            return;
          }
          testMode = true;
          processing = true;
          log(`=== MODO TESTE === ${testUrl}`);
          showNotify('Iniciando teste do link...');
          const ok = await openTabAndInject(testUrl, 'TESTE');
          if (!ok) {
            testMode = false;
            processing = false;
          }
          sendResponse({ ok: true });
          return;
        }

        case 'get_test_mode': {
          sendResponse({ ok: true, testMode });
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
            const dataUrl = await chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' });
            sendResponse({ ok: true, dataUrl });
          } catch (e) {
            sendResponse({ ok: false, error: String(e) });
          }
          return;
        }

        case 'save_screenshot': {
          const filename = `infobip_${safeName(request.name)}_${timestamp()}.png`;
          try {
            let blobUrl = null;
            try {
              const blob = await (await fetch(request.dataUrl)).blob();
              blobUrl = URL.createObjectURL(blob);
            } catch (e) {}
            await chrome.downloads.download({
              url: blobUrl || request.dataUrl,
              filename,
              saveAs: false,
              conflictAction: 'uniquify'
            });
            if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
            log(`Screenshot salvo: ${filename}`);
          } catch (e) {
            log('Falha ao salvar screenshot: ' + e);
          }
          sendResponse({ ok: true });
          return;
        }

        case 'report_skipped': {
          log(`[PULADO] ${request.name || '?'}: Pendentes = ${request.count ?? '?'} (diferente de 0). Relatório NÃO gerado.`);
          sendResponse({ ok: true });
          return;
        }

        case 'close_tab_and_next': {
          if (sender.tab) {
            try { await chrome.tabs.remove(sender.tab.id); } catch (e) {}
          }
          if (testMode) {
            testMode = false;
            processing = false;
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
