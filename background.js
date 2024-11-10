// background.js - gère le stockage des offres et appelle Gemini

let cachedJobs = [];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ detectedJobs: [] });
});

// fonction pour ajouter et sauvegarder les offres
async function addJobs(jobs) {
  // au lieu de fusionner, on remplace complètement les offres
  // car content.js envoie déjà toutes les offres détectées après dédupliquer
  const map = new Map();
  for (const j of jobs) {
    // utiliser url+title+company comme clé unique
    const key = (j.url||'') + '|' + (j.title||'') + '|' + (j.company||'');
    map.set(key, j);
  }
  const uniqueJobs = Array.from(map.values()).slice(0, 200);
  await chrome.storage.local.set({ detectedJobs: uniqueJobs });
  // notifier les popups
  chrome.runtime.sendMessage({ type: 'jobsUpdated' });
}

// appeler l'API Gemini pour générer la lettre
async function callGemini(promptText, apiKey, model = 'gemini-pro') {
  if (!apiKey) throw new Error('Pas de clé API configurée.');
  
  // fonction pour tester un modèle spécifique avec le nouveau endpoint
  async function tryModel(modelId) {
    const modelPath = modelId.startsWith('models/') ? modelId : `models/${modelId}`;
    // NOUVEAU: utiliser generateContent au lieu de generateText
    const tryUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
    
    const bodyParts = {
      contents: [{ 
        parts: [{ 
          text: `Tu es un assistant professionnel qui rédige des lettres de motivation en français. Rédige uniquement la lettre de motivation (pas d'explications, pas d'objet de mail) adaptée à l'offre suivante :\n\n${promptText}\n\nLa lettre doit être claire, concise et professionnelle.` 
        }] 
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    };
    
    const resp = await fetch(tryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyParts)
    });
    return { resp, modelId, tryUrl };
  }

  // essayer le modèle demandé puis les alternatives si ça marche pas
  const fallbackCandidates = [
    model, 
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash', 
    'gemini-1.5-pro',
    'gemini-pro'
  ];
  
  // éviter les doublons et garder l'ordre
  const tried = new Set();
  let finalData = null;
  let lastError = null;

  for (const candidate of fallbackCandidates) {
    if (!candidate || tried.has(candidate)) continue;
    tried.add(candidate);
    try {
      const { resp, modelId, tryUrl } = await tryModel(candidate);
      const raw = await resp.text();
      if (!resp.ok) {
        // si 404, essayer le suivant. sinon lancer l'erreur
        if (resp.status === 404) {
          lastError = { status: resp.status, body: raw, modelTried: modelId, url: tryUrl };
          console.log(`[callGemini] Modèle ${modelId} non disponible (404), essai suivant...`);
          continue; // essayer le prochain modèle
        }
        let details = raw;
        try { details = JSON.parse(raw); } catch (e) {}
        throw new Error(`Erreur API Gemini: ${resp.status} ${JSON.stringify(details)} (model=${modelId})`);
      }

      // réponse réussie
      let data;
      try { data = JSON.parse(raw); } catch (e) { data = raw; }
      finalData = { data, modelUsed: modelId };
      console.log(`[callGemini] ✅ Succès avec le modèle: ${modelId}`);
      break;
    } catch (err) {
      // erreur réseau ou parsing - stocker et essayer le suivant
      lastError = { error: String(err), modelTried: candidate };
      console.log(`[callGemini] Erreur avec ${candidate}:`, err.message);
      continue;
    }
  }

  if (!finalData) {
    // aucun candidat a réussi
    if (lastError?.body) throw new Error(`Aucun modèle trouvé (404) ou toutes les tentatives ont échoué. Dernière réponse: ${JSON.stringify(lastError)}`);
    throw new Error(`Toutes les tentatives ont échoué. Dernière erreur: ${JSON.stringify(lastError)}`);
  }

  const data = finalData.data;

  // extraire le texte de la réponse (nouveau format)
  let text = '';
  if (data && typeof data === 'object') {
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = data.candidates[0].content.parts[0].text;
    } else if (data?.generatedText) {
      text = data.generatedText;
    } else {
      text = JSON.stringify(data);
    }
  } else if (typeof data === 'string') {
    text = data;
  }

  return { letter: text, modelUsed: finalData.modelUsed };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      // Handler pour récupérer le profil utilisateur (auto-apply assistant)
      if (message?.type === 'getProfile') {
        const profile = await chrome.storage.sync.get([
          'userEmail', 'userPhone', 'userName', 'userLocation', 
          'userJobTitle', 'userBio', 'userExperience', 'userEducation',
          'userSkills', 'userLanguages'
        ]);
        sendResponse({ profile });
        return;
      }

      // Handler pour générer une réponse AI (auto-apply assistant)
      if (message?.type === 'generateAnswer') {
        const { question, profile, jobInfo } = message;
        const cfg = await chrome.storage.sync.get(['geminiApiKey', 'geminiModel']);
        const apiKey = cfg.geminiApiKey;
        const model = cfg.geminiModel || 'gemini-2.0-flash-exp';

        if (!apiKey || apiKey === 'VOTRE_API_KEY_ICI') {
          sendResponse({ 
            error: 'Clé API Gemini non configurée. Allez dans Paramètres pour la configurer.' 
          });
          return;
        }

        // Construire un prompt contextualisé
        const contextLines = [];
        if (profile?.userName) contextLines.push(`Nom: ${profile.userName}`);
        if (profile?.userJobTitle) contextLines.push(`Poste actuel: ${profile.userJobTitle}`);
        if (profile?.userBio) contextLines.push(`Bio: ${profile.userBio}`);
        if (profile?.userExperience) contextLines.push(`Expérience: ${profile.userExperience}`);
        if (profile?.userSkills) contextLines.push(`Compétences: ${profile.userSkills}`);
        
        const jobContext = jobInfo ? `Poste visé: ${jobInfo.title} chez ${jobInfo.company}` : '';
        
        const prompt = `Tu es un assistant qui aide à remplir des formulaires de candidature.

PROFIL DU CANDIDAT:
${contextLines.join('\n')}

${jobContext}

QUESTION DU FORMULAIRE:
${question}

INSTRUCTIONS:
Génère une réponse professionnelle, concise et pertinente (2-3 phrases maximum) pour cette question.
La réponse doit être basée sur le profil du candidat et adaptée au poste.
Réponds directement sans introduction ni formule de politesse.

RÉPONSE:`;

        try {
          const result = await callGemini(prompt, apiKey, model);
          sendResponse({ answer: result.letter });
        } catch (err) {
          console.error('Erreur génération réponse:', err);
          sendResponse({ error: err.message || String(err) });
        }
        return;
      }

      if (message?.type === 'testModels') {
        const apiKey = message.apiKey;
        const candidates = message.candidates || ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-pro'];
        const results = [];
        for (const candidate of candidates) {
          if (!candidate) continue;
          try {
            const modelPath = candidate.startsWith('models/') ? candidate : `models/${candidate}`;
            // NOUVEAU: utiliser generateContent au lieu de generateText
            const tryUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
            const bodyParts = {
              contents: [{ parts: [{ text: 'Court test: écris "OK"' }] }],
              generationConfig: {
                maxOutputTokens: 10
              }
            };
            const resp = await fetch(tryUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyParts) });
            const raw = await resp.text();
            if (!resp.ok) {
              let details = raw;
              try { details = JSON.parse(raw); } catch (e) {}
              const note = typeof details === 'string' ? details : JSON.stringify(details);
              results.push({ model: candidate, ok: false, status: resp.status, note: note.slice(0,1000) });
              // si 404, probablement pas disponible pour cette clé - continuer les tests
              continue;
            }
            // succès
            let data;
            try { data = JSON.parse(raw); } catch (e) { data = raw; }
            // extraire un petit échantillon
            let sample = '';
            if (data?.candidates?.[0]?.content?.parts?.[0]?.text) sample = data.candidates[0].content.parts[0].text;
            else if (data?.generatedText) sample = data.generatedText;
            else sample = typeof data === 'string' ? data : JSON.stringify(data);
            results.push({ model: candidate, ok: true, status: resp.status, sample: String(sample).slice(0,800) });
          } catch (err) {
            results.push({ model: candidate, ok: false, error: String(err).slice(0,300) });
          }
        }
        sendResponse({ results });
        return;
      }

      if (message?.type === 'addJobs') {
        await addJobs(message.jobs || []);
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'clearJobs') {
        // effacer toutes les offres quand la page se recharge
        await chrome.storage.local.set({ allJobs: [] });
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'generateForJob') {
        const job = message.job;
        // récupérer la config depuis le storage
        const cfg = await chrome.storage.sync.get(['geminiApiKey', 'geminiModel']);
        const apiKey = cfg.geminiApiKey;
        const model = cfg.geminiModel || 'gemini-2.0-flash-exp';
        
        // vérifier que la clé API est configurée
        if (!apiKey || apiKey === 'VOTRE_API_KEY_ICI') {
          sendResponse({ 
            error: '❌ Clé API Gemini non configurée.\n\nAllez dans Paramètres ⚙️ pour configurer votre clé API Gemini.\n\nObtenez une clé gratuite sur: https://makersuite.google.com/app/apikey' 
          });
          return;
        }
        
        // prompt amélioré et explicite
        const prompt = `Tu es un assistant qui génère des lettres de motivation professionnelles en français.

OFFRE D'EMPLOI :
Titre du poste : ${job.title}
Entreprise : ${job.company || 'Non spécifiée'}
Lieu : Maroc

DESCRIPTION DU POSTE :
${job.description || 'Description non disponible'}

INSTRUCTIONS :
Rédige une lettre de motivation professionnelle, personnalisée et convaincante pour cette offre d'emploi.
La lettre doit :
- Être en français professionnel
- Faire environ 250-300 mots
- Suivre la structure classique : introduction, compétences/expérience, motivation, conclusion
- Mettre en avant les compétences mentionnées dans l'offre
- Montrer un réel intérêt pour le poste et l'entreprise
- Être prête à envoyer (avec formules de politesse)

NE PAS inclure : adresse de l'expéditeur, date, objet (juste le corps de la lettre)

GÉNÈRE LA LETTRE MAINTENANT :`;

        // appel direct à l'API Gemini
        console.log('[background] 🚀 Génération via API Gemini directe');
        const gen = await callGemini(prompt, apiKey, model);
        sendResponse(gen);
        return;
      }

      // autres messages
      sendResponse({ ok: false });
    } catch (err) {
      console.error('erreur background', err);
      sendResponse({ error: err.message || String(err) });
    }
  })();
  // garder le canal ouvert pour sendResponse async
  return true;
});