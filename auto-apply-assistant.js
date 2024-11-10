// auto-apply-assistant.js - Assistant intelligent de postulation automatique

console.log('🤖 Auto-Apply Assistant activé');

let currentStep = 1;
let filledFields = [];
let isProcessing = false;

// Créer la barre flottante d'assistant
function createAssistantBar() {
  // Supprimer l'ancienne barre si elle existe
  const oldBar = document.getElementById('ai-job-assistant-bar');
  if (oldBar) oldBar.remove();

  const bar = document.createElement('div');
  bar.id = 'ai-job-assistant-bar';
  bar.innerHTML = `
    <div class="assistant-header">
      <div class="assistant-title">
        <span class="assistant-icon">🤖</span>
        <span>Assistant de Candidature IA</span>
      </div>
      <div class="assistant-status" id="assistantStatus">Prêt à vous aider</div>
    </div>
    <div class="assistant-progress" id="assistantProgress">
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
      </div>
      <div class="progress-text" id="progressText">0 champs remplis</div>
    </div>
    <div class="assistant-actions">
      <button class="btn-assistant btn-previous" id="btnPrevious" title="Retour à l'étape précédente">
        ← Précédent
      </button>
      <button class="btn-assistant btn-fill" id="btnFill" title="Remplir automatiquement les champs">
        ✨ Fill
      </button>
      <button class="btn-assistant btn-next" id="btnNext" title="Passer à l'étape suivante">
        Next →
      </button>
    </div>
    <div class="assistant-info" id="assistantInfo">
      💡 Cliquez sur "Fill" pour que l'IA remplisse automatiquement les champs détectés
    </div>
  `;

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    #ai-job-assistant-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    .assistant-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .assistant-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
    }

    .assistant-icon {
      font-size: 24px;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .assistant-status {
      font-size: 13px;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 12px;
    }

    .assistant-progress {
      margin-bottom: 12px;
    }

    .progress-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 6px;
    }

    .progress-fill {
      height: 100%;
      background: #4ade80;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 12px;
      opacity: 0.9;
    }

    .assistant-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }

    .btn-assistant {
      flex: 1;
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .btn-previous {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .btn-previous:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateX(-2px);
    }

    .btn-fill {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      font-size: 16px;
    }

    .btn-fill:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
    }

    .btn-next {
      background: #4ade80;
      color: #1e293b;
    }

    .btn-next:hover {
      background: #22c55e;
      transform: translateX(2px);
    }

    .btn-assistant:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    .assistant-info {
      font-size: 13px;
      text-align: center;
      opacity: 0.9;
      padding: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
    }

    .field-highlight {
      animation: highlightField 0.5s ease-out;
      border: 2px solid #4ade80 !important;
    }

    @keyframes highlightField {
      0% {
        box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
      }
      100% {
        box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(bar);

  // Event listeners
  document.getElementById('btnPrevious').addEventListener('click', handlePrevious);
  document.getElementById('btnFill').addEventListener('click', handleFill);
  document.getElementById('btnNext').addEventListener('click', handleNext);

  console.log('✅ Barre d\'assistant créée');
}

// Obtenir le profil utilisateur
async function getUserProfile() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'getProfile' }, (profile) => {
      resolve(profile || null);
    });
  });
}

// Détecter tous les champs de formulaire
function detectFormFields() {
  const fields = {
    text: [],
    email: [],
    tel: [],
    textarea: [],
    select: [],
    radio: [],
    checkbox: [],
    file: []
  };

  // Inputs texte, email, tel
  document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input:not([type])').forEach(input => {
    if (input.offsetParent !== null) { // visible
      const type = input.type === 'email' ? 'email' : input.type === 'tel' ? 'tel' : 'text';
      fields[type].push({
        element: input,
        label: getFieldLabel(input),
        name: input.name || input.id || '',
        placeholder: input.placeholder || ''
      });
    }
  });

  // Textareas
  document.querySelectorAll('textarea').forEach(textarea => {
    if (textarea.offsetParent !== null) {
      fields.textarea.push({
        element: textarea,
        label: getFieldLabel(textarea),
        name: textarea.name || textarea.id || '',
        placeholder: textarea.placeholder || ''
      });
    }
  });

  // Selects
  document.querySelectorAll('select').forEach(select => {
    if (select.offsetParent !== null) {
      fields.select.push({
        element: select,
        label: getFieldLabel(select),
        name: select.name || select.id || '',
        options: Array.from(select.options).map(o => o.text)
      });
    }
  });

  // Radio buttons
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    if (radio.offsetParent !== null) {
      fields.radio.push({
        element: radio,
        label: getFieldLabel(radio),
        name: radio.name,
        value: radio.value
      });
    }
  });

  // Checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    if (checkbox.offsetParent !== null) {
      fields.checkbox.push({
        element: checkbox,
        label: getFieldLabel(checkbox),
        name: checkbox.name || checkbox.id || '',
        value: checkbox.value
      });
    }
  });

  // File inputs
  document.querySelectorAll('input[type="file"]').forEach(file => {
    if (file.offsetParent !== null) {
      fields.file.push({
        element: file,
        label: getFieldLabel(file),
        name: file.name || file.id || '',
        accept: file.accept || ''
      });
    }
  });

  return fields;
}

