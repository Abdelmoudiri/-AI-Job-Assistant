# Script VBS pour démarrer le proxy en arrière-plan (sans fenêtre)
# Double-cliquez sur ce fichier pour démarrer le proxy silencieusement

Set WshShell = CreateObject("WScript.Shell")

' Chemin vers le script batch
scriptPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
batFile = scriptPath & "\START_PROXY.bat"

' Exécuter le batch en arrière-plan (fenêtre cachée)
WshShell.Run """" & batFile & """", 0, False

' Afficher une notification (optionnel)
WshShell.Popup "Proxy AI Job Assistant démarré sur http://localhost:3002", 3, "Démarrage réussi", 64
