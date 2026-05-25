document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('status').innerText = 'Analisando a lista de campanhas...';
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'start_extraction'}, (response) => {
      if (chrome.runtime.lastError) {
        document.getElementById('status').innerText = 'Erro: Atualize a página do Infobip (F5) e tente novamente.';
      }
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'status_update') {
    document.getElementById('status').innerText = request.message;
  }
});