// Obtenir le label d'un champ
function getFieldLabel(element) {
  // Chercher un label associé
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent.trim();
  }

  // Chercher un label parent
  const parentLabel = element.closest('label');
  if (parentLabel) return parentLabel.textContent.replace(element.value, '').trim();

  // Chercher un label précédent
  let prev = element.previousElementSibling;
  while (prev) {
    if (prev.tagName === 'LABEL') return prev.textContent.trim();
    if (prev.textContent && prev.textContent.trim().length < 100) {
      return prev.textContent.trim();
    }
    prev = prev.previousElementSibling;
  }

  // Utiliser placeholder ou name
  return element.placeholder || element.name || 'Champ inconnu';
}

// Remplir automatiquement les champs
async function handleFill() {
  if (isProcessing) return;
  
  isProcessing = true;
  const btnFill = document.getElementById('btnFill');
  const originalText = btnFill.textContent;
  btnFill.textContent = '⏳ Analyse...';
  btnFill.disabled = true;

  updateStatus('🔍 Analyse de la page en cours...');
  updateInfo('L\'IA détecte tous les champs du formulaire...');

  try {
    // Obtenir le profil
    const profile = await getUserProfile();
    if (!profile) {
      showNotification('⚠️ Veuillez d\'abord remplir votre profil', 'warning');
      updateStatus('❌ Profil manquant');
      updateInfo('Allez dans Profil (👤) pour configurer vos informations');
      return;
    }

    // Détecter les champs
    const fields = detectFormFields();
    let totalFields = 0;
    let filledCount = 0;

    Object.values(fields).forEach(arr => totalFields += arr.length);

    updateStatus(`📝 ${totalFields} champs détectés`);
    updateInfo('Remplissage automatique en cours...');

    // Remplir les champs d'email
    for (const field of fields.email) {
      if (!field.element.value && profile.email) {
        await fillField(field.element, profile.email);
        filledCount++;
        updateProgress(filledCount, totalFields);
        field.element.classList.add('field-highlight');
        await sleep(200);
      }
    }

    // Remplir les champs de téléphone
    for (const field of fields.tel) {
      if (!field.element.value && profile.phone) {
        await fillField(field.element, profile.phone);
        filledCount++;
        updateProgress(filledCount, totalFields);
        field.element.classList.add('field-highlight');
        await sleep(200);
      }
    }

    // Remplir les champs texte (nom, ville, etc.)
    for (const field of fields.text) {
      if (field.element.value) continue; // Skip si déjà rempli

      const label = field.label.toLowerCase();
      let value = null;

      if (label.includes('nom') || label.includes('name')) {
        value = profile.name || profile.fullName;
      } else if (label.includes('ville') || label.includes('city') || label.includes('location')) {
        value = profile.location;
      } else if (label.includes('poste') || label.includes('title') || label.includes('fonction')) {
        value = profile.jobTitle;
      }

      if (value) {
        await fillField(field.element, value);
        filledCount++;
        updateProgress(filledCount, totalFields);
        field.element.classList.add('field-highlight');
        await sleep(200);
      }
    }

    // Remplir les textareas avec IA
    for (const field of fields.textarea) {
      if (field.element.value) continue;

      const label = field.label.toLowerCase();
      let value = null;

      // Si c'est une lettre de motivation
      if (label.includes('motivation') || label.includes('cover letter') || label.includes('lettre')) {
        updateStatus('✨ Génération de la lettre de motivation...');
        value = await generateMotivationLetter(profile, field.label);
      }
      // Si c'est une présentation / bio
      else if (label.includes('présentation') || label.includes('bio') || label.includes('about') || label.includes('vous')) {
        value = profile.bio;
      }
      // Autres questions - générer une réponse avec IA
      else {
        updateStatus(`🤔 Génération de réponse pour: ${field.label}`);
        value = await generateAnswer(profile, field.label);
      }

      if (value) {
        await fillField(field.element, value);
        filledCount++;
        updateProgress(filledCount, totalFields);
        field.element.classList.add('field-highlight');
        await sleep(300);
      }
    }

    // Notifier pour les fichiers
    if (fields.file.length > 0) {
      showNotification(`📎 Action manuelle requise: Upload de ${fields.file.length} fichier(s) (CV, etc.)`, 'warning');
      updateInfo(`⚠️ ${fields.file.length} fichier(s) à uploader manuellement (CV, portfolio, etc.)`);
    }

    // Résumé final
    updateStatus(`✅ ${filledCount}/${totalFields} champs remplis`);
    updateInfo(`🎉 Remplissage terminé ! Vérifiez les champs et cliquez sur "Next" pour continuer.`);
    showNotification(`✅ ${filledCount} champs remplis automatiquement !`, 'success');

    filledFields.push(...Object.values(fields).flat().map(f => f.label));

  } catch (error) {
    console.error('Erreur lors du remplissage:', error);
    updateStatus('❌ Erreur');
    updateInfo('Une erreur est survenue. Réessayez.');
    showNotification('❌ Erreur lors du remplissage: ' + error.message, 'error');
  } finally {
    isProcessing = false;
    btnFill.textContent = originalText;
    btnFill.disabled = false;
  }
}

