# 🎉 Guide : Obtenir une API Key GRATUITE (sans argent)

## ✅ Solution 1 : Google AI Studio (RECOMMANDÉ)

### Pourquoi cette solution ?
- ✅ **100% GRATUIT** (pas de carte bancaire)
- ✅ **15 requêtes/minute**
- ✅ **1500 requêtes/jour**
- ✅ **Suffisant pour votre extension Chrome**

### Étapes (2 minutes) :

1. **Allez sur** : https://aistudio.google.com/

2. **Connectez-vous** avec votre compte Google (celui que vous utilisez normalement)

3. **Cliquez sur "Get API Key"** (bouton en haut à droite)
   - Ou allez directement sur : https://aistudio.google.com/app/apikey

4. **Créez une clé API** :
   - Cliquez sur "Create API Key"
   - Sélectionnez "Create API key in new project" (ou choisissez un projet existant)
   - La clé sera générée instantanément

5. **Copiez votre clé** (format : `AIza...`)

6. **Utilisez-la dans votre proxy** :
   ```powershell
   # Dans PowerShell
   $Env:GEMINI_API_KEY = "AIza_VOTRE_CLE_ICI"
   $Env:PORT = "3001"
   cd "c:\Users\safiy\Documents\2 Annee Briefs\Gemini\server"
   npm start
   ```

7. **Testez** :
   - Ouvrez votre extension Chrome
   - Allez dans la configuration
   - Ajoutez l'URL du proxy : `http://localhost:3001`
   - Cliquez sur "Tester le modèle"

### Modèles disponibles GRATUITS :
- `gemini-pro` (texte)
- `gemini-1.5-flash` (plus rapide)
- `gemini-1.5-pro` (meilleur qualité, quotas plus bas)

---

## ✅ Solution 2 : Hugging Face (Alternative gratuite)

### Pourquoi ?
- ✅ Modèles open source (Mistral, Llama)
- ✅ Pas de limite quotidienne stricte
- ✅ Gratuit pour toujours

### Étapes :

1. **Créez un compte** : https://huggingface.co/join

2. **Obtenez un token** :
   - Allez sur : https://huggingface.co/settings/tokens
   - Cliquez sur "New token"
   - Donnez un nom (ex: "job-extension")
   - Copiez le token (format : `hf_...`)

3. **Modèles gratuits disponibles** :
   - `mistralai/Mistral-7B-Instruct-v0.2`
   - `meta-llama/Llama-2-7b-chat-hf`
   - `google/flan-t5-xxl`

4. **Test rapide** :
   ```powershell
   $headers = @{ "Authorization" = "Bearer hf_VOTRE_TOKEN" }
   $body = @{ inputs = "Écris une lettre de motivation courte." } | ConvertTo-Json
   Invoke-RestMethod -Uri "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2" -Method Post -Headers $headers -Body $body -ContentType "application/json"
   ```

---

## ✅ Solution 3 : Cohere (Crédits gratuits)

### Étapes :

1. **Créez un compte** : https://dashboard.cohere.com/welcome/register

2. **Obtenez votre clé** :
   - Elle s'affiche directement après inscription
   - Ou allez sur : https://dashboard.cohere.com/api-keys

3. **Plan gratuit** :
   - 100 appels/minute
   - Pas de limite mensuelle pour le plan Trial

---

## 🎯 Quelle solution choisir ?

| Solution | Gratuit ? | Qualité | Facilité | Pour qui ? |
|----------|-----------|---------|----------|------------|
| **Google AI Studio** | ✅ Oui | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **RECOMMANDÉ** |
| Hugging Face | ✅ Oui | ⭐⭐⭐⭐ | ⭐⭐⭐ | Alternative solide |
| Cohere | ✅ Oui | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Bonne qualité |

---

## 🚀 Commencez MAINTENANT

**Action immédiate :**
1. Ouvrez https://aistudio.google.com/
2. Cliquez sur "Get API Key"
3. Copiez votre clé
4. Lancez votre proxy avec la commande ci-dessus

**Besoin d'aide ?** Envoyez-moi votre clé (les 10 premiers caractères seulement) et je teste avec vous !

---

## ❓ FAQ

**Q : Dois-je donner ma carte bancaire ?**
R : ❌ NON ! Google AI Studio est gratuit sans carte.

**Q : C'est vraiment illimité ?**
R : Vous avez 1500 requêtes/jour, largement suffisant pour tester et développer.

**Q : Et si je dépasse les quotas ?**
R : L'API retournera une erreur 429 (trop de requêtes). Attendez le lendemain ou utilisez Hugging Face en fallback.

**Q : Combien de temps la clé est-elle valide ?**
R : Illimitée ! Elle ne expire pas (sauf si vous la supprimez).

---

## 📝 Prochain pas

Une fois votre clé obtenue :
1. Configurez le proxy (voir commandes ci-dessus)
2. Testez l'extension
3. Profitez de votre assistant IA gratuit ! 🎉
