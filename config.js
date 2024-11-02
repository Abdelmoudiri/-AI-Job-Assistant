// config.js - save and load API key and model to chrome.storage.sync

const form = document.getElementById('configForm');
const apiKeyInput = document.getElementById('apiKey');
const modelInput = document.getElementById('model');
const clearBtn = document.getElementById('clear');
const testBtn = document.getElementById('testModelBtn');
const resultsEl = document.getElementById('modelTestResults');
const modelSelect = document.getElementById('modelSelect');
const proxyInput = document.getElementById('proxyUrl');

async function loadConfig() {
  const cfg = await chrome.storage.sync.get(['geminiApiKey', 'geminiModel']);
  apiKeyInput.value = cfg.geminiApiKey || '';
  modelInput.value = cfg.geminiModel || 'gemini-pro';
  // populate modelSelect value if in list
  try { if (modelSelect && cfg.geminiModel) modelSelect.value = cfg.geminiModel; } catch(e){}
  // load proxy URL
  const p = await chrome.storage.sync.get(['geminiProxyUrl']);
  proxyInput.value = p.geminiProxyUrl || '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Clean proxy URL before saving
  let cleanProxyUrl = proxyInput.value.trim();
  // Remove trailing slashes
  cleanProxyUrl = cleanProxyUrl.replace(/\/+$/, '');
  
  await chrome.storage.sync.set({ 
    geminiApiKey: apiKeyInput.value, 
    geminiModel: modelInput.value, 
    geminiProxyUrl: cleanProxyUrl 
  });
  
  alert('✅ Configuration enregistrée.\n\nProxy URL: ' + cleanProxyUrl);
});

clearBtn.addEventListener('click', async () => {
  if (!confirm('Effacer la clé API de la configuration ?')) return;
  await chrome.storage.sync.remove(['geminiApiKey', 'geminiModel', 'geminiProxyUrl']);
  apiKeyInput.value = '';
  modelInput.value = 'gemini-pro';
  proxyInput.value = '';
});

loadConfig();

// When a model is selected from the dropdown, populate the model input and run the test.
modelSelect?.addEventListener('change', async (e) => {
  const val = modelSelect.value || '';
  modelInput.value = val;
  // trigger a test automatically when user selects a model
  if (val) {
    await runModelTestForCandidate(val);
  }
});

// Helper that performs the test via background and renders results
function runModelTestForCandidate(candidateModel) {
  return new Promise((resolve) => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      resultsEl.innerText = 'Entrez d\'abord votre clé API.';
      resolve();
      return;
    }
    resultsEl.innerText = `Test du modèle ${candidateModel}...`;
    const candidates = [candidateModel];
    chrome.runtime.sendMessage({ type: 'testModels', apiKey: key, candidates }, (resp) => {
      if (chrome.runtime.lastError) {
        resultsEl.innerText = 'Erreur de communication avec le background: ' + chrome.runtime.lastError.message;
        resolve();
        return;
      }
      if (!resp) { resultsEl.innerText = 'Aucune réponse.'; resolve(); return; }
      renderResults(resp.results || []);
      resolve();
    });
  });
}

// Helper: render a short result
function renderResults(results) {
  if (!results || !results.length) {
    resultsEl.innerText = 'Aucun résultat.';
    return;
  }
  resultsEl.innerHTML = '';
  for (const r of results) {
    const div = document.createElement('div');
    div.className = 'model-result';
    const status = r.ok ? 'OK' : `ERR ${r.status || ''}`;
    const note = r.note ? (typeof r.note === 'string' ? r.note : JSON.stringify(r.note, null, 2)) : '';
    const sample = r.sample ? (typeof r.sample === 'string' ? r.sample : JSON.stringify(r.sample, null, 2)) : '';
    div.innerHTML = `<strong>${r.model}</strong> — ${status}<br/><small>${note}</small><pre>${sample}</pre>`;
    resultsEl.appendChild(div);
  }
}

// Test button: save key/model then ask background to try a few models
testBtn?.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  if (!key) { alert('Entrez d\'abord votre clé API.'); return; }
  // save current config
  await chrome.storage.sync.set({ geminiApiKey: key, geminiModel: modelInput.value });
  resultsEl.innerText = 'Test en cours...';
  // Candidate models to try (order matters)
  const candidates = [modelInput.value || '', 'gemini-pro', 'gemini-1.0', 'gemini-1', 'text-bison-001'];
  chrome.runtime.sendMessage({ type: 'testModels', apiKey: key, candidates }, (resp) => {
    if (chrome.runtime.lastError) {
      resultsEl.innerText = 'Erreur de communication avec le background: ' + chrome.runtime.lastError.message;
      return;
    }
    if (!resp) { resultsEl.innerText = 'Aucune réponse.'; return; }
    renderResults(resp.results || []);
  });
});
