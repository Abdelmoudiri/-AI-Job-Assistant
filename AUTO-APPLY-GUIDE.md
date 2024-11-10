# 🤖 Guide de l'Assistant de Postulation Automatique

## 📋 Vue d'ensemble

L'assistant IA vous aide à remplir automatiquement les formulaires de candidature en analysant les champs de la page et en générant des réponses personnalisées basées sur votre profil.

## 🚀 Comment utiliser

### 1. Configuration préalable

Avant d'utiliser l'assistant, assurez-vous d'avoir :
- ✅ Configuré votre clé API Gemini (Paramètres ⚙️)
- ✅ Complété votre profil utilisateur (Page Profil)
- ✅ Ajouté votre bio dans "À Propos de Moi"

### 2. Lancer l'assistant

1. Ouvrez le popup de l'extension
2. Trouvez une offre d'emploi intéressante
3. Cliquez sur le bouton **🤖 Postuler** (bouton vert)
4. Une nouvelle page s'ouvre avec l'offre d'emploi
5. L'assistant apparaît automatiquement en bas de la page

### 3. Interface de l'assistant

L'assistant affiche une barre flottante avec :

```
┌─────────────────────────────────────────────────┐
│ 🤖 Assistant IA Postulation                     │
│                                                  │
│ ━━━━━━━━━━━━━━━━━━ 50% ━━━━━━━━━━━━━━━━━━      │
│                                                  │
│ [← Précédent]  [✨ Fill]  [Next →]              │
│                                                  │
│ ℹ️ Prêt à remplir le formulaire                 │
└─────────────────────────────────────────────────┘
```

### 4. Boutons disponibles

