// ai-vision-navigator.js - Assistant intelligent avec vision AI

console.log('🤖 AI Vision Navigator activé');

let navigationState = {
  currentStep: 1,
  isProcessing: false,
  screenshotHistory: [],
  aiInstructions: []
};

// Créer l'interface de l'assistant intelligent
function createSmartAssistant() {
  const oldAssistant = document.getElementById('ai-smart-assistant');
  if (oldAssistant) oldAssistant.remove();

  const assistant = document.createElement('div');
  assistant.id = 'ai-smart-assistant';
  assistant.innerHTML = `
    <div class="smart-header">
      <div class="smart-title">
        <span class="smart-icon">🤖</span>
        <span>Assistant IA Vision</span>
      </div>
      <div class="smart-status" id="smartStatus">Analyse de la page...</div>
    </div>
    
    <div class="smart-screenshot" id="smartScreenshot">
      <div class="screenshot-placeholder">
        📸 Capture en cours...
      </div>
    </div>
    
    <div class="smart-analysis" id="smartAnalysis">
      <div class="analysis-title">🧠 Analyse IA :</div>
      <div class="analysis-content" id="analysisContent">
        En attente d'analyse...
      </div>
    </div>
    
    <div class="smart-actions">
      <button class="btn-smart btn-analyze" id="btnAnalyze">
        📸 Analyser la page
      </button>
      <button class="btn-smart btn-execute" id="btnExecute" disabled>
        ✨ Exécuter l'action
      </button>
      <button class="btn-smart btn-next-step" id="btnNextStep">
        ➡️ Étape suivante
      </button>
    </div>
    
    <div class="smart-history" id="smartHistory">
      <div class="history-title">📜 Historique :</div>
      <div class="history-content" id="historyContent">
        Aucune action effectuée
      </div>
    </div>
  `;

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    #ai-smart-assistant {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 420px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      animation: slideUp 0.4s ease-out;
    }

    .smart-header {
      padding: 16px;
      background: rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .smart-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .smart-icon {
      font-size: 24px;
      animation: pulse 2s infinite;
    }

    .smart-status {
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
      font-style: italic;
    }

    .smart-screenshot {
      padding: 16px;
      background: rgba(255, 255, 255, 0.95);
      max-height: 200px;
      overflow: hidden;
    }

    .screenshot-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 150px;
      background: #f0f0f0;
      border-radius: 8px;
      color: #666;
      font-size: 14px;
    }

    .screenshot-image {
      width: 100%;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .screenshot-image:hover {
      transform: scale(1.02);
    }

    .smart-analysis {
      padding: 16px;
      background: white;
      border-top: 1px solid #e0e0e0;
    }

    .analysis-title {
      font-weight: 600;
      color: #667eea;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .analysis-content {
      color: #333;
      font-size: 13px;
      line-height: 1.6;
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      border-left: 3px solid #667eea;
    }

    .analysis-content.thinking {
      animation: pulse 1.5s infinite;
    }

    .smart-actions {
      display: flex;
      gap: 8px;
      padding: 16px;
      background: white;
      border-top: 1px solid #e0e0e0;
    }

    .btn-smart {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-analyze {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-analyze:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-execute {
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
      color: white;
    }

    .btn-execute:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(74, 222, 128, 0.4);
    }

    .btn-execute:disabled {
      background: #d1d5db;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-next-step {
      background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
      color: white;
    }

    .btn-next-step:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }

    .smart-history {
      padding: 16px;
      background: #f8f9fa;
      max-height: 150px;
      overflow-y: auto;
      border-top: 1px solid #e0e0e0;
    }

    .history-title {
      font-weight: 600;
      color: #667eea;
      margin-bottom: 8px;
      font-size: 12px;
      text-transform: uppercase;
    }

    .history-content {
      font-size: 12px;
      color: #666;
    }

    .history-item {
      padding: 8px;
      background: white;
      border-radius: 6px;
      margin-bottom: 6px;
      border-left: 3px solid #667eea;
    }

    .history-item .time {
      color: #999;
      font-size: 11px;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    /* Highlight pour les éléments détectés */
    .ai-detected-element {
      outline: 3px solid #4ade80 !important;
      outline-offset: 2px;
      animation: highlightPulse 1.5s infinite;
      cursor: pointer !important;
    }

    @keyframes highlightPulse {
      0%, 100% {
        outline-color: #4ade80;
      }
      50% {
        outline-color: #22c55e;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(assistant);

  // Event listeners
  document.getElementById('btnAnalyze').addEventListener('click', analyzePageWithAI);
  document.getElementById('btnExecute').addEventListener('click', executeAIAction);
  document.getElementById('btnNextStep').addEventListener('click', goToNextStep);

  console.log('✅ Assistant intelligent créé');
}

// Capturer un screenshot de la page
async function capturePageScreenshot() {
  updateStatus('📸 Capture de la page en cours...');
  
  try {
    // Utiliser l'API Chrome pour capturer la page visible
    const screenshot = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'captureScreenshot' }, (response) => {
        resolve(response?.screenshot);
      });
    });

    if (screenshot) {
      // Afficher le screenshot
      const screenshotDiv = document.getElementById('smartScreenshot');
      screenshotDiv.innerHTML = `
        <img src="${screenshot}" class="screenshot-image" alt="Page capture" />
      `;
      
      navigationState.screenshotHistory.push({
        timestamp: Date.now(),
        url: window.location.href,
        screenshot: screenshot
      });

      return screenshot;
    }
  } catch (err) {
    console.error('❌ Erreur capture screenshot:', err);
    showSmartNotification('❌ Impossible de capturer la page', 'error');
  }
  
  return null;
}

