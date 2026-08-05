let queue = [];
let isProcessing = false;
let currentTabId = null;
let mainTabId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'process_links') {
    queue = request.links;
    mainTabId = sender.tab.id;
    if (!isProcessing) {
      processNext();
    }
  } else if (request.action === 'close_tab_and_next') {
    if (sender.tab && sender.tab.id === currentTabId) {
      chrome.tabs.remove(currentTabId);
      processNext();
    }
  }
});

function notifyMainTab(msg) {
  if (mainTabId) {
    chrome.tabs.sendMessage(mainTabId, { action: 'status_update', message: msg }).catch(() => {});
  }
}

function processNext() {
  if (queue.length === 0) {
    isProcessing = false;
    notifyMainTab("Todos concluídos!");
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Infobip Automator',
      message: 'Todos os relatórios foram gerados com sucesso!'
    });
    return;
  }

  isProcessing = true;
  const nextItem = queue.shift();
  console.log("Processando:", nextItem.name);
  notifyMainTab(`Processando: ${nextItem.name} (Restam ${queue.length})`);

  chrome.tabs.create({ url: nextItem.url, active: false }, (tab) => {
    currentTabId = tab.id;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runAutomationInTab
    }).catch(err => {
      console.error("Erro ao injetar script:", err);
      chrome.tabs.remove(tab.id);
      processNext();
    });
  });
}

function runAutomationInTab() {
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const findButtonByText = (textPartial) => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    return buttons.find(b => {
      const txt = (b.innerText || '').toLowerCase();
      const attrTxt = (b.getAttribute('text') || '').toLowerCase();
      const search = textPartial.toLowerCase();
      return txt.includes(search) || attrTxt.includes(search);
    });
  };

  async function run() {
    console.log("Aguardando botão 'Obter relatório'...");
    let btnObter = null;
    for (let i = 0; i < 30; i++) {
      btnObter = findButtonByText('Obter relatório');
      if (btnObter) break;
      await wait(1000);
    }

    if (!btnObter) {
      chrome.runtime.sendMessage({ action: "close_tab_and_next" });
      return;
    }

    btnObter.click();
    console.log("Botão clicado. Aguardando popup...");
    
    // Tenta encontrar o botão correto no popup
    let btnConfirmar = null;
    for (let i = 0; i < 20; i++) {
      // Tenta achar botões comuns de confirmação se "Cancelar" não for o desejado
      btnConfirmar = findButtonByText('Gerar') || findButtonByText('Exportar') || findButtonByText('Baixar') || findButtonByText('Cancelar');
      
      if (btnConfirmar && btnConfirmar.offsetParent !== null) break;
      await wait(1000);
    }

    if (btnConfirmar) {
      console.log("Botão de popup encontrado: ", btnConfirmar.innerText);
      await wait(1000);
      btnConfirmar.click();
    } else {
      console.error("Botão do popup não encontrado.");
    }

    await wait(4000);
    chrome.runtime.sendMessage({ action: "close_tab_and_next" });
  }

  run();
}
