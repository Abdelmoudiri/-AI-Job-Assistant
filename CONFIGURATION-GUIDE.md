# 🔧 Configuration de l'extension AI Job Assistant

## Méthode 1 : Utiliser l'API Gemini directement (RECOMMANDÉ) ✅

C'est la méthode la plus simple et la plus fiable.

### Étape 1 : Obtenir une clé API Gemini (GRATUIT)

1. Allez sur : **https://makersuite.google.com/app/apikey**
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Create API Key"**
4. Copiez votre clé API (format : `AIzaSy...`)

### Étape 2 : Configurer l'extension

1. Ouvrez l'extension AI Job Assistant
2. Cliquez sur l'icône **⚙️ Paramètres** (en haut à droite)
3. Collez votre clé API dans le champ **"Clé API Gemini"**
4. **Laissez le champ "URL Proxy" VIDE**
5. Cliquez sur **"Enregistrer"**

### Étape 3 : Tester

1. Allez sur Indeed.ma
2. Cliquez sur une offre d'emploi
3. Dans l'extension, cliquez sur **"✨ Générer lettre"**
4. La lettre devrait se générer en quelques secondes

---

## Méthode 2 : Utiliser un serveur proxy (OPTIONNEL)

⚠️ **Seulement si vous avez des problèmes avec l'API directe**

Un proxy peut être utile si :
- Vous avez des restrictions réseau
- L'API Gemini est bloquée dans votre pays
- Vous voulez partager une seule clé API entre plusieurs utilisateurs

### Créer le serveur proxy

Créez un fichier `proxy-server.js` :

```javascript
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = 'VOTRE_CLE_API_ICI';

app.post('/generate', async (req, res) => {
  try {
    const { prompt, model = 'gemini-pro' } = req.body;
    
    const modelPath = model.startsWith('models/') ? model : `models/${model}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }
    
    const letter = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ letter, modelUsed: model });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`✅ Proxy Gemini démarré sur http://localhost:${PORT}`);
});
```

### Installer et lancer

```bash
npm install express cors node-fetch@2
node proxy-server.js
```

### Configurer l'extension

1. URL Proxy : `http://localhost:3002`
2. Laissez la clé API vide (elle est dans le proxy)

---

## ❌ Résolution des problèmes

### Erreur : "Failed to fetch"

**Cause** : Le proxy est configuré mais non disponible

**Solutions** :
1. ✅ **Vider le champ "URL Proxy"** dans les paramètres
2. OU lancer le serveur proxy (`node proxy-server.js`)

### Erreur : "Clé API non configurée"

**Solution** :
1. Obtenez une clé sur https://makersuite.google.com/app/apikey
2. Collez-la dans Paramètres ⚙️
3. Sauvegardez

### Erreur : "API key not valid"

**Causes possibles** :
- La clé API est invalide ou expirée
- Quota gratuit dépassé (1500 req/jour)

**Solutions** :
1. Vérifiez votre clé sur Google AI Studio
2. Créez une nouvelle clé si nécessaire
3. Attendez 24h si quota dépassé

### Erreur : "Model not found" (404)

**Cause** : Le modèle sélectionné n'existe pas

**Solution** :
1. Dans Paramètres, utilisez : `gemini-2.0-flash-exp`
2. OU laissez vide pour utiliser le modèle par défaut

---

## 🎯 Configuration recommandée

```
┌─────────────────────────────────────┐
│  Paramètres de l'extension          │
├─────────────────────────────────────┤
│  Clé API Gemini:                    │
│  AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX  │ ← Votre clé
│                                     │
│  Modèle Gemini:                     │
│  gemini-2.0-flash-exp               │ ← Modèle recommandé
│                                     │
│  URL Proxy Gemini (optionnel):     │
│  [LAISSER VIDE]                     │ ← Vide = API directe
│                                     │
│          [Enregistrer]              │
└─────────────────────────────────────┘
```

---

## 📊 Quotas et limites

**Version gratuite de Gemini :**
- ✅ 1500 requêtes par jour
- ✅ 60 requêtes par minute
- ✅ Modèles disponibles : gemini-2.0-flash-exp, gemini-1.5-flash

**Conseils :**
- Une lettre = 1 requête
- Relisez avant de régénérer (économise les requêtes)
- 1500 req/jour = assez pour 50+ candidatures

---

## 🔒 Sécurité

⚠️ **IMPORTANT** :
- Ne partagez JAMAIS votre clé API
- Ne la commitez PAS sur GitHub
- Gardez-la confidentielle

Si votre clé est exposée :
1. Allez sur https://makersuite.google.com/app/apikey
2. Supprimez l'ancienne clé
3. Créez-en une nouvelle
4. Mettez à jour l'extension

---

## ✅ Vérification de la configuration

Pour vérifier que tout fonctionne :

```javascript
// Ouvrez la console (F12) sur Indeed.ma
// Collez ce code :

chrome.storage.sync.get(['geminiApiKey', 'geminiModel', 'geminiProxyUrl'], (cfg) => {
  console.log('Configuration actuelle:');
  console.log('- API Key:', cfg.geminiApiKey ? '✅ Configurée' : '❌ Manquante');
  console.log('- Modèle:', cfg.geminiModel || 'gemini-pro (défaut)');
  console.log('- Proxy:', cfg.geminiProxyUrl || 'Aucun (API directe)');
});
```

---

## 📞 Besoin d'aide ?

1. Vérifiez ce guide
2. Consultez les logs de la console (F12)
3. Rechargez l'extension (chrome://extensions)
4. Testez avec une nouvelle clé API

**Bonne génération de lettres ! 🚀**
