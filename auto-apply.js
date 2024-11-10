// auto-apply.js - Remplissage automatique des formulaires de candidature

console.log('🤖 Auto-Apply actif');

// fonction pour obtenir le profil utilisateur
async function getUserProfile() {
  return new Promise(resolve => {
    chrome.storage.local.get(['userProfile'], (data) => {
      resolve(data.userProfile || null);
    });
  });
}

// fonction pour détecter et remplir les champs du formulaire
async function autoFillForm() {
  const profile = await getUserProfile();
  if (!profile) {
    console.log('⚠️ Pas de profil utilisateur trouvé');
    return;
  }

  console.log('✅ Profil chargé, remplissage automatique...');

  // Mapping des champs communs
  const fieldMappings = [
    // Nom complet
    { selectors: ['input[name*="name" i]', 'input[id*="name" i]', 'input[placeholder*="nom" i]'], value: profile.name },
    
    // Email
    { selectors: ['input[type="email"]', 'input[name*="email" i]', 'input[id*="email" i]'], value: profile.email },
    
    // Téléphone
    { selectors: ['input[type="tel"]', 'input[name*="phone" i]', 'input[name*="tel" i]', 'input[id*="phone" i]'], value: profile.phone },
    
    // Ville/Localisation
    { selectors: ['input[name*="city" i]', 'input[name*="location" i]', 'input[name*="ville" i]', 'input[id*="city" i]'], value: profile.location },
    
    // Message/Lettre de motivation (textarea)
    { selectors: ['textarea[name*="message" i]', 'textarea[name*="cover" i]', 'textarea[name*="motivation" i]', 'textarea[id*="message" i]'], value: profile.bio || 'Motivé et passionné par le développement' }
  ];

  let filledCount = 0;

  // Remplir chaque type de champ
  for (const mapping of fieldMappings) {
    if (!mapping.value) continue;

    for (const selector of mapping.selectors) {
      const fields = document.querySelectorAll(selector);
      fields.forEach(field => {
        if (field && !field.value && field.offsetParent !== null) { // visible et vide
          field.value = mapping.value;
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
          filledCount++;
          console.log(`✓ Rempli: ${selector}`);
        }
      });
    }
  }

  if (filledCount > 0) {
    console.log(`✅ ${filledCount} champs remplis automatiquement`);
    
    // Afficher une notification visuelle
    showNotification(`✅ ${filledCount} champs remplis automatiquement`, 'success');
  } else {
    console.log('ℹ️ Aucun champ à remplir trouvé');
  }
}

// fonction pour générer un email de candidature
async function generateApplicationEmail(jobInfo) {
  const profile = await getUserProfile();
  if (!profile) return null;

  const email = {
    subject: `Candidature - ${jobInfo?.title || 'Poste'} ${jobInfo?.company ? `chez ${jobInfo.company}` : ''}`,
    body: `Bonjour,

Je me permets de vous contacter suite à votre offre d'emploi pour le poste de ${jobInfo?.title || 'développeur'}.

${profile.bio || 'Passionné par le développement et fort de plusieurs années d\'expérience, je suis convaincu que mon profil correspond parfaitement à vos attentes.'}

Mes compétences principales :
${profile.skills ? profile.skills.slice(0, 8).map(s => `• ${s}`).join('\n') : '• Développement web\n• Bases de données\n• Travail en équipe'}

Disponible ${profile.availableImmediately ? 'immédiatement' : 'selon préavis'}, je serais ravi d'échanger avec vous concernant cette opportunité.

Vous trouverez mon CV en pièce jointe.

Cordialement,
${profile.name || 'Votre nom'}
${profile.phone || ''}
${profile.email || ''}`
  };

  return email;
}

// fonction pour copier l'email dans le presse-papier
async function copyEmailToClipboard(email) {
  const fullText = `Objet: ${email.subject}\n\n${email.body}`;
  
  try {
    await navigator.clipboard.writeText(fullText);
    showNotification('✅ Email copié dans le presse-papier', 'success');
    return true;
  } catch (err) {
    console.error('Erreur copie:', err);
    
    // Fallback: créer un textarea temporaire
    const textarea = document.createElement('textarea');
    textarea.value = fullText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    showNotification('✅ Email copié dans le presse-papier', 'success');
    return true;
  }
}