// Remplir un champ avec animation
async function fillField(element, value) {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

// Générer une réponse avec IA
async function generateAnswer(profile, question) {
  return new Promise((resolve) => {
    const prompt = `Tu es un assistant de candidature. Réponds à cette question de manière professionnelle et concise (2-3 phrases maximum).

Question: ${question}

Profil du candidat:
- Nom: ${profile.name || profile.fullName}
- Poste: ${profile.jobTitle || 'Développeur'}
- Compétences: ${(profile.skills || []).join(', ')}
- Bio: ${profile.bio || ''}
- Niveau: ${profile.experienceLevel || 'junior'}

Réponds uniquement avec la réponse, sans introduction ni conclusion.`;

    chrome.runtime.sendMessage({
      type: 'generateAnswer',
      prompt: prompt
    }, (response) => {
      if (response && response.answer) {
        resolve(response.answer);
      } else {
        resolve(`Je suis ${profile.name || 'un candidat'}, ${profile.jobTitle || 'développeur'} avec de l'expérience en ${(profile.skills || ['développement web']).slice(0, 3).join(', ')}.`);
      }
    });
  });
}

// Générer une lettre de motivation
async function generateMotivationLetter(profile, context) {
  // Utiliser la lettre générée par Gemini
  return profile.bio || 'Lettre de motivation à personnaliser...';
}

// Gérer le bouton Précédent
function handlePrevious() {
  window.history.back();
  showNotification('← Retour à l\'étape précédente', 'info');
}

// Gérer le bouton Next
function handleNext() {
  updateInfo('💡 Cliquez manuellement sur le bouton "Suivant/Next/Continuer" du site');
  showNotification('👆 Cliquez sur le bouton "Next" du formulaire', 'info');
}

// Mettre à jour le statut
function updateStatus(text) {
  const statusEl = document.getElementById('assistantStatus');
  if (statusEl) statusEl.textContent = text;
}

// Mettre à jour l'info
function updateInfo(text) {
  const infoEl = document.getElementById('assistantInfo');
  if (infoEl) infoEl.textContent = text;
}

// Mettre à jour la progression
function updateProgress(current, total) {
  const fillEl = document.getElementById('progressFill');
  const textEl = document.getElementById('progressText');
  
  if (fillEl && textEl) {
    const percent = (current / total) * 100;
    fillEl.style.width = `${percent}%`;
    textEl.textContent = `${current}/${total} champs remplis`;
  }
}

// Afficher une notification
function showNotification(message, type = 'info') {
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

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = 'slideInRight 0.3s ease-in reverse';
    setTimeout(() => notif.remove(), 300);
  }, 4000);
}

// Utilitaire sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Écouter les messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'startAutoApply') {
    // Vérifier s'il y a un formulaire sur la page
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
    
    if (forms.length === 0 || inputs.length < 3) {
      // Pas de formulaire détecté
      showNotification('⚠️ Aucun formulaire de candidature détecté sur cette page', 'warning');
      showNotification('💡 Cherchez et cliquez sur le bouton "Postuler" ou "Candidater" du site', 'info');
      console.log('❌ Aucun formulaire trouvé. Formulaires:', forms.length, 'Champs:', inputs.length);
      sendResponse({ ok: false, error: 'Pas de formulaire' });
      return true;
    }
    
    createAssistantBar();
    updateStatus('🚀 Assistant activé');
    updateInfo(`💡 ${inputs.length} champs détectés - Cliquez sur "Fill" pour remplir automatiquement`);
    showNotification('🤖 Assistant de candidature activé !', 'success');
    console.log('✅ Assistant activé -', forms.length, 'formulaire(s) et', inputs.length, 'champs détectés');
    sendResponse({ ok: true });
  }
  return true;
});

// Initialisation si on détecte un formulaire
setTimeout(() => {
  const hasForm = document.querySelector('form');
  const visibleInputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
  
  if (hasForm && visibleInputs.length > 3) {
    console.log('📝 Formulaire de candidature détecté :', visibleInputs.length, 'champs');
    // L'assistant sera créé quand l'utilisateur clique sur "Postuler" dans le popup
  } else {
    console.log('ℹ️ Page de description (pas de formulaire de candidature)');
  }
}, 1000);
