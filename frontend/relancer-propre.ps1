# Nettoyer le cache Next.js et relancer le frontend
# À exécuter dans un NOUVEAU terminal après avoir arrêté le serveur (Ctrl+C)

$frontend = if ($PSScriptRoot) { $PSScriptRoot } else { "c:\MES PROJETS\SMARTREUNION\frontend" }
Set-Location $frontend

Write-Host "Arret des processus Node du frontend..."
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        if ($cmdLine -match "next|SMARTREUNION\\frontend") { $_.Kill(); Write-Host "  Arrete PID $($_.Id)" }
    } catch {}
}
Start-Sleep -Seconds 3

if (Test-Path .next) {
    Write-Host "Suppression ou renommage du cache .next..."
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "Cache .next supprime."
    } catch {
        Write-Host "Suppression impossible, tentative de renommage .next -> .next.bak ..."
        if (Test-Path .next.bak) { Remove-Item -Recurse -Force .next.bak -ErrorAction SilentlyContinue }
        Rename-Item -Path .next -NewName .next.bak -ErrorAction Stop
        Write-Host "Ancien cache renomme en .next.bak. Un nouveau .next sera cree au demarrage."
    }
}

Write-Host "Lancement: npm run dev" -ForegroundColor Green
npm run dev
