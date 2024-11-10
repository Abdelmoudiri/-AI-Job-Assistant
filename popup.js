// popup.js - interface moderne avec meilleure UX

const jobsListEl = document.getElementById('jobsList');
const techFilter = document.getElementById('techFilter');
const jobTemplate = document.getElementById('jobTemplate');
const generatedLetter = document.getElementById('generatedLetter');
const outputSection = document.getElementById('output');
const closeOutputBtn = document.getElementById('closeOutput');
const closeOutputBtn2 = document.getElementById('closeOutputBtn');
const copyLetterBtn = document.getElementById('copyLetter');
const jobsCountEl = document.getElementById('jobsCount');
const profileBtn = document.getElementById('profileBtn');

let jobs = [];

// ouvrir la page de profil
if (profileBtn) {
  profileBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'profile.html' });
  });
}

// afficher la liste des offres avec des cartes modernes
function renderJobs() {
  const tech = techFilter.value;
  
  const filtered = jobs.filter(j => {
    if (tech === 'all') return true;
    const tags = j.tags || [];
    return tags.includes(tech);
  });

  // trier par score de match (du plus élevé au plus bas)
  filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  // mettre à jour le compteur
  if (jobsCountEl) {
    jobsCountEl.textContent = filtered.length;
  }

  // vider la liste
  jobsListEl.innerHTML = '';

  // afficher message vide si pas d'offres
  if (filtered.length === 0) {
    jobsListEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔍</span>
        <p>Aucune offre ${tech === 'all' ? '' : 'pour cette technologie'}</p>
        <small>${tech === 'all' ? 'Allez sur Indeed.ma et rechargez la page' : 'Essayez un autre filtre'}</small>
      </div>
    `;
    return;
  }

  // créer les cartes d'offres
  for (const job of filtered) {
    const node = jobTemplate.content.cloneNode(true);
    
    // titre de l'offre
    node.querySelector('.job-title').textContent = job.title || 'Titre inconnu';
    
    // nom de l'entreprise
    node.querySelector('.company-name').textContent = job.company || 'Entreprise non spécifiée';
    
    // score de match
    const matchScore = job.matchScore || 0;
    let scoreColor = '#999';
    let scoreEmoji = '⭐';
    
    if (matchScore >= 80) {
      scoreColor = '#34a853'; // vert
      scoreEmoji = '🔥';
    } else if (matchScore >= 60) {
      scoreColor = '#fbbc04'; // jaune
      scoreEmoji = '⭐';
    } else if (matchScore >= 40) {
      scoreColor = '#ff9800'; // orange
      scoreEmoji = '💡';
    } else {
      scoreColor = '#999'; // gris
      scoreEmoji = '📋';
    }
    
    // ajouter le score avant le nom de l'entreprise
    const companyEl = node.querySelector('.company-name');
    const scoreEl = document.createElement('span');
    scoreEl.style.cssText = `
      display: inline-block;
      margin-right: 8px;
      padding: 2px 8px;
      background: ${scoreColor}22;
      color: ${scoreColor};
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    `;
    scoreEl.textContent = `${scoreEmoji} ${matchScore}%`;
    companyEl.parentNode.insertBefore(scoreEl, companyEl);
    
    // tags
    const tagsContainer = node.querySelector('.job-tags');
    const tags = job.tags || [];
    if (tags.length > 0) {
      tags.slice(0, 3).forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'job-tag';
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
      });
    }
    
    // boutons
    const btnGen = node.querySelector('.generate');
    const btnOpen = node.querySelector('.open');
    const btnAutoFill = node.querySelector('.btn-auto-fill');
    const btnApply = node.querySelector('.btn-apply');
    
    btnGen.addEventListener('click', () => generateForJob(job));
    btnOpen.addEventListener('click', () => {
      if (job.url) {
        chrome.tabs.create({ url: job.url });
      } else {
        alert('❌ Pas d\'URL disponible pour cette offre.');
      }
    });
    
    // bouton postuler avec assistant IA
    if (btnApply) {
      btnApply.addEventListener('click', async () => {
        if (!job.url) {
          alert('❌ Pas d\'URL disponible pour cette offre.');
          return;
        }

        const originalText = btnApply.innerHTML;
        btnApply.innerHTML = '<span class="btn-icon">⏳</span> Ouverture...';
        btnApply.disabled = true;

        try {
          // Ouvrir l'offre dans un nouvel onglet
          const newTab = await chrome.tabs.create({ url: job.url });
          
          // Attendre que la page soit chargée
          setTimeout(async () => {
            // Activer l'assistant sur le nouvel onglet
            try {
              await chrome.tabs.sendMessage(newTab.id, { 
                type: 'startAutoApply',
                job: job
              });
              
              btnApply.innerHTML = '<span class="btn-icon">✅</span> Activé !';
              setTimeout(() => {
                btnApply.innerHTML = originalText;
                btnApply.disabled = false;
              }, 2000);
            } catch (err) {
              console.log('L\'assistant sera activé automatiquement sur la page');
              btnApply.innerHTML = originalText;
              btnApply.disabled = false;
            }
          }, 2000);

        } catch (err) {
          console.error('Erreur ouverture:', err);
          alert('❌ Erreur lors de l\'ouverture de la page');
          btnApply.innerHTML = originalText;
          btnApply.disabled = false;
        }
      });
    }
    
    // bouton auto-fill (ancien)
    if (btnAutoFill) {
      btnAutoFill.addEventListener('click', async () => {
        const originalText = btnAutoFill.innerHTML;
        btnAutoFill.innerHTML = '<span class="btn-icon">⏳</span> Envoi...';
        btnAutoFill.disabled = true;
        
        try {
          // obtenir l'onglet actif
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          
          // envoyer le message au content script
          chrome.tabs.sendMessage(tab.id, { 
            type: 'autoFill',
            jobInfo: job
          }, (response) => {
            if (chrome.runtime.lastError) {
              alert('⚠️ Veuillez ouvrir la page de candidature d\'abord');
            } else {
              btnAutoFill.innerHTML = '<span class="btn-icon">✅</span> Fait !';
              setTimeout(() => {
                btnAutoFill.innerHTML = originalText;
                btnAutoFill.disabled = false;
              }, 2000);
            }
          });
        } catch (err) {
          console.error('Erreur auto-fill:', err);
          btnAutoFill.innerHTML = originalText;
          btnAutoFill.disabled = false;
        }
      });
    }
    
    jobsListEl.appendChild(node);
  }
}

// charger les offres depuis le storage
async function loadJobsFromStorage() {
  const data = await chrome.storage.local.get('detectedJobs');
  jobs = data.detectedJobs || [];
  renderJobs();
}

// demander un nouveau scan quand le popup s'ouvre
async function refreshJobs() {
  try {
    // récupérer l'onglet actif
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // déclencher seulement sur les pages Indeed
    if (tab?.url && tab.url.includes('indeed')) {
      // exécuter le content script à nouveau pour rescanner la page
      chrome.tabs.sendMessage(tab.id, { type: 'rescan' }, () => {
        // ignorer les erreurs si le content script n'est pas chargé
        if (chrome.runtime.lastError) {
          console.log('Content script pas prêt, chargement depuis le storage uniquement');
        }
      });
    }
  } catch (err) {
    console.log('Impossible de rafraîchir les offres:', err);
  }
  
  // toujours charger depuis le storage
  loadJobsFromStorage();
}

// gérer le changement de filtre
techFilter.addEventListener('change', renderJobs);

// générer la lettre pour une offre
async function generateForJob(job) {
  // afficher la section de sortie
  outputSection.style.display = 'flex';
  generatedLetter.innerHTML = `
    <div style="text-align: center; padding: 40px 20px; color: #999;">
      <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
      <p style="font-size: 16px; font-weight: 600;">Génération en cours...</p>
      <p style="font-size: 13px; margin-top: 8px;">Gemini crée votre lettre personnalisée</p>
    </div>
  `;
  
  // Disable copy button
  copyLetterBtn.disabled = true;
  copyLetterBtn.style.opacity = '0.5';
  
  chrome.runtime.sendMessage({ type: 'generateForJob', job }, (response) => {
    // Enable copy button
    copyLetterBtn.disabled = false;
    copyLetterBtn.style.opacity = '1';
    
    if (chrome.runtime.lastError) {
      generatedLetter.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
          <p style="font-size: 16px; font-weight: 600; color: #ea4335;">Erreur de connexion</p>
          <p style="font-size: 13px; margin-top: 8px; color: #666;">${chrome.runtime.lastError.message}</p>
        </div>
      `;
      return;
    }
    
    if (!response) {
      generatedLetter.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <p style="font-size: 16px; font-weight: 600; color: #fbbc04;">Aucune réponse</p>
          <p style="font-size: 13px; margin-top: 8px; color: #666;">Le service n'a pas répondu. Vérifiez que le proxy est démarré.</p>
        </div>
      `;
      return;
    }
    
    if (response.error) {
      // Parse error details if available
      let errorMessage = response.error;
      let errorDetails = '';
      let suggestions = '';
      
      // Check if error contains JSON details
      try {
        const errorMatch = response.error.match(/\{.*\}/);
        if (errorMatch) {
          const parsed = JSON.parse(errorMatch[0]);
          
          // Handle 503 overload error
          if (parsed.status === 503 || parsed.detail?.error?.code === 503) {
            errorMessage = '⚠️ Modèle surchargé';
            errorDetails = parsed.detail?.error?.message || 'Le modèle est temporairement indisponible.';
            suggestions = `
              <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-top: 16px; text-align: left;">
                <p style="font-weight: 600; color: #856404; margin-bottom: 8px;">💡 Solutions :</p>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 12px;">
                  <li>Réessayez dans quelques secondes</li>
                  <li>Ou changez de modèle dans les paramètres ⚙️</li>
                  <li>Recommandé : <strong>gemini-2.0-flash</strong> (ultra rapide)</li>
                </ul>
              </div>
            `;
          }
          // Handle 429 rate limit error
          else if (parsed.status === 429 || parsed.detail?.error?.code === 429) {
            errorMessage = '⏱️ Limite de requêtes atteinte';
            errorDetails = parsed.detail?.error?.message || 'Trop de requêtes en peu de temps.';
            suggestions = `
              <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-top: 16px; text-align: left;">
                <p style="font-weight: 600; color: #856404; margin-bottom: 8px;">💡 Solutions :</p>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 12px;">
                  <li>Attendez quelques minutes avant de réessayer</li>
                  <li>Limite gratuite : 1500 requêtes/jour</li>
                  <li>Limite : 60 requêtes/minute</li>
                </ul>
              </div>
            `;
          }
          // Handle 400 bad request
          else if (parsed.status === 400 || parsed.detail?.error?.code === 400) {
            errorMessage = '❌ Requête invalide';
            errorDetails = parsed.detail?.error?.message || 'Format de requête incorrect.';
            suggestions = `
              <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 16px; margin-top: 16px; text-align: left;">
                <p style="font-weight: 600; color: #721c24; margin-bottom: 8px;">🔧 Action requise :</p>
                <ul style="margin: 0; padding-left: 20px; color: #721c24; font-size: 12px;">
                  <li>Vérifiez que le proxy est à jour</li>
                  <li>Redémarrez le proxy avec START_PROXY.ps1</li>
                  <li>Modèle actuel : <strong>${parsed.model || 'inconnu'}</strong></li>
                </ul>
              </div>
            `;
          }
          // Handle incomplete response (MAX_TOKENS, empty text, etc.)
          else if (response.error.includes('incomplète') || response.error.includes('vide') || 
                   parsed.finishReason === 'MAX_TOKENS' || parsed.detail === 'MAX_TOKENS') {
            errorMessage = '⚠️ Réponse incomplète';
            errorDetails = parsed.detail || 'Le modèle n\'a pas pu générer la lettre complète.';
            suggestions = `
              <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-top: 16px; text-align: left;">
                <p style="font-weight: 600; color: #856404; margin-bottom: 8px;">💡 Solutions :</p>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 12px;">
                  <li>Réessayez (ça peut marcher la 2ème fois)</li>
                  <li>Ou changez de modèle : <strong>gemini-2.0-flash</strong></li>
                  <li>Le proxy a été mis à jour avec plus de tokens</li>
                  <li><strong>Redémarrez le proxy</strong> pour appliquer les changements</li>
                </ul>
              </div>
            `;
          }
          // Generic error with details
          else {
            errorMessage = `Erreur ${parsed.status || 'inconnue'}`;
            errorDetails = parsed.detail?.error?.message || JSON.stringify(parsed.detail || parsed, null, 2);
          }
        }
      } catch (e) {
        // Keep original error message if parsing fails
      }
      
      generatedLetter.innerHTML = `
        <div style="padding: 40px 20px;">
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
            <p style="font-size: 16px; font-weight: 600; color: #ea4335;">${errorMessage}</p>
            <p style="font-size: 13px; margin-top: 8px; color: #666; white-space: pre-wrap;">${errorDetails}</p>
          </div>
          ${suggestions}
          <div style="margin-top: 16px; text-align: center;">
            <button onclick="document.getElementById('outputSection').style.display='none'" 
                    style="background: #667eea; color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
              Fermer
            </button>
          </div>
        </div>
      `;
      return;
    }
    
    // Success - display letter
    const letterText = response.letter || response.raw || 'Aucune lettre générée.';
    generatedLetter.textContent = letterText;
    
    // Show success notification briefly
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #34a853;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 2000;
      animation: slideDown 0.3s ease;
    `;
    successMsg.textContent = '✅ Lettre générée avec succès !';
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 2000);
  });
}

// Close output handlers
function closeOutput() {
  outputSection.style.display = 'none';
}

closeOutputBtn.addEventListener('click', closeOutput);
closeOutputBtn2.addEventListener('click', closeOutput);

// Copy letter handler
copyLetterBtn.addEventListener('click', async () => {
  const text = generatedLetter.textContent;
  try {
    await navigator.clipboard.writeText(text);
    
    // Visual feedback
    const originalText = copyLetterBtn.innerHTML;
    copyLetterBtn.innerHTML = '<span class="btn-icon">✅</span> Copié !';
    copyLetterBtn.style.background = '#34a853';
    
    setTimeout(() => {
      copyLetterBtn.innerHTML = originalText;
      copyLetterBtn.style.background = '';
    }, 2000);
  } catch (err) {
    alert('❌ Impossible de copier : ' + err.message);
  }
});

// Initial load - use refresh to trigger rescan
refreshJobs();

// Listen for updates from background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'jobsUpdated') {
    loadJobsFromStorage();
    
    // Show notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      color: #667eea;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 2000;
      animation: slideDown 0.3s ease;
    `;
    notification.textContent = `🔄 ${jobs.length} offres mises à jour`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translate(-50%, -20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;
document.head.appendChild(style);
