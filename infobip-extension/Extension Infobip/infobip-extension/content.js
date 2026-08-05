let uiBox = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start_extraction') {
    startExtraction();
  } else if (request.action === 'status_update') {
    updateUI(request.message);
  }
});

function createUI() {
  if (uiBox) return;
  uiBox = document.createElement('div');
  uiBox.style.position = 'fixed';
  uiBox.style.bottom = '20px';
  uiBox.style.right = '20px';
  uiBox.style.padding = '15px';
  uiBox.style.backgroundColor = '#282c34';
  uiBox.style.color = '#fff';
  uiBox.style.borderRadius = '8px';
  uiBox.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
  uiBox.style.zIndex = '999999';
  uiBox.style.fontFamily = 'sans-serif';
  uiBox.style.fontSize = '14px';
  uiBox.innerHTML = '<strong>Infobip Automator</strong><br><span id="ib-status">Iniciando...</span>';
  document.body.appendChild(uiBox);
}

function updateUI(message) {
  if (!uiBox) createUI();
  document.getElementById('ib-status').innerText = message;
}

function startExtraction() {
  createUI();
  updateUI("Analisando links...");
  
  const linksToProcess = [];
  const links = document.querySelectorAll('a[href^="/broadcast/preview/"]');
  
  links.forEach(link => {
    const name = link.innerText.trim();
    if (name.toUpperCase().includes("TESTE")) return;
    
    const tr = link.closest('tr');
    let hasLowTraffic = false;
    
    if (tr) {
      const tds = tr.querySelectorAll('td');
      for (let td of tds) {
        const cellText = td.innerText.replace(/[.,]/g, '').trim();
        if (/^\d+$/.test(cellText)) {
          const trafficValue = parseInt(cellText, 10);
          if (trafficValue < 30) {
            hasLowTraffic = true;
            break;
          }
        }
      }
    }
    
    if (hasLowTraffic) return;
    
    linksToProcess.push({ url: link.href, name: name });
  });
  
  if (linksToProcess.length > 0) {
    updateUI(`Encontrados ${linksToProcess.length} links. Iniciando...`);
    chrome.runtime.sendMessage({ action: "process_links", links: linksToProcess });
  } else {
    updateUI("Nenhum link válido encontrado.");
    alert("Nenhum link válido encontrado para processar na página atual.");
  }
}