// fonction pour afficher une notification visuelle
function showNotification(message, type = 'info') {
  // Supprimer les anciennes notifications
  const oldNotifs = document.querySelectorAll('.ai-job-assistant-notif');
  oldNotifs.forEach(n => n.remove());

  const notif = document.createElement('div');
  notif.className = 'ai-job-assistant-notif';
  notif.textContent = message;
  
  const colors = {
    success: '#34a853',
    error: '#ea4335',
    info: '#4285f4',
    warning: '#fbbc04'
  };

  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  `;

  // Ajouter l'animation CSS
  if (!document.getElementById('ai-job-notif-style')) {
    const style = document.createElement('style');
    style.id = 'ai-job-notif-style';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notif);

  // Retirer après 4 secondes
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => notif.remove(), 300);
  }, 4000);
}

// fonction pour créer le bouton d'auto-remplissage
function createAutoFillButton() {
  // Vérifier si on est sur une page de candidature
  const hasForm = document.querySelector('form');
  const hasInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').length > 2;
  
  if (!hasForm || !hasInputs) return;

  // Créer le bouton flottant
  const button = document.createElement('button');
  button.id = 'ai-job-auto-fill-btn';
  button.innerHTML = '🤖 Remplir automatiquement';
  button.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 14px 24px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    z-index: 999998;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    transition: all 0.3s ease;
  `;

  button.onmouseover = () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
  };

  button.onmouseout = () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
  };

  button.onclick = async () => {
    button.disabled = true;
    button.innerHTML = '⏳ Remplissage...';
    await autoFillForm();
    button.innerHTML = '✅ Rempli !';
    setTimeout(() => {
      button.innerHTML = '🤖 Remplir automatiquement';
      button.disabled = false;
    }, 2000);
  };

  document.body.appendChild(button);
  console.log('✅ Bouton auto-fill créé');
}

// fonction pour créer le bouton "Générer Email"
function createEmailButton() {
  const button = document.createElement('button');
  button.id = 'ai-job-email-btn';
  button.innerHTML = '✉️ Générer Email';
  button.style.cssText = `
    position: fixed;
    bottom: 140px;
    right: 20px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border: none;
    padding: 14px 24px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
    z-index: 999998;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    transition: all 0.3s ease;
  `;

  button.onmouseover = () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 6px 20px rgba(240, 147, 251, 0.6)';
  };

  button.onmouseout = () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 15px rgba(240, 147, 251, 0.4)';
  };

  button.onclick = async () => {
    button.disabled = true;
    button.innerHTML = '⏳ Génération...';
    
    // Extraire infos du job depuis la page
    const jobInfo = {
      title: document.querySelector('h1')?.textContent?.trim() || 'Développeur',
      company: document.querySelector('[class*="company" i]')?.textContent?.trim() || ''
    };
    
    const email = await generateApplicationEmail(jobInfo);
    if (email) {
      await copyEmailToClipboard(email);
      button.innerHTML = '✅ Copié !';
    } else {
      showNotification('⚠️ Veuillez d\'abord remplir votre profil', 'warning');
      button.innerHTML = '✉️ Générer Email';
    }
    
    setTimeout(() => {
      button.innerHTML = '✉️ Générer Email';
      button.disabled = false;
    }, 2000);
  };

  document.body.appendChild(button);
  console.log('✅ Bouton email créé');
}

// Écouter les messages du popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'autoFill') {
    autoFillForm().then(() => sendResponse({ ok: true }));
    return true;
  }
  
  if (message?.type === 'generateEmail') {
    const jobInfo = message.jobInfo || {};
    generateApplicationEmail(jobInfo).then(email => {
      if (email) {
        copyEmailToClipboard(email).then(() => sendResponse({ ok: true, email }));
      } else {
        sendResponse({ ok: false, error: 'Pas de profil' });
      }
    });
    return true;
  }
});

// Initialisation au chargement de la page
setTimeout(() => {
  createAutoFillButton();
  createEmailButton();
}, 1000);
