#!/usr/bin/env pwsh
# Script d'installation automatique du proxy au démarrage de Windows
# Exécutez ce script UNE SEULE FOIS pour installer le démarrage automatique

$ErrorActionPreference = "Stop"

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🚀 Installation Démarrage Automatique du Proxy 🚀        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "📋 Ce script va :" -ForegroundColor Yellow
Write-Host "   1. Créer un fichier de démarrage silencieux" -ForegroundColor White
Write-Host "   2. L'ajouter au dossier Démarrage de Windows" -ForegroundColor White
Write-Host "   3. Tester que tout fonctionne" -ForegroundColor White
Write-Host ""

$response = Read-Host "Voulez-vous continuer ? (o/N)"
if ($response -ne "o" -and $response -ne "O") {
    Write-Host "❌ Installation annulée." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔧 Étape 1 : Vérification des fichiers..." -ForegroundColor Yellow

# Vérifier que les fichiers existent
$scriptDir = $PSScriptRoot
$vbsFile = Join-Path $scriptDir "START_PROXY_SILENT.vbs"
$batFile = Join-Path $scriptDir "START_PROXY.bat"

if (-not (Test-Path $vbsFile)) {
    Write-Host "❌ Fichier START_PROXY_SILENT.vbs introuvable !" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $batFile)) {
    Write-Host "❌ Fichier START_PROXY.bat introuvable !" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Fichiers trouvés" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Étape 2 : Copie dans le dossier Démarrage..." -ForegroundColor Yellow

# Chemin du dossier Démarrage
$startupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$targetFile = Join-Path $startupFolder "AI_Job_Assistant_Proxy.vbs"

try {
    Copy-Item $vbsFile $targetFile -Force
    Write-Host "✓ Fichier copié : $targetFile" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la copie : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Étape 3 : Vérification..." -ForegroundColor Yellow

if (Test-Path $targetFile) {
    Write-Host "✓ Fichier de démarrage installé avec succès !" -ForegroundColor Green
} else {
    Write-Host "❌ Le fichier n'a pas été créé correctement" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🧪 Étape 4 : Test du démarrage..." -ForegroundColor Yellow
Write-Host "   (Le proxy va démarrer maintenant pour tester)" -ForegroundColor Gray

# Démarrer le proxy pour tester
Start-Process -FilePath $targetFile -WindowStyle Hidden

Write-Host "   Attente de 5 secondes..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Tester si le proxy répond
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Proxy démarré et fonctionnel !" -ForegroundColor Green
    Write-Host "   Réponse : $response" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Le proxy ne répond pas encore (normal au premier démarrage)" -ForegroundColor Yellow
    Write-Host "   Vérifiez manuellement dans quelques secondes" -ForegroundColor Gray
}

Write-Host ""
Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              ✅ INSTALLATION TERMINÉE AVEC SUCCÈS ✅          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "📊 Résumé :" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ✅ Le proxy démarrera automatiquement à chaque démarrage Windows" -ForegroundColor Green
Write-Host "   ✅ Aucune fenêtre ne s'ouvrira (démarrage silencieux)" -ForegroundColor Green
Write-Host "   ✅ URL du proxy : http://localhost:3002" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 Prochaines étapes :" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Redémarrez Windows pour tester (optionnel)" -ForegroundColor Cyan
Write-Host "   2. Ou utilisez l'extension immédiatement !" -ForegroundColor Cyan
Write-Host ""

Write-Host "🛠️  Commandes utiles :" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Vérifier si le proxy tourne :" -ForegroundColor White
Write-Host "   Invoke-RestMethod http://localhost:3002" -ForegroundColor Gray
Write-Host ""
Write-Host "   Arrêter le proxy :" -ForegroundColor White
Write-Host "   Stop-Process -Name node -Force" -ForegroundColor Gray
Write-Host ""
Write-Host "   Désinstaller le démarrage auto :" -ForegroundColor White
Write-Host "   Remove-Item '$targetFile'" -ForegroundColor Gray
Write-Host ""

Write-Host "❓ Besoin d'aide ? Consultez GUIDE_DEMARRAGE_AUTO.md" -ForegroundColor Cyan
Write-Host ""

$open = Read-Host "Voulez-vous ouvrir le dossier Démarrage pour voir le fichier ? (o/N)"
if ($open -eq "o" -or $open -eq "O") {
    Start-Process explorer $startupFolder
}

Write-Host ""
Write-Host "✨ Merci d'utiliser AI Job Assistant ! ✨" -ForegroundColor Green
Write-Host ""

Read-Host "Appuyez sur Entrée pour quitter"