// Analyser la page avec Gemini Vision
async function analyzePageWithAI() {
  if (navigationState.isProcessing) return;
  
  navigationState.isProcessing = true;
  updateStatus('🧠 Analyse IA en cours...');
  
  const analysisContent = document.getElementById('analysisContent');
  analysisContent.textContent = 'Analyse de la page par l\'IA...';
  analysisContent.classList.add('thinking');

  try {
    // Capturer le screenshot
    const screenshot = await capturePageScreenshot();
    if (!screenshot) {
      throw new Error('Impossible de capturer la page');
    }

    // Extraire le HTML visible
    const pageHTML = extractVisibleHTML();
    const pageURL = window.location.href;

    // Envoyer au backend pour analyse avec Gemini Vision
    const analysis = await chrome.runtime.sendMessage({
      type: 'analyzePageWithVision',
      screenshot: screenshot,
      html: pageHTML,
      url: pageURL,
      context: 'job_application'
    });

    if (analysis.error) {
      throw new Error(analysis.error);
    }

    // Afficher l'analyse
    displayAIAnalysis(analysis);
    
    // Activer le bouton d'exécution si une action est recommandée
    if (analysis.action) {
      document.getElementById('btnExecute').disabled = false;
    }

    updateStatus('✅ Analyse terminée');
    showSmartNotification('🧠 Page analysée avec succès', 'success');

  } catch (err) {
    console.error('❌ Erreur analyse IA:', err);
    analysisContent.textContent = '❌ Erreur : ' + err.message;
    showSmartNotification('❌ Erreur lors de l\'analyse', 'error');
    updateStatus('❌ Erreur d\'analyse');
  } finally {
    analysisContent.classList.remove('thinking');
    navigationState.isProcessing = false;
  }
}

// Extraire le HTML visible de la page
function extractVisibleHTML() {
  // Extraire seulement les éléments visibles et importants
  const buttons = Array.from(document.querySelectorAll('button, a.button, input[type="submit"]'))
    .filter(btn => btn.offsetParent !== null)
    .map(btn => ({
      text: btn.textContent.trim(),
      type: btn.tagName.toLowerCase(),
      classes: btn.className
    }));

  const forms = Array.from(document.querySelectorAll('form'))
    .map(form => ({
      action: form.action,
      method: form.method,
      fieldCount: form.querySelectorAll('input, textarea, select').length
    }));

  const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
    .slice(0, 5)
    .map(h => h.textContent.trim());

  return {
    url: window.location.href,
    title: document.title,
    buttons: buttons.slice(0, 10),
    forms: forms,
    headings: headings,
    hasLoginForm: document.querySelector('input[type="password"]') !== null,
    hasFileUpload: document.querySelector('input[type="file"]') !== null
  };
}

// Afficher l'analyse de l'IA
function displayAIAnalysis(analysis) {
  const analysisContent = document.getElementById('analysisContent');
  
  let html = `
    <div style="margin-bottom: 12px;">
      <strong>📊 Type de page :</strong> ${analysis.pageType || 'Inconnu'}
    </div>
  `;

  if (analysis.description) {
    html += `
      <div style="margin-bottom: 12px;">
        <strong>📝 Description :</strong><br/>
        ${analysis.description}
      </div>
    `;
  }

  if (analysis.action) {
    html += `
      <div style="margin-bottom: 12px; padding: 12px; background: #fef3c7; border-radius: 6px; border-left: 3px solid #f59e0b;">
        <strong>⚡ Action recommandée :</strong><br/>
        ${analysis.action.description}
      </div>
    `;

    if (analysis.action.target) {
      html += `
        <div style="font-size: 12px; color: #666;">
          🎯 Cible : ${analysis.action.target}
        </div>
      `;
    }
  }

  if (analysis.nextSteps && analysis.nextSteps.length > 0) {
    html += `
      <div style="margin-top: 12px;">
        <strong>📋 Prochaines étapes :</strong>
        <ol style="margin: 8px 0 0 20px; padding: 0;">
          ${analysis.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>
    `;
  }

  analysisContent.innerHTML = html;

  // Sauvegarder l'analyse
  navigationState.aiInstructions.push({
    timestamp: Date.now(),
    analysis: analysis
  });

  // Mettre à jour l'historique
  addToHistory(`Analyse : ${analysis.pageType}`, analysis.description);
}

