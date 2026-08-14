const $ = id => document.getElementById(id);

function cleanLinks(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => /^https?:\/\//i.test(line));
}

function sendMsg(message) {
  return chrome.runtime.sendMessage(message);
}

function printLog(text) {
  const el = $('log');
  el.innerText = (text || '') + '\n' + el.innerText;
  el.scrollTop = 0;
}

$('saveBtn').addEventListener('click', async () => {
  const links = cleanLinks($('links').value);
  try {
    const resp = await sendMsg({ action: 'save_links', links });
    $('status').innerText =
      resp && resp.ok
        ? `${links.length} link(s) salvos.`
        : 'Erro ao salvar.';
  } catch (e) {
    $('status').innerText = 'Erro ao salvar (recarregue a extensão).';
  }
});

$('runBtn').addEventListener('click', async () => {
  $('status').innerText = 'Iniciando agora...';
  try {
    await sendMsg({ action: 'run_now' });
  } catch (e) {}
});

$('timerBtn').addEventListener('click', async () => {
  try {
    await sendMsg({ action: 'toggle_timer' });
  } catch (e) {}
  refreshStatus();
});

$('testBtn').addEventListener('click', async () => {
  const url = $('testUrl').value.trim();
  if (!/^https?:\/\//i.test(url)) {
    $('status').innerText = 'Informe uma URL válida para o teste.';
    return;
  }
  $('status').innerText = 'Testando fluxo do link único...';
  printLog('>> Iniciando TESTE do link: ' + url);
  try {
    const resp = await sendMsg({ action: 'run_test', url });
    if (resp && !resp.ok) {
      $('status').innerText = resp.error || 'Teste não iniciado.';
    }
  } catch (e) {
    $('status').innerText = 'Erro ao iniciar o teste.';
  }
});

async function refreshStatus() {
  try {
    const resp = await sendMsg({ action: 'get_links' });
    if (!resp || !resp.ok) {
      $('status').innerText = 'Extensão não carregada / recarregar.';
      return;
    }
    const parts = [resp.links.length + ' link(s) salvos.'];
    if (resp.timerOn) {
      parts.push('Timer ativo - próxima execução: ' + (resp.nextRun || '?'));
    } else {
      parts.push('Timer desativado.');
    }
    $('status').innerText = parts.join(' ');
    $('timerBtn').innerText = resp.timerOn ? 'Desativar Timer (2h)' : 'Ativar Timer (2h)';
  } catch (e) {
    $('status').innerText = 'Sem resposta do background.';
  }
}

chrome.runtime.onMessage.addListener(request => {
  if (request.action === 'log') {
    printLog(request.text);
  } else if (request.action === 'status_update') {
    $('status').innerText = request.message;
  }
});

refreshStatus();