#!/usr/bin/env pwsh
# Script de démarrage automatique du proxy Gemini
# Double-cliquez sur ce fichier pour lancer le proxy !

$ErrorActionPreference = "Stop"

Write-Host @"

╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     🚀 AI Job Assistant - Démarrage du Proxy 🚀      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "📍 Configuration..." -ForegroundColor Yellow
Write-Host ""

# Configuration
$API_KEY = "VOTRE_API_KEY_ICI"
$PORT = 3002
$SERVER_PATH = Join-Path $PSScriptRoot "server"

# Vérifier que le dossier server existe
if (-not (Test-Path $SERVER_PATH)) {
    Write-Host "❌ Erreur : Le dossier 'server' n'existe pas !" -ForegroundColor Red
    Write-Host "   Chemin attendu : $SERVER_PATH" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Définir les variables d'environnement
$Env:GEMINI_API_KEY = $API_KEY
$Env:PORT = $PORT

Write-Host "✓ API Key configurée : $($API_KEY.Substring(0, 10))..." -ForegroundColor Green
Write-Host "✓ Port configuré : $PORT" -ForegroundColor Green
Write-Host ""

# Vérifier Node.js
Write-Host "🔍 Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js détecté : $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé !" -ForegroundColor Red
    Write-Host "   Téléchargez-le sur : https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}
Write-Host ""

# Vérifier les dépendances
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow
Set-Location $SERVER_PATH

if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Dépendances manquantes, installation en cours..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour quitter"
        exit 1
    }
    Write-Host "✓ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "✓ Dépendances déjà installées" -ForegroundColor Green
}
Write-Host ""

# Vérifier si le port est disponible
Write-Host "🔌 Vérification du port $PORT..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort $PORT -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Le port $PORT est déjà utilisé" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous arrêter le processus existant ? (o/N)"
    if ($response -eq "o" -or $response -eq "O") {
        $pid = $portInUse.OwningProcess | Select-Object -First 1
        Stop-Process -Id $pid -Force
        Write-Host "✓ Processus arrêté" -ForegroundColor Green
        Start-Sleep -Seconds 1
    } else {
        Write-Host "ℹ️  Tentative sur un autre port..." -ForegroundColor Cyan
        $PORT = 3003
        $Env:PORT = $PORT
        Write-Host "✓ Utilisation du port $PORT" -ForegroundColor Green
    }
}
Write-Host ""

# Test rapide de l'API
Write-Host "🧪 Test de l'API key..." -ForegroundColor Yellow
$testBody = @{
    contents = @(@{
        parts = @(@{ text = "Test" })
    })
} | ConvertTo-Json -Depth 10

try {
    $testResponse = Invoke-RestMethod `
        -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$API_KEY" `
        -Method Post `
        -Body $testBody `
        -ContentType "application/json" `
        -TimeoutSec 10 `
        -ErrorAction Stop
    Write-Host "✓ API Key valide !" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du test de l'API :" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  Le proxy démarrera quand même, mais vérifiez votre clé API" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}
Write-Host ""

# Démarrer le serveur
Write-Host @"

╔═══════════════════════════════════════════════════════╗
║                                                       ║
║              🎉 Démarrage du proxy... 🎉             ║
║                                                       ║
║   URL : http://localhost:$PORT                        ║
║                                                       ║
║   Appuyez sur Ctrl+C pour arrêter                    ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "📊 Logs du serveur :" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Lancer le serveur
npm start

# Si on arrive ici, c'est que le serveur s'est arrêté
Write-Host ""
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "🛑 Proxy arrêté" -ForegroundColor Yellow
Read-Host "Appuyez sur Entrée pour quitter"
