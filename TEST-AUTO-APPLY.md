# 🧪 Test de l'Assistant de Postulation Automatique

## ⚠️ Avant de tester

### 1. Recharger l'extension
1. Ouvrir Chrome : `chrome://extensions/`
2. Activer le "Mode développeur" (en haut à droite)
3. Trouver "AI Job Assistant"
4. Cliquer sur l'icône ⟳ **Recharger**

### 2. Vérifier la configuration
1. Cliquer sur l'icône de l'extension
2. Aller dans **Paramètres ⚙️**
3. Vérifier que votre clé API Gemini est configurée
4. Aller dans **Profil** et compléter vos informations

## 🧪 Test 1 : Vérifier que l'assistant se charge

### Sur n'importe quelle page avec un formulaire :

1. **Ouvrir la console du navigateur** : `F12` ou `Ctrl+Shift+J`
2. **Vérifier les logs** :
   ```
   🤖 Auto-Apply Assistant activé
   📝 Formulaire détecté sur la page
   ```

Si vous voyez ces messages → ✅ L'assistant est chargé correctement

## 🧪 Test 2 : Activer l'assistant depuis le popup

### Méthode recommandée :

1. **Ouvrir le popup** de l'extension
2. **Trouver une offre d'emploi** dans la liste
3. **Cliquer sur le bouton vert "🤖 Postuler"**
4. Une nouvelle page s'ouvre avec l'offre
5. **Attendre 2-3 secondes**
6. La barre de l'assistant devrait apparaître en bas de la page

### Ce que vous devriez voir :

```
┌─────────────────────────────────────────────────────┐
│ 🤖 Assistant de Candidature IA                      │
│ Prêt à vous aider                                    │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 0%                │
│ 0 champs remplis                                     │
│                                                      │
│ [← Précédent]  [✨ Fill]  [Next →]                   │
│                                                      │
│ 💡 Cliquez sur "Fill" pour que l'IA remplisse...   │
└─────────────────────────────────────────────────────┘
```

## 🧪 Test 3 : Activer l'assistant manuellement (pour déboguer)

### Si le bouton "Postuler" ne marche pas :

1. **Aller sur n'importe quelle page** avec un formulaire (ex: un site de candidature)
2. **Ouvrir la console** : `F12`
3. **Coller et exécuter ce code** :

```javascript
// Simuler l'activation de l'assistant
chrome.runtime.sendMessage({ type: 'startAutoApply' });
```

4. La barre devrait apparaître immédiatement

## 🧪 Test 4 : Tester le remplissage automatique

### Une fois l'assistant visible :

1. **Cliquer sur "✨ Fill"**
2. **Observer** :
   - La barre de progression augmente
   - Les champs se remplissent un par un
   - Des notifications apparaissent en haut à droite
3. **Vérifier** :
   - Vos emails sont remplis
   - Votre téléphone est rempli
   - Les zones de texte contiennent des réponses générées

## 🐛 Problèmes courants et solutions

### ❌ Problème : "Les boutons ne s'affichent pas"

**Causes possibles :**

1. **L'extension n'a pas été rechargée**
   - Solution : `chrome://extensions/` → ⟳ Recharger
   
2. **Le fichier n'est pas chargé par manifest.json**
   - Vérifier dans `manifest.json` :
   ```json
   "content_scripts": [
     {
       "matches": ["https://*/*", "http://*/*"],
       "js": ["auto-apply.js", "auto-apply-assistant.js"],
       "run_at": "document_idle"
     }
   ]
   ```

3. **Le message n'est pas reçu**
   - Ouvrir la console (`F12`)
   - Regarder si vous voyez : `🤖 Auto-Apply Assistant activé`
   - Sinon, le fichier n'est pas chargé

4. **Conflit CSS avec le site**
   - L'assistant est peut-être caché derrière un autre élément
   - Solution : Augmenter le `z-index` dans le CSS

### ❌ Problème : "La barre apparaît mais disparaît immédiatement"

**Solution :**
- Le site utilise probablement un framework (React, Vue, Angular)
- Ajouter un `MutationObserver` pour recréer la barre si elle est supprimée

### ❌ Problème : "Les champs ne se remplissent pas"

**Causes possibles :**

1. **Profil incomplet**
   - Vérifier : Paramètres → Profil
   - Compléter : email, téléphone, nom, bio

