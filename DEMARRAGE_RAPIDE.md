# 🚀 Démarrage Rapide - AI Job Assistant

## ✅ Votre Configuration

- **API Key** : Configurée et validée ✅
- **Modèle** : gemini-2.5-flash (rapide et gratuit)
- **Quotas** : 1500 requêtes/jour GRATUITES
- **Proxy** : http://localhost:3002

---

## 🎯 Démarrer en 3 étapes

### Étape 1 : Démarrer le proxy (1 commande)

Ouvrez PowerShell et collez :

```powershell
$Env:GEMINI_API_KEY = "VOTRE_API_KEY_ICI"
$Env:PORT = "3002"
cd "c:\Users\safiy\Documents\2 Annee Briefs\Gemini\server"
npm start
```

✅ Vous verrez : `Gemini proxy listening on http://localhost:3002`

---

### Étape 2 : Charger l'extension Chrome

1. Ouvrez Chrome → `chrome://extensions/`
2. Activez **"Mode développeur"** (coin supérieur droit)
3. Cliquez **"Charger l'extension non empaquetée"**
4. Sélectionnez : `c:\Users\safiy\Documents\2 Annee Briefs\Gemini`

✅ L'extension apparaît dans votre barre d'outils !

---

### Étape 3 : Configurer l'extension

1. Cliquez sur l'icône de l'extension 🧩
2. Cliquez sur l'icône ⚙️ (Configuration)
3. Entrez :
   - **URL du proxy** : `http://localhost:3002`
   - **Modèle** : `gemini-2.5-flash`
4. Cliquez **"Tester le modèle"**
5. ✅ Vous devez voir : "Test réussi"
6. Cliquez **"Enregistrer"**

---

## 🎉 Utilisation

1. **Allez sur Indeed.ma** (ou Indeed.com)
2. **Cherchez des offres** (ex: "développeur java maroc")
3. **Cliquez sur l'extension** (icône dans la barre)
4. **Sélectionnez une technologie** (Java, PHP, React...)
5. **Cliquez "Générer lettre"** pour une offre
6. 🎊 **Votre lettre est générée en 2-3 secondes !**

---

## 🛠️ Commandes utiles

### Démarrer le proxy (quotidien)
```powershell
cd "c:\Users\safiy\Documents\2 Annee Briefs\Gemini\server"
$Env:GEMINI_API_KEY = "VOTRE_API_KEY_ICI"
npm start
```

### Tester l'API directement
```powershell
$apiKey = "VOTRE_API_KEY_ICI"
$body = @{ 
    contents = @(@{ 
        parts = @(@{ text = "Écris une lettre de motivation courte pour développeur Java" }) 
    }) 
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

### Vérifier que le proxy fonctionne
```powershell
Invoke-RestMethod -Uri "http://localhost:3002" -Method Get
# Devrait afficher : "Gemini proxy running"
```

### Tester le proxy avec génération
```powershell
$body = @{ 
    prompt = "Écris une lettre de motivation pour développeur PHP" 
    model = "gemini-2.5-flash" 
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:3002/generate" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

---

## 📊 Modèles disponibles (tous GRATUITS)

| Modèle | Vitesse | Qualité | Recommandé pour |
|--------|---------|---------|-----------------|
| **gemini-2.5-flash** ⭐ | ⚡⚡⚡ Très rapide | ⭐⭐⭐⭐ | Lettres de motivation (RECOMMANDÉ) |
| gemini-2.5-pro | ⚡⚡ Rapide | ⭐⭐⭐⭐⭐ | Textes complexes |
| gemini-2.0-flash | ⚡⚡⚡ Ultra rapide | ⭐⭐⭐ | Tests rapides |

---

## ❓ Dépannage

### Le proxy ne démarre pas
```powershell
# Vérifier si le port est occupé
Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue

# Changer de port si nécessaire
$Env:PORT = "3003"
npm start
```

### L'extension ne détecte pas les offres
1. Vérifiez que vous êtes sur **Indeed** (indeed.ma, indeed.com, indeed.fr)
2. Rechargez la page (F5)
3. Attendez 2-3 secondes que le scan se fasse
4. Cliquez sur l'extension pour voir les offres

### "Test échoué" dans la configuration
1. Vérifiez que le proxy tourne (PowerShell ouvert avec `npm start`)
2. Testez manuellement : ouvrez `http://localhost:3002` dans Chrome
3. Vérifiez le port (doit être 3002 ou celui que vous avez configuré)

### Aucune lettre générée
1. Regardez la console du proxy (fenêtre PowerShell) pour voir les erreurs
2. Vérifiez votre quota (1500 requêtes/jour)
3. Testez l'API directement (commande ci-dessus)

---

## 🎓 Architecture du projet

```
Extension Chrome                    Proxy Node.js                   Google AI
     (popup)                        (localhost:3002)              (API gratuite)
        │                                  │                            │
        │  1. Détecte offres Indeed       │                            │
        ├──────────────────────────────>  │                            │
        │                                  │                            │
        │  2. Envoie offre sélectionnée   │                            │
        ├──────────────────────────────>  │                            │
        │                                  │  3. Appel API avec clé     │
        │                                  ├─────────────────────────> │
        │                                  │                            │
        │                                  │  4. Lettre générée         │
        │                                  │ <───────────────────────── │
        │  5. Affiche la lettre           │                            │
        │ <────────────────────────────── │                            │
```

**Pourquoi un proxy ?**
- ✅ Protège votre API key (jamais exposée côté client)
- ✅ Gère les erreurs et retries automatiquement
- ✅ Normalise les réponses de l'API

---

## 📁 Structure des fichiers

```
Gemini/
├── manifest.json          # Configuration Chrome Extension
├── popup.html             # Interface principale
├── popup.js               # Logique de l'interface
├── content.js             # Scan des offres Indeed
├── background.js          # Communication avec le proxy
├── config.html            # Page de configuration
├── config.js              # Logique de configuration
├── styles.css             # Styles de l'interface
├── server/                # Proxy Node.js
│   ├── index.js           # Serveur Express
│   ├── package.json       # Dépendances
│   └── README.md          # Doc du proxy
└── README.md              # Documentation principale
```

---

## 🎉 Félicitations !

Votre extension est maintenant **100% fonctionnelle et GRATUITE** !

**Prochaines améliorations possibles :**
- Ajouter plus de sites (LinkedIn, ReKrute)
- Améliorer le parsing des offres
- Ajouter l'export PDF des lettres
- Personnaliser les prompts
- Ajouter l'historique des lettres générées

**Besoin d'aide ?** Consultez `GUIDE_API_GRATUITE.md` pour plus d'options !
