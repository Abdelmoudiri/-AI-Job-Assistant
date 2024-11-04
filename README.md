# 🤖 AI Job Assistant - Extension Chrome

> Détectez automatiquement les offres d'emploi sur Indeed et générez des lettres de motivation personnalisées en quelques secondes grâce à l'IA **100% GRATUITE** !

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Gemini](https://img.shields.io/badge/powered%20by-Gemini%202.5-orange)]()

## ✨ Fonctionnalités

- 🔍 **Détection automatique** des offres sur Indeed
- 🏷️ **Filtrage intelligent** par technologie (Java, PHP, React, Python...)
- 📝 **Génération instantanée** de lettres de motivation personnalisées
- � **100% GRATUIT** - API Google AI Studio (1500 requêtes/jour)
- 🔒 **Sécurisé** - API key protégée côté serveur via proxy
- ⚡ **Ultra rapide** - Réponse en 2-3 secondes

## 🎉 Totalement gratuit !

Cette extension utilise **Google AI Studio** :
- ✅ Aucune carte bancaire requise
- ✅ 1500 lettres gratuites par jour
- ✅ Modèle Gemini 2.5 Flash (qualité professionnelle)
- ✅ Pas d'expiration

## Fichiers du projet
- `manifest.json` - configuration de l'extension Chrome
- `popup.html` / `popup.js` - interface principale (liste des offres, filtres)
- `content.js` - détection automatique des offres Indeed
- `background.js` - service worker (stockage, appels API)
- `config.html` / `config.js` - configuration (API key, proxy)
- `styles.css` - styles de l'interface
- `server/` - proxy Node.js (recommandé pour sécuriser l'API key)

## 🚀 Démarrage rapide (5 minutes)

### ⚡ Méthode la plus rapide

**Double-cliquez simplement sur** : `START_PROXY.ps1`

Le script fait tout automatiquement :
- ✅ Configure l'API key
- ✅ Vérifie les dépendances
- ✅ Teste la connexion
- ✅ Démarre le proxy

### � Méthode manuelle

#### 1️⃣ Démarrer le proxy

```powershell
# Ouvrez PowerShell et collez ces 3 lignes :
$Env:GEMINI_API_KEY = "VOTRE_API_KEY_ICI"
cd "c:\Users\safiy\Documents\2 Annee Briefs\Gemini\server"
npm start
```

✅ Vous verrez : `Gemini proxy listening on http://localhost:3002`

#### 2️⃣ Charger l'extension dans Chrome

1. Ouvrez `chrome://extensions/`
2. Activez le **Mode développeur** (coin supérieur droit)
3. Cliquez **"Charger l'extension non empaquetée"**
4. Sélectionnez le dossier : `c:\Users\safiy\Documents\2 Annee Briefs\Gemini`

#### 3️⃣ Configurer l'extension

1. Cliquez sur l'icône de l'extension 🧩
2. Cliquez sur ⚙️ (Configuration)
3. Entrez :
   - **URL du proxy** : `http://localhost:3002`
   - **Modèle** : `gemini-2.5-flash`
4. Cliquez **"Tester le modèle"** → ✅ "Test réussi"
5. Cliquez **"Enregistrer"**

#### 4️⃣ Utiliser l'extension

1. Allez sur **Indeed.ma** (ou .com / .fr)
2. Cherchez des offres (ex: "développeur java")
3. Cliquez sur l'icône de l'extension
4. Filtrez par technologie
5. Cliquez **"Générer lettre"** pour une offre
6. 🎉 Lettre générée en 2-3 secondes !

---

## 📖 Documentation complète

- 📘 **[DEMARRAGE_RAPIDE.md](./DEMARRAGE_RAPIDE.md)** - Guide détaillé avec captures
- 🎓 **[GUIDE_API_GRATUITE.md](./GUIDE_API_GRATUITE.md)** - Comment obtenir une API key
- 🛠️ **[server/README.md](./server/README.md)** - Documentation du proxy

---

## 📊 Quotas gratuits

| Ressource | Limite gratuite |
|-----------|-----------------|
| Requêtes/minute | 15 RPM |
| Requêtes/jour | 1500/jour |
| Coût | **0€ (gratuit)** |

**Suffisant pour :**
- Générer 1500 lettres/jour
- Tester et développer sans limite
- Usage personnel illimité

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Chrome Ext     │         │   Proxy Node.js  │         │  Google AI API  │
│  (Frontend)     │ ──────> │  (localhost)     │ ──────> │   (Gemini)      │
│                 │  HTTP   │                  │  HTTPS  │                 │
│  - popup.html   │ <────── │  - Express       │ <────── │  - 2.5-flash    │
│  - content.js   │         │  - CORS          │         │  - 2.5-pro      │
│  - background.js│         │  - Retry logic   │         │  - GRATUIT      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

**Avantages du proxy :**
- 🔐 API key sécurisée (jamais exposée au navigateur)
- 🔄 Gestion automatique des erreurs et retries
- 📊 Logging centralisé pour le debug
- 🌐 Contournement des restrictions CORS

---

## 📁 Structure du projet

```
Gemini/
│
├── 📄 manifest.json              # Configuration Chrome Extension
├── 🎨 popup.html                 # Interface utilisateur
├── ⚙️ popup.js                   # Logique UI (liste, filtres, génération)
├── 🔍 content.js                 # Détection des offres Indeed
├── 🔌 background.js              # Service worker (messages, storage)
├── ⚙️ config.html                # Page de configuration
├── 📝 config.js                  # Gestion des paramètres
├── 🎨 styles.css                 # Styles de l'interface
│
├── 📂 server/                    # Proxy Node.js
│   ├── 🚀 index.js               # Serveur Express + API Gemini
│   ├── 📦 package.json           # Dépendances
│   └── 📖 README.md              # Documentation du proxy
│
├── 🚀 START_PROXY.ps1            # Script de démarrage automatique
├── 📘 DEMARRAGE_RAPIDE.md        # Guide de démarrage
├── 🎓 GUIDE_API_GRATUITE.md      # Obtenir une API key gratuite
└── 📖 README.md                  # Ce fichier
```

---

## 🎯 Technologies utilisées

### Frontend (Extension Chrome)
- **Manifest V3** - Dernière version des extensions Chrome
- **Chrome APIs** - storage.local, storage.sync, runtime, tabs
- **Vanilla JavaScript** - Pas de framework pour la légèreté
- **CSS moderne** - Flexbox, Grid, animations

### Backend (Proxy)
- **Node.js** - Runtime JavaScript
- **Express** - Framework web minimaliste
- **node-fetch** - Appels HTTP vers l'API Gemini
- **CORS** - Gestion des origines croisées

### IA
- **Google Gemini 2.5 Flash** - Modèle principal (rapide, gratuit)
- **Google Gemini 2.5 Pro** - Alternative (qualité supérieure)
- **REST API** - Communication via HTTPS

---

## 📝 Notes techniques

- Le modèle utilisé est `gemini-pro` (gratuit via Google AI Studio)
- Les alternatives gratuites (Hugging Face, Cohere) sont documentées dans `GUIDE_API_GRATUITE.md`
- Le parsing Indeed utilise des sélecteurs CSS basiques (à affiner selon la locale)
- Les tags détectés : Java, PHP, React, JavaScript, Python, C#, Ruby, SQL, Developer

## Prochaines améliorations proposées
- Affiner le parsing par site pour capter plus d'informations (localisation, salaire, compétences).
- Ajouter un bouton pour éditer le prompt avant envoi à Gemini.
- Renderer HTML plus riche pour l'email et la lettre (formatage, téléchargement).
