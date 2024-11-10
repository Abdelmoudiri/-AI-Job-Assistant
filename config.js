// config.js - Configuration simplifiée (API directe uniquement)

const form = document.getElementById('configForm');
const apiKeyInput = document.getElementById('apiKey');
const clearBtn = document.getElementById('clear');
const testBtn = document.getElementById('testModelBtn');
const resultsEl = document.getElementById('modelTestResults');
const modelSelect = document.getElementById('modelSelect');
const successMsg = document.getElementById('successMsg');
const errorMsg = document.getElementById('errorMsg');

// Charger la configuration au démarrage
async function loadConfig() {
  const cfg = await chrome.storage.sync.get(['geminiApiKey', 'geminiModel']);
  apiKeyInput.value = cfg.geminiApiKey || '';
  
  if (cfg.geminiModel) {
    modelSelect.value = cfg.geminiModel;
  } else {
    modelSelect.value = 'gemini-2.0-flash-exp'; // défaut
  }
}

// Sauvegarder la configuration
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const apiKey = apiKeyInput.value.trim();
  const model = modelSelect.value;
  
  if (!apiKey) {
    showError('❌ Veuillez entrer une clé API');
    return;
  }
  
  // Vérifier le format de la clé
  if (!apiKey.startsWith('AIza')) {
    showError('⚠️ Format de clé invalide. Une clé API Gemini commence par "AIza"');
    return;
  }
  
  await chrome.storage.sync.set({ 
    geminiApiKey: apiKey, 
    geminiModel: model
  });
  
  showSuccess(`✅ Configuration enregistrée !<br><br><strong>Modèle :</strong> ${model}<br><br>Vous pouvez maintenant générer des lettres de motivation 🎉`);
});

// Effacer la configuration
clearBtn.addEventListener('click', async () => {
  if (!confirm('Êtes-vous sûr de vouloir effacer la configuration ?')) return;
  
  await chrome.storage.sync.remove(['geminiApiKey', 'geminiModel']);
  apiKeyInput.value = '';
  modelSelect.value = 'gemini-2.0-flash-exp';
  showSuccess('✅ Configuration effacée');
});

// Tester la connexion
testBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  const model = modelSelect.value;
  
  if (!apiKey) {
    showError('❌ Veuillez entrer une clé API avant de tester');
    return;
  }
  
  testBtn.disabled = true;
  testBtn.textContent = '⏳ Test en cours...';
  resultsEl.innerHTML = '<p>🔄 Test de la connexion avec Google Gemini...</p>';
  resultsEl.classList.add('show');
  
  try {
    // Envoyer un message de test au background
    const response = await chrome.runtime.sendMessage({
      type: 'testModels',
      apiKey: apiKey,
      candidates: [model]
    });
    
    if (response && response.results && response.results.length > 0) {
      const result = response.results[0];
      
      if (result.ok) {
        resultsEl.innerHTML = `
          <h3>✅ Test réussi !</h3>
          <p><strong>Modèle testé :</strong> ${result.model}</p>
          <p><strong>Statut :</strong> ${result.status}</p>
          <p><strong>Réponse :</strong></p>
          <pre>${result.sample || 'OK'}</pre>
          <p style="color: green; font-weight: bold;">🎉 Votre configuration fonctionne parfaitement !</p>
        `;
        showSuccess('✅ Test réussi ! Votre clé API est valide.');
      } else {
        resultsEl.innerHTML = `
          <h3>❌ Test échoué</h3>
          <p><strong>Modèle :</strong> ${result.model}</p>
          <p><strong>Statut :</strong> ${result.status || 'Erreur'}</p>
          <p><strong>Message :</strong></p>
          <pre>${result.note || result.error || 'Erreur inconnue'}</pre>
          <p style="color: red;">⚠️ Vérifiez votre clé API ou essayez un autre modèle.</p>
        `;
        showError('❌ Test échoué. Vérifiez votre clé API.');
      }
    } else {
      throw new Error('Réponse invalide du service');
    }
  } catch (err) {
    resultsEl.innerHTML = `
      <h3>❌ Erreur</h3>
      <p>${err.message}</p>
      <p style="color: red;">Vérifiez votre connexion Internet et votre clé API.</p>
    `;
    showError('❌ Erreur lors du test : ' + err.message);
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = '🧪 Tester la connexion';
  }
});

// Fonctions d'affichage des messages
function showSuccess(msg) {
  successMsg.innerHTML = msg;
  successMsg.classList.add('show');
  errorMsg.classList.remove('show');
  setTimeout(() => successMsg.classList.remove('show'), 6000);
}

function showError(msg) {
  errorMsg.innerHTML = msg;
  errorMsg.classList.add('show');
  successMsg.classList.remove('show');
  setTimeout(() => errorMsg.classList.remove('show'), 6000);
}

// Initialisation
loadConfig();
