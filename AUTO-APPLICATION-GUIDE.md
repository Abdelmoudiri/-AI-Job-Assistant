# 🤖 Auto-Application - Guide d'utilisation

## Vue d'ensemble

La fonctionnalité **Auto-Application** permet de postuler 10x plus rapidement en automatisant le remplissage des formulaires et la génération d'emails de candidature.

## Fonctionnalités

### 1. 🤖 Remplissage Automatique des Formulaires

**Comment ça marche :**
- Détecte automatiquement les champs de formulaire sur les pages de candidature
- Remplit automatiquement : nom, email, téléphone, ville, message de motivation
- Utilise les informations de votre profil utilisateur

**Comment l'utiliser :**

1. **Remplissez votre profil** (important !)
   - Cliquez sur l'icône 👤 dans l'extension
   - Complétez vos informations : nom, email, téléphone, ville, compétences, bio

2. **Sur une page de candidature :**
   - Un bouton flottant **"🤖 Remplir automatiquement"** apparaît en bas à droite
   - Cliquez dessus pour remplir tous les champs en 1 clic
   - Vérifiez les informations et soumettez le formulaire

3. **Depuis le popup de l'extension :**
   - Ouvrez le popup sur une page de candidature
   - Cliquez sur le bouton **"🤖 Auto-Fill"** sur l'offre souhaitée
   - Les champs sont remplis automatiquement

### 2. ✉️ Génération d'Email de Candidature

**Comment ça marche :**
- Génère un email professionnel personnalisé
- Inclut : objet, corps du message avec vos compétences
- Copie automatiquement dans le presse-papier

**Comment l'utiliser :**

1. **Sur une page d'offre d'emploi :**
   - Un bouton flottant **"✉️ Générer Email"** apparaît
   - Cliquez dessus
   - L'email est généré et copié automatiquement
   - Collez-le (Ctrl+V) dans votre client email

2. **Personnalisation :**
   - L'email utilise vos infos de profil
   - Mentionne le titre du poste et l'entreprise
   - Liste vos 8 meilleures compétences

## Champs Détectés Automatiquement

L'extension remplit intelligemment :

| Type de champ | Exemples détectés |
|---------------|-------------------|
| **Nom** | input[name="name"], input[placeholder="nom"] |
| **Email** | input[type="email"], input[name="email"] |
| **Téléphone** | input[type="tel"], input[name="phone"] |
| **Ville** | input[name="city"], input[name="location"] |
| **Message** | textarea[name="message"], textarea[name="motivation"] |

## Sites Compatibles

✅ **Fonctionne sur tous les sites** (http:// et https://)
- Indeed.ma, Indeed.com
- Rekrute.com
- LinkedIn
- Sites d'entreprises
- Plateformes de recrutement
- Formulaires Google Forms

## Configuration Requise

### Étape 1 : Remplir votre profil

```
👤 Profil → Remplir toutes les sections :
├── Informations personnelles
│   ├── Nom complet
│   ├── Email
│   ├── Téléphone
│   └── Localisation
├── Expérience
│   ├── Niveau (Junior/Confirmé/Senior)
│   └── Titre de poste actuel
├── Compétences
│   ├── Sélectionner les catégories
│   └── Ajouter compétences personnalisées
└── Bio / Présentation
    └── Court paragraphe de motivation
```

### Étape 2 : Activer les permissions

L'extension demande :
- ✅ `clipboardWrite` : Pour copier les emails générés
- ✅ `activeTab` : Pour remplir les formulaires sur la page active

## Exemple d'Email Généré

```
Objet: Candidature - Développeur Full Stack chez TechCorp

Bonjour,

Je me permets de vous contacter suite à votre offre d'emploi pour le poste de Développeur Full Stack.

Passionné par le développement et fort de plusieurs années d'expérience, 
je suis convaincu que mon profil correspond parfaitement à vos attentes.

Mes compétences principales :
• JavaScript
• React
• Node.js
• PHP
• MySQL
• Git
• Docker
• Agile

Disponible immédiatement, je serais ravi d'échanger avec vous concernant cette opportunité.

Vous trouverez mon CV en pièce jointe.

Cordialement,
[Votre Nom]
[Votre téléphone]
[Votre email]
```

## Astuces Pro 💡

### 1. Remplissage intelligent
- Vérifiez toujours les champs remplis avant de soumettre
- Certains sites peuvent avoir des champs spécifiques non détectés
- Complétez manuellement les champs manquants (CV, portfolio, etc.)

### 2. Personnalisation
- Modifiez votre bio régulièrement selon le type de poste visé
- Adaptez vos compétences mises en avant
- Utilisez le champ "bio" pour un pitch personnalisé

### 3. Gain de temps
- Ouvrez plusieurs onglets d'offres
- Utilisez Auto-Fill sur chaque onglet
- Validez et soumettez en série

### 4. Email professionnel
- L'email généré est un modèle de base
- Personnalisez-le davantage si nécessaire
- Ajoutez des détails spécifiques à l'entreprise

## Notifications Visuelles

L'extension affiche des notifications :
- ✅ **Vert** : Succès (champs remplis, email copié)
- ⚠️ **Orange** : Attention (profil manquant)
- ❌ **Rouge** : Erreur (échec)

## Limitations Actuelles

⚠️ **Ce qui N'EST PAS automatisé :**
- Upload de CV (nécessite sélection manuelle de fichier)
- Captchas et validations humaines
- Questions spécifiques de l'employeur
- Envoi automatique du formulaire (soumission manuelle requise)

## Feuille de Route (Futures Améliorations)

### Version 2.0 (À venir)
- 📧 Envoi d'email direct depuis l'extension
- 📎 Gestion de CV (stockage et upload)
- 🎯 Détection intelligente de questions spécifiques
- 📊 Statistiques de candidatures

### Version 3.0 (Futur)
- 🤖 IA pour réponses personnalisées aux questions
- 🔄 Auto-soumission des formulaires (avec confirmation)
- 📈 Tracking des candidatures envoyées
- 💼 Gestion de plusieurs profils (par type de poste)

## Support & Questions

Pour toute question ou problème :
1. Vérifiez que votre profil est bien rempli
2. Rechargez l'extension (chrome://extensions)
3. Testez sur une page de formulaire simple d'abord
4. Consultez la console (F12) pour voir les logs

## Sécurité & Confidentialité

🔒 **Vos données restent privées :**
- Toutes les informations sont stockées localement
- Aucune donnée n'est envoyée à des serveurs externes
- Le remplissage se fait uniquement dans votre navigateur
- Vous contrôlez quelles informations sont utilisées

---

**Bonne chance dans vos candidatures ! 🚀**
