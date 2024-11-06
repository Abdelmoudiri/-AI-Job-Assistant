# Script de configuration automatique pour l'extension AI Job Assistant
# Usage: ./setup-gratuit.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Configuration API GRATUITE" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si la clé existe déjà
$existingKey = $Env:GEMINI_API_KEY
if ($existingKey) {
    Write-Host "✓ Clé API déjà configurée : $($existingKey.Substring(0, [Math]::Min(10, $existingKey.Length)))..." -ForegroundColor Green
    $continue = Read-Host "Voulez-vous la remplacer ? (o/N)"
    if ($continue -ne "o" -and $continue -ne "O") {
        Write-Host "Configuration annulée." -ForegroundColor Yellow
        exit
    }
}

Write-Host ""
Write-Host "🎯 Étape 1 : Obtenir votre clé API GRATUITE" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Ouvrez ce lien dans votre navigateur :"
Write-Host "      https://aistudio.google.com/app/apikey" -ForegroundColor Cyan
Write-Host ""
Write-Host "   2. Connectez-vous avec votre compte Google"
Write-Host ""
Write-Host "   3. Cliquez sur 'Create API Key' (ou 'Get API key')"
Write-Host ""
Write-Host "   4. Copiez la clé générée (commence par 'AIza...')"
Write-Host ""

# Demander la clé
$apiKey = Read-Host "Collez votre clé API ici"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ Aucune clé fournie. Configuration annulée." -ForegroundColor Red
    exit
}

if (-not $apiKey.StartsWith("AIza")) {
    Write-Host "⚠️  Attention : La clé ne commence pas par 'AIza'. Êtes-vous sûr ?" -ForegroundColor Yellow
    $continue = Read-Host "Continuer quand même ? (o/N)"
    if ($continue -ne "o" -and $continue -ne "O") {
        exit
    }
}

Write-Host ""
Write-Host "🔧 Configuration en cours..." -ForegroundColor Yellow

# Définir les variables d'environnement pour la session actuelle
$Env:GEMINI_API_KEY = $apiKey
$Env:PORT = "3001"
$Env:DEBUG_PROXY = "1"

Write-Host "✓ Variables d'environnement configurées (session actuelle)" -ForegroundColor Green

# Proposer de sauvegarder de façon persistante
Write-Host ""
$savePersistent = Read-Host "Voulez-vous sauvegarder la clé de façon permanente ? (o/N)"
if ($savePersistent -eq "o" -or $savePersistent -eq "O") {
    [Environment]::SetEnvironmentVariable("GEMINI_API_KEY", $apiKey, "User")
    Write-Host "✓ Clé sauvegardée dans les variables d'environnement utilisateur" -ForegroundColor Green
}

Write-Host ""
Write-Host "🧪 Test de la clé..." -ForegroundColor Yellow

# Tester la clé
$testUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$apiKey"
$testBody = @{
    contents = @(
        @{
            parts = @(
                @{ text = "Bonjour" }
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri $testUrl -Method Post -Body $testBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ Clé API valide ! Test réussi." -ForegroundColor Green
    Write-Host "   Réponse du modèle : $($response.candidates[0].content.parts[0].text)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur lors du test de la clé :" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Vérifiez que :" -ForegroundColor Yellow
    Write-Host "   1. La clé est correcte (sans espaces)" -ForegroundColor Yellow
    Write-Host "   2. Vous avez bien créé la clé sur https://aistudio.google.com/" -ForegroundColor Yellow
    Write-Host "   3. Votre connexion Internet fonctionne" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Voulez-vous continuer malgré l'erreur ? (o/N)"
    if ($continue -ne "o" -and $continue -ne "O") {
        exit
    }
}

Write-Host ""
Write-Host "🚀 Démarrage du proxy..." -ForegroundColor Yellow
Write-Host ""

# Vérifier que le dossier server existe
$serverPath = Join-Path $PSScriptRoot "server"
if (-not (Test-Path $serverPath)) {
    Write-Host "❌ Le dossier 'server' n'existe pas à : $serverPath" -ForegroundColor Red
    exit
}

# Vérifier que node_modules existe
$nodeModulesPath = Join-Path $serverPath "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "⚠️  node_modules non trouvé. Installation des dépendances..." -ForegroundColor Yellow
    Set-Location $serverPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  ✓ Configuration terminée !" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pour démarrer le proxy :" -ForegroundColor Cyan
Write-Host "  cd server" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Puis dans votre extension Chrome :" -ForegroundColor Cyan
Write-Host "  1. Ouvrez la page de configuration" -ForegroundColor White
Write-Host "  2. Entrez l'URL du proxy : http://localhost:3001" -ForegroundColor White
Write-Host "  3. Cliquez sur 'Tester le modèle'" -ForegroundColor White
Write-Host ""

# Proposer de démarrer le proxy
$startProxy = Read-Host "Voulez-vous démarrer le proxy maintenant ? (o/N)"
if ($startProxy -eq "o" -or $startProxy -eq "O") {
    Set-Location $serverPath
    Write-Host ""
    Write-Host "Démarrage du proxy sur http://localhost:3001..." -ForegroundColor Green
    Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow
    Write-Host ""
    npm start
}
