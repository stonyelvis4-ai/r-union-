# Corriger le 404 / ENOENT sur le frontend

Si vous voyez « This page could not be found » ou **ENOENT: no such file or directory, open '.next\server\middleware-manifest.json'** :

1. **Arrêtez** le serveur frontend (Ctrl+C dans le terminal où tourne `npm run dev`).
2. Dans un **nouveau** terminal, exécutez depuis le dossier frontend :
   ```powershell
   cd "c:\MES PROJETS\SMARTREUNION\frontend"
   .\relancer-propre.ps1
   ```
   Ce script arrête les processus Node du frontend, supprime le dossier `.next`, puis relance `npm run dev`.
3. Si le script ne peut pas supprimer `.next` (fichiers verrouillés), fermez **tous** les terminaux et Cursor, rouvrez le projet, puis relancez `.\relancer-propre.ps1`.

**Alternative manuelle** : après avoir tout fermé, supprimez le dossier `frontend\.next` à la main (Explorateur Windows), puis dans le terminal `cd frontend` et `npm run dev`.