// Exécuter l'action recommandée par l'IA
async function executeAIAction() {
  const lastAnalysis = navigationState.aiInstructions[navigationState.aiInstructions.length - 1];
  if (!lastAnalysis || !lastAnalysis.analysis.action) {
    showSmartNotification('❌ Aucune action à exécuter', 'error');
    return;
  }

  updateStatus('⚡ Exécution de l\'action...');
  const action = lastAnalysis.analysis.action;

  try {
    if (action.type === 'click') {
      // Trouver et cliquer sur l'élément
      const element = findElementByDescription(action.target);
      if (element) {
        highlightElement(element);
        await sleep(500);
        element.click();
        addToHistory('Action : Clic', `Cliqué sur "${action.target}"`);
        showSmartNotification('✅ Clic effectué avec succès', 'success');
        
        // Attendre le chargement de la nouvelle page
        setTimeout(() => {
          updateStatus('⏳ Attente du chargement...');
          setTimeout(() => {
            analyzePageWithAI();
          }, 2000);
        }, 1000);
      } else {
        throw new Error('Élément non trouvé : ' + action.target);
      }
    } else if (action.type === 'fill') {
      // Remplir le formulaire
      await fillFormWithProfile();
      addToHistory('Action : Remplissage', 'Formulaire rempli');
      showSmartNotification('✅ Formulaire rempli', 'success');
    } else if (action.type === 'wait') {
      // Attendre une action manuelle
      updateStatus('⏸️ En attente d\'action manuelle');
      showSmartNotification('⏸️ Action manuelle requise : ' + action.description, 'warning');
      addToHistory('Attente', action.description);
    }

    document.getElementById('btnExecute').disabled = true;

  } catch (err) {
    console.error('❌ Erreur exécution:', err);
    showSmartNotification('❌ Erreur : ' + err.message, 'error');
    updateStatus('❌ Erreur d\'exécution');
  }
}

// Trouver un élément par sa description
function findElementByDescription(description) {
  const lowerDesc = description.toLowerCase();
  
  // Chercher dans les boutons et liens
  const clickables = document.querySelectorAll('button, a, input[type="submit"], input[type="button"]');
  
  for (const el of clickables) {
    const text = el.textContent.toLowerCase().trim();
    const value = (el.value || '').toLowerCase().trim();
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    
    if (text.includes(lowerDesc) || value.includes(lowerDesc) || ariaLabel.includes(lowerDesc)) {
      return el;
    }
  }
  
  return null;
}

// Highlight un élément
function highlightElement(element) {
  element.classList.add('ai-detected-element');
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  setTimeout(() => {
    element.classList.remove('ai-detected-element');
  }, 3000);
}

// Remplir le formulaire avec le profil
async function fillFormWithProfile() {
  // Récupérer le profil
  const response = await chrome.runtime.sendMessage({ type: 'getProfile' });
  const profile = response?.profile || {};

  // Remplir les champs basiques
  const fields = {
    email: profile.userEmail,
    phone: profile.userPhone,
    name: profile.userName,
    location: profile.userLocation
  };

  for (const [type, value] of Object.entries(fields)) {
    if (!value) continue;
    
    const inputs = document.querySelectorAll(`input[type="${type}"], input[name*="${type}"], input[placeholder*="${type}"]`);
    inputs.forEach(input => {
      if (input.offsetParent !== null) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
}

// Passer à l'étape suivante manuellement
function goToNextStep() {
  navigationState.currentStep++;
  updateStatus('➡️ Étape suivante...');
  addToHistory('Navigation', 'Passage à l\'étape suivante');
  
  setTimeout(() => {
    analyzePageWithAI();
  }, 1000);
}

// Mettre à jour le statut
function updateStatus(message) {
  const status = document.getElementById('smartStatus');
  if (status) {
    status.textContent = message;
  }
}

// Ajouter à l'historique
function addToHistory(action, details) {
  const historyContent = document.getElementById('historyContent');
  const time = new Date().toLocaleTimeString();
  
  const item = document.createElement('div');
  item.className = 'history-item';
  item.innerHTML = `
    <div><strong>${action}</strong></div>
    <div style="font-size: 11px; color: #666;">${details}</div>
    <div class="time">${time}</div>
  `;
  
  if (historyContent.textContent === 'Aucune action effectuée') {
    historyContent.textContent = '';
  }
  
  historyContent.insertBefore(item, historyContent.firstChild);
}

// Notification
function showSmartNotification(message, type = 'info') {
  const colors = {
    success: '#4ade80',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  };

  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 1000000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
    max-width: 350px;
  `;

  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = 'slideInRight 0.3s ease-in reverse';
    setTimeout(() => notif.remove(), 300);
  }, 4000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Écouter les messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'startSmartAssistant') {
    createSmartAssistant();
    updateStatus('🚀 Assistant IA activé');
    showSmartNotification('🤖 Assistant Vision IA activé !', 'success');
    
    // Lancer l'analyse automatiquement
    setTimeout(() => {
      analyzePageWithAI();
    }, 1000);
    
    sendResponse({ ok: true });
  }
  return true;
});

console.log('✅ AI Vision Navigator chargé');