#### ✨ Fill (Remplir)
- **Fonction** : Analyse et remplit automatiquement tous les champs détectés
- **Quand l'utiliser** : Sur chaque page du formulaire
- **Ce qu'il remplit** :
  - Emails (votre email du profil)
  - Téléphones (votre numéro)
  - Nom, prénom
  - Lieu/localisation
  - Titre du poste
  - Questions textuelles (génère des réponses avec l'IA)
  - Lettre de motivation (si demandée)

#### ← Précédent
- **Fonction** : Retour à l'étape précédente
- **Note** : Clique sur le bouton "Précédent" du site

#### Next →
- **Fonction** : Passer à l'étape suivante
- **Important** : ⚠️ Vous devez cliquer **manuellement** sur le bouton "Suivant" ou "Continuer" du site
- **Pourquoi** : Pour éviter l'envoi accidentel de candidatures

## 🎯 Champs détectés

L'assistant peut détecter et remplir :

| Type de champ | Exemple | Action |
|--------------|---------|--------|
| **Email** | "Adresse email" | Remplit avec votre email |
| **Téléphone** | "Numéro de téléphone" | Remplit avec votre numéro |
| **Texte** | "Prénom", "Nom" | Remplit selon le label |
| **Zone de texte** | "Parlez-nous de vous" | Génère une réponse IA |
| **Sélection** | "Niveau d'études" | (Remplit si possible) |
| **Cases à cocher** | "Accepter les conditions" | (Manuel) |
| **Boutons radio** | "Disponibilité" | (Manuel) |
| **Fichiers** | "CV (PDF)" | ⚠️ **Notification uniquement** |

## 📝 Génération automatique

### Questions ouvertes
L'IA génère des réponses pour :
- "Pourquoi ce poste ?"
- "Vos compétences principales"
- "Parlez-nous de vous"
- "Pourquoi notre entreprise ?"

**Exemple de réponse générée** :
> Question : "Pourquoi voulez-vous travailler chez nous ?"
> 
> Réponse IA : "Je suis très intéressé par ce poste car il correspond parfaitement à mon expérience en développement web. Votre entreprise est reconnue pour son innovation dans le secteur technologique, ce qui rejoint mes aspirations professionnelles."

### Lettre de motivation
Si le formulaire demande une lettre de motivation :
- L'IA génère une lettre **complète et personnalisée**
- Basée sur votre profil ET l'offre d'emploi
- 250-300 mots professionnels
- Prête à envoyer

## ⚠️ Actions manuelles nécessaires

### Upload de fichiers
Quand l'assistant détecte un champ de fichier :

```
┌────────────────────────────────────────────┐
│ 📎 Action requise                          │
│                                            │
│ Veuillez uploader manuellement :          │
│ • CV (PDF)                                 │
└────────────────────────────────────────────┘
```

**Vous devez** :
1. Cliquer sur "Parcourir" ou "Choose file"
2. Sélectionner votre fichier
3. Attendre l'upload complet

### Navigation entre pages
- L'assistant remplit les champs de **la page actuelle uniquement**
- Après avoir cliqué sur "Fill", **vérifiez** les champs remplis
- **Cliquez manuellement** sur "Suivant" ou "Continuer"
- Sur la nouvelle page, cliquez à nouveau sur "✨ Fill"

## 📊 Barre de progression

La barre indique :
- **0%** : Aucun champ rempli
- **50%** : Moitié des champs remplis
- **100%** : Tous les champs détectés sont remplis

## 💡 Conseils d'utilisation

### ✅ Bonnes pratiques
1. **Vérifiez votre profil** avant de commencer
2. **Lisez les réponses générées** par l'IA (modifiez si nécessaire)
3. **Remplissez d'abord** avec "Fill", puis **ajustez** manuellement
4. **Vérifiez chaque page** avant de cliquer sur "Suivant"
5. **Gardez vos documents** (CV, lettres) prêts pour l'upload

### ❌ À éviter
- ❌ Ne pas cliquer sur "Fill" plusieurs fois d'affilée (attendez la fin)
- ❌ Ne pas naviguer trop vite (laissez l'IA générer les réponses)
- ❌ Ne pas fermer l'assistant (il disparaît si vous rechargez la page)

## 🔧 Dépannage

### L'assistant n'apparaît pas
1. Vérifiez que vous avez cliqué sur le bouton "🤖 Postuler"
2. Attendez 2-3 secondes après l'ouverture de la page
3. Actualisez la page si nécessaire

### Les champs ne se remplissent pas
1. Vérifiez votre **profil** (email, téléphone, bio)
2. Vérifiez votre **clé API Gemini** (Paramètres)
3. Regardez la console du navigateur (F12) pour les erreurs

### Les réponses IA sont de mauvaise qualité
1. **Améliorez votre profil** : Plus de détails = Meilleures réponses
2. **Ajoutez votre bio** : L'IA s'en inspire pour les réponses
3. **Modifiez manuellement** : Personnalisez les réponses générées

### Message "Clé API non configurée"
1. Allez dans **Paramètres** (⚙️)
2. Ajoutez votre clé API Gemini
3. Testez la connexion
4. Réessayez

## 🎓 Exemple d'utilisation complète

### Scénario : Postuler chez Acme Corp

1. **Préparation** (5 min)
   - ✅ Profil complété (email, tél, bio, expérience)
   - ✅ CV et lettre prêts sur le bureau
   - ✅ Clé API configurée

2. **Lancement** (1 min)
   - Ouvrir popup → Trouver "Développeur Web - Acme Corp"
   - Cliquer sur "🤖 Postuler"
   - Page s'ouvre → Assistant apparaît

3. **Page 1 : Informations personnelles** (30 sec)
   - Cliquer sur "✨ Fill"
   - Vérifier : nom, email, téléphone → ✅ Remplis
   - Cliquer **manuellement** sur "Suivant" du site

4. **Page 2 : Expérience professionnelle** (1 min)
   - Cliquer sur "✨ Fill"
   - L'IA remplit : "Parlez de votre expérience" (200 mots)
   - Lire et ajuster si nécessaire
   - Cliquer sur "Suivant"

5. **Page 3 : Documents** (2 min)
   - Notification : "📎 Veuillez uploader : CV"
   - Cliquer sur "Parcourir" → Sélectionner CV
   - Attendre upload → ✅
   - Cliquer sur "Suivant"

6. **Page 4 : Lettre de motivation** (1 min)
   - Cliquer sur "✨ Fill"
   - L'IA génère une lettre complète (300 mots)
   - Lire et personnaliser légèrement
   - Cliquer sur "Envoyer"

**Total : ~10 minutes** (vs 30-40 minutes manuellement)

## 🌟 Fonctionnalités avancées

### Détection intelligente des labels
L'assistant comprend plusieurs variations :
- "Email", "E-mail", "Adresse électronique", "Courriel"
- "Téléphone", "Tél", "Mobile", "Contact"
- "Nom complet", "Prénom Nom", "Identité"

### Génération contextuelle
Les réponses sont personnalisées selon :
- Votre profil (bio, expérience, compétences)
- L'offre d'emploi (titre, entreprise, description)
- Le contexte de la question

### Multi-langues (futur)
Prochainement : Support de l'anglais et de l'arabe

## 📞 Support

### Problèmes courants
- **Erreur API** : Vérifiez votre quota Gemini (gratuit = 60 req/min)
- **Champs non détectés** : Certains sites utilisent des formulaires complexes
- **Navigation bloquée** : Désactivez le bloqueur de popups

### Limites actuelles
- Ne supporte pas les CAPTCHAs (manuel)
- Ne peut pas uploader les fichiers automatiquement
- Fonctionne mieux sur les formulaires standards

---

**Version** : 1.0 (Novembre 2024)  
**Développé avec** : IA Gemini + Chrome Extension API