2. **Clé API non configurée**
   - Vérifier : Paramètres → Clé API Gemini
   - Tester la connexion

3. **Les champs sont protégés**
   - Certains sites empêchent le remplissage automatique
   - Solution : Remplir manuellement

## 🔍 Debug avancé

### Vérifier que le fichier est chargé :

1. Ouvrir `F12` → Onglet **Sources**
2. Chercher dans l'arborescence : `Content Scripts` → `auto-apply-assistant.js`
3. Si le fichier n'apparaît pas → Problème de manifest

### Vérifier que le message est envoyé :

1. Dans `popup.js`, chercher le code du bouton "Postuler"
2. Vérifier qu'il contient :
```javascript
chrome.tabs.sendMessage(newTab.id, { 
  type: 'startAutoApply',
  job: job
});
```

### Vérifier que le CSS est appliqué :

1. `F12` → Onglet **Elements**
2. Chercher `<div id="ai-job-assistant-bar">`
3. Vérifier les styles dans l'inspecteur

### Vérifier les erreurs :

1. `F12` → Onglet **Console**
2. Filtrer par "Errors" (rouge)
3. Regarder les erreurs JavaScript

## ✅ Test complet de bout en bout

### Scénario : Postuler sur Indeed

1. **Préparation** (2 min)
   ```
   ✅ Extension rechargée
   ✅ Clé API configurée
   ✅ Profil complété
   ```

2. **Détecter une offre** (1 min)
   ```
   - Aller sur indeed.com ou rekrute.com
   - Chercher "Développeur Web Maroc"
   - Attendre que le popup détecte les offres
   ```

3. **Activer l'assistant** (30 sec)
   ```
   - Ouvrir le popup
   - Cliquer sur "🤖 Postuler" (bouton vert)
   - Nouvelle page s'ouvre
   - Attendre 2-3 secondes
   ```

4. **Vérification visuelle** (10 sec)
   ```
   ✅ Barre visible en bas de page
   ✅ 3 boutons visibles : Précédent, Fill, Next
   ✅ Barre de progression à 0%
   ✅ Message d'info en bas
   ```

5. **Tester le remplissage** (1 min)
   ```
   - Cliquer sur "✨ Fill"
   - Observer le remplissage automatique
   - Vérifier que les champs sont corrects
   ```

6. **Navigation** (30 sec)
   ```
   - Cliquer sur "Next →"
   - Cliquer manuellement sur le bouton "Suivant" du site
   - Sur la nouvelle page, cliquer à nouveau sur "Fill"
   ```

**Durée totale** : ~5 minutes

## 📊 Checklist de validation

Avant de dire que ça marche :

- [ ] L'extension est rechargée
- [ ] Le fichier `auto-apply-assistant.js` existe
- [ ] Le manifest.json inclut le fichier
- [ ] Le popup a le bouton "🤖 Postuler"
- [ ] Le bouton ouvre une nouvelle page
- [ ] La console montre "🤖 Auto-Apply Assistant activé"
- [ ] La barre apparaît en bas de page
- [ ] Les 3 boutons sont visibles
- [ ] Le bouton "Fill" fonctionne
- [ ] Les champs se remplissent automatiquement

## 🆘 Si rien ne marche

### Option 1 : Réinstaller l'extension

1. Supprimer l'extension : `chrome://extensions/` → Supprimer
2. Recharger la page
3. Cliquer sur "Charger l'extension non empaquetée"
4. Sélectionner le dossier du projet
5. Retester

### Option 2 : Vérifier les permissions

Dans `manifest.json`, vérifier :
```json
{
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "clipboardWrite"
  ],
  "host_permissions": [
    "https://*.indeed.com/*",
    "https://generativelanguage.googleapis.com/*"
  ]
}
```

### Option 3 : Tester sur une page simple

Créer un fichier HTML de test :

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Test Auto-Apply</h1>
  <form>
    <input type="text" name="name" placeholder="Nom">
    <input type="email" name="email" placeholder="Email">
    <textarea name="bio" placeholder="Bio"></textarea>
    <button type="submit">Envoyer</button>
  </form>
</body>
</html>
```

Ouvrir ce fichier dans Chrome et tester l'assistant.

---

**Besoin d'aide ?** Ouvrir la console et copier tous les messages d'erreur.
