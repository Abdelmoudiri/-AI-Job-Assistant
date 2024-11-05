# 🚀 Guide : Démarrage Automatique du Proxy

## 📋 Options disponibles

### Option 1 : Démarrage Manuel (Actuel)
**À chaque fois que vous utilisez l'extension :**
```powershell
# Double-cliquez sur :
START_PROXY.ps1
# OU
START_PROXY.bat
```

---

### Option 2 : Démarrage Silencieux (Sans fenêtre)
**Double-cliquez sur :**
```
START_PROXY_SILENT.vbs
```
Le proxy démarre en arrière-plan sans fenêtre visible !

---

### Option 3 : Démarrage Automatique au Démarrage de Windows

#### Méthode A : Via le dossier Démarrage (FACILE)

1. **Ouvrez le dossier Démarrage** :
   ```powershell
   # Exécutez cette commande dans PowerShell :
   start shell:startup
   ```

2. **Créez un raccourci** :
   - Clic droit dans le dossier → "Nouveau" → "Raccourci"
   - Ciblez : `c:\Users\safiy\Documents\2 Annee Briefs\Gemini\START_PROXY_SILENT.vbs`
   - Nom : "AI Job Assistant Proxy"

3. **Redémarrez Windows** : Le proxy démarrera automatiquement !

#### Méthode B : Via le Planificateur de tâches (AVANCÉ)

1. **Ouvrez le Planificateur de tâches** :
   ```powershell
   taskschd.msc
   ```

2. **Créez une tâche** :
   - Clic droit → "Créer une tâche de base"
   - Nom : "AI Job Assistant Proxy"
   - Déclencheur : "À l'ouverture d'une session"
   - Action : "Démarrer un programme"
   - Programme : `c:\Users\safiy\Documents\2 Annee Briefs\Gemini\START_PROXY_SILENT.vbs`

3. **Options avancées** :
   - Exécuter même si l'utilisateur n'est pas connecté
   - Exécuter avec les autorisations maximales

---

## 🛠️ Script PowerShell Automatique

Je vais créer un script qui s'installe automatiquement au démarrage :

```powershell
# Exécutez cette commande pour installer :
.\INSTALL_AUTO_START.ps1
```

---

## 📊 Comparaison des méthodes

| Méthode | Difficulté | Fenêtre visible | Auto au démarrage |
|---------|------------|-----------------|-------------------|
| Manuel (START_PROXY.ps1) | ⭐ Facile | ✅ Oui | ❌ Non |
| Silencieux (.vbs) | ⭐ Facile | ❌ Non | ❌ Non |
| Dossier Démarrage | ⭐⭐ Moyen | ❌ Non | ✅ Oui |
| Planificateur | ⭐⭐⭐ Avancé | ❌ Non | ✅ Oui |

---

## ✅ Méthode Recommandée

**Pour la plupart des utilisateurs :**
1. Utilisez `START_PROXY_SILENT.vbs` pour démarrage manuel sans fenêtre
2. Ajoutez-le au dossier Démarrage pour auto-démarrage

**Avantages :**
- ✅ Pas de fenêtre qui reste ouverte
- ✅ Démarre automatiquement avec Windows
- ✅ Facile à désactiver (supprimer du dossier Démarrage)

---

## 🔍 Vérifier si le proxy tourne

```powershell
# Méthode 1 : Test HTTP
Invoke-RestMethod -Uri "http://localhost:3002"
# Devrait afficher : "Gemini proxy running"

# Méthode 2 : Vérifier le processus
Get-Process -Name node -ErrorAction SilentlyContinue

# Méthode 3 : Vérifier le port
Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
```

---

## 🛑 Arrêter le proxy

```powershell
# Si vous avez démarré en silencieux :
Stop-Process -Name node -Force

# Ou trouver et arrêter :
$port = 3002
$pid = (Get-NetTCPConnection -LocalPort $port).OwningProcess
Stop-Process -Id $pid -Force
```

---

## 🎯 Installation Rapide (Recommandée)

**Exécutez cette commande unique :**

```powershell
# Copie le fichier VBS dans le dossier Démarrage
Copy-Item "START_PROXY_SILENT.vbs" "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\AI_Job_Assistant_Proxy.vbs"
Write-Host "✅ Proxy configuré pour démarrer automatiquement !" -ForegroundColor Green
```

---

## ❓ FAQ

**Q : Le proxy consomme-t-il beaucoup de ressources ?**  
R : Non, ~20-30 MB de RAM seulement (très léger).

**Q : Comment désactiver le démarrage auto ?**  
R : Supprimez le raccourci du dossier Démarrage (`shell:startup`).

**Q : Le proxy empêche-t-il Windows de s'éteindre ?**  
R : Non, Windows l'arrêtera automatiquement.

**Q : Puis-je voir les logs si c'est silencieux ?**  
R : Oui, modifiez `START_PROXY.bat` pour ajouter un fichier log.

---

## 📝 Script d'installation automatique

Je crée un script qui fait tout pour vous ! 👇
