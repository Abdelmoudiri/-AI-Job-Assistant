// Proxy Express simple qui appelle l'API Gemini
// Utilisation: définir GEMINI_API_KEY dans l'env, puis `npm install` et `npm start` dans /server

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('⚠️  Attention: GEMINI_API_KEY n\'est pas défini dans l\'environnement.');
  console.warn('   Définissez-le avec: $Env:GEMINI_API_KEY = "votre-cle"');
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
const DEBUG = process.env.DEBUG_PROXY === '1' || process.env.DEBUG_PROXY === 'true';

// POST /generate
// body: { prompt: "...", model: "gemini-2.5-flash" }
app.post('/generate', async (req, res) => {
  try {
    const { prompt, model } = req.body || {};
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt manquant dans la requête.' });
    }
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY pas configuré sur le serveur.' });
    }
    
    const modelId = model || 'gemini-2.5-flash';
    
    // URL de l'API Gemini (v1beta avec generateContent)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`;
    
    // format correct pour l'API Gemini
    const requestBody = {
      contents: [{
        parts: [{
          text: String(prompt)
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,  // augmenté à 4096 (max pour gemini-2.5-flash)
        topP: 0.95,
      },
      // désactiver le mode "thinking" qui consomme trop de tokens
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    };

    if (DEBUG) {
      console.log('[proxy] 📤 Appel:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
      console.log('[proxy] 📦 Corps de la requête:', JSON.stringify(requestBody, null, 2).slice(0, 500));
    }

    // appel à l'API Gemini
    const resp = await fetch(url, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(requestBody) 
    });
    
    const raw = await resp.text();
    
    if (DEBUG) {
      console.log('[proxy] 📥 Statut de la réponse:', resp.status);
      console.log('[proxy] 📄 Corps de la réponse:', raw.slice(0, 1000));
    }

    // gestion des erreurs API
    if (!resp.ok) {
      let errorDetail = raw;
      try { 
        errorDetail = JSON.parse(raw); 
      } catch (e) {
        // garder le texte brut si pas JSON
      }
      
      console.error('[proxy] ❌ Erreur API:', resp.status, errorDetail);
      
      return res.status(resp.status).json({ 
        error: 'Erreur API Gemini', 
        status: resp.status,
        detail: errorDetail,
        model: modelId
      });
    }

    // parser la réponse
    let data;
    try { 
      data = JSON.parse(raw); 
    } catch (e) { 
      console.error('[proxy] ❌ JSON invalide:', raw.slice(0, 200));
      return res.status(500).json({ 
        error: 'Réponse JSON invalide de Gemini', 
        raw: raw.slice(0, 200) 
      });
    }

    // extraction du texte généré
    let text = '';
      
    // essayer différentes structures de réponse
    const candidate = data?.candidates?.[0];
      
    if (candidate?.content?.parts?.[0]?.text) {
      // format standard avec texte dans parts
      text = candidate.content.parts[0].text;
    } else if (candidate?.content?.parts) {
      // parts existe mais peut être un tableau sans propriété text
      const parts = candidate.content.parts;
      text = parts.map(p => p.text || '').join('');
    } else if (candidate?.text) {
      // texte direct dans candidate
      text = candidate.text;
    } else if (data?.text) {
      // texte direct dans root
      text = data.text;
    } else if (candidate?.content && !candidate.content.parts) {
      // content existe mais pas de parts (thinking mode avec MAX_TOKENS)
      console.warn('[proxy] ⚠️ Réponse sans texte - peut-être limite MAX_TOKENS ou thinking mode');
      return res.status(500).json({ 
        error: 'Réponse incomplète du modèle', 
        detail: 'Le modèle a atteint la limite de tokens avant de générer le texte.',
        suggestion: 'Essayez avec un prompt plus court ou augmentez maxOutputTokens.',
        finishReason: candidate.finishReason,
        data: data,
        model: modelId 
      });
    } else {
      // format inconnu
      return res.status(500).json({ 
        error: 'Format de réponse inattendu', 
        data: data,
        model: modelId 
      });
    }
      
    // vérifier si le texte est vide
    if (!text || text.trim().length === 0) {
      return res.status(500).json({ 
        error: 'Texte vide généré', 
        detail: 'Le modèle n\'a pas généré de texte.',
        finishReason: candidate?.finishReason,
        data: data,
        model: modelId 
      });
    }

    if (DEBUG) {
      console.log('[proxy] ✅ Succès! Généré', text.length, 'caractères');
    }

    // retour de la réponse
    return res.json({ 
      letter: text, 
      modelUsed: modelId, 
      endpoint: url.replace(API_KEY, 'KEY_HIDDEN')
    });

  } catch (err) {
    console.error('[proxy] ❌ Erreur inattendue:', err.message);
    return res.status(500).json({ 
      error: 'Erreur serveur', 
      message: err.message 
    });
  }
});

// endpoint de vérification de santé
app.get('/', (req, res) => {
  res.send('✅ Proxy Gemini en cours d\'exécution');
});

// démarrage du serveur
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║       🚀 Serveur Proxy Gemini - EN COURS 🚀             ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Serveur en écoute sur: http://localhost:${PORT}`);
  console.log(`🔑 Clé API configurée: ${API_KEY ? 'OUI ✅' : 'NON ❌'}`);
  console.log(`🐛 Mode debug: ${DEBUG ? 'ACTIVÉ 🔍' : 'DÉSACTIVÉ'}`);
  console.log('');
  console.log('📝 Endpoints:');
  console.log(`   GET  /       - Vérification de santé`);
  console.log(`   POST /generate - Générer une lettre`);
  console.log('');
  console.log('Appuyez sur Ctrl+C pour arrêter');
  console.log('');
});
