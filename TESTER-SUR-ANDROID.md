# Tester l’application sur un téléphone Android

Pour utiliser SmartReunion depuis ton téléphone Android (connexion, réunions, scan QR, etc.), ton PC et le téléphone doivent être sur **le même réseau Wi‑Fi**, et l’app doit appeler l’API sur l’**IP locale** du PC.

---

## 1. Trouver l’IP de ton PC (Windows)

1. Ouvre **Invite de commandes** ou **PowerShell**.
2. Tape :  
   `ipconfig`
3. Repère la section **Carte réseau sans fil Wi‑Fi** (ou **Ethernet** si tu es en filaire).
4. Note l’**Adresse IPv4**, par exemple : `192.168.1.25`  
   On appellera cette valeur `<TON_IP>` dans la suite.

---

## 2. Lancer le backend en mode réseau

Dans un terminal, à la racine du projet :

```bash
cd backend
npm run dev
```

Le backend écoute déjà sur toutes les interfaces (`0.0.0.0`), donc il sera joignable depuis le téléphone à l’adresse `http://<TON_IP>:4000`.

---

## 3. Lancer le frontend en mode « mobile »

Dans un **autre** terminal :

```bash
cd frontend
npm run dev:mobile
```

Cela lance Next.js avec `-H 0.0.0.0` pour qu’il soit accessible depuis le téléphone à `http://<TON_IP>:3000`.

---

## 4. Configurer l’URL de l’API pour le téléphone

Le navigateur du téléphone doit appeler l’API sur l’IP du PC, pas sur `localhost`.

**Option A – Fichier d’environnement (recommandé)**

1. Crée ou modifie `frontend/.env.local`.
2. Remplace `<TON_IP>` par ton adresse (ex. `192.168.1.25`) :

```env
NEXT_PUBLIC_API_URL=http://<TON_IP>:4000/api
```

Exemple :

```env
NEXT_PUBLIC_API_URL=http://192.168.1.25:4000/api
```

**Pour que le lien dans le QR code soit toujours en IP** (ex. `http://192.168.1.25:3000/meetings/xxx`) même quand tu consultes la page depuis `localhost`, ajoute aussi :

```env
NEXT_PUBLIC_APP_URL=http://192.168.1.25:3000
```

(Remplace `192.168.1.25` par ton IP.) Ainsi, le QR code pointera toujours vers cette URL, que tu sois sur PC ou téléphone.

3. **Redémarre** le serveur frontend (`npm run dev:mobile`) après avoir modifié `.env.local`.

**Option B – Même PC pour dev et test**

Si tu testes en ouvrant d’abord `http://localhost:3000` sur le PC puis que tu passes sur le téléphone, il faut quand même que le téléphone utilise l’IP du PC. Donc définir `NEXT_PUBLIC_API_URL` avec l’IP comme ci‑dessus est nécessaire pour le téléphone.

---

## 5. Autoriser les ports dans le pare-feu Windows (si ça ne charge pas)

Si la page ne s’ouvre pas sur le téléphone :

1. **Paramètres Windows** → **Pare-feu et protection réseau** → **Paramètres avancés**.
2. **Règles de trafic entrant** → **Nouvelle règle**.
3. Choisir **Port** → **TCP** → ports **3000** et **4000** → Autoriser la connexion → Nommer par ex. « SmartReunion dev ».

Ou en PowerShell (en administrateur) :

```powershell
New-NetFirewallRule -DisplayName "SmartReunion Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "SmartReunion Backend"  -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow
```

---

## 6. Ouvrir l’app sur le téléphone Android

1. Connecte le téléphone au **même Wi‑Fi** que le PC.
2. Ouvre **Chrome** (ou un autre navigateur).
3. Dans la barre d’adresse, va sur :  
   `http://<TON_IP>:3000`  
   Exemple : `http://192.168.1.25:3000`.
4. Tu devrais voir la page d’accueil / connexion de SmartReunion. Tu peux te connecter, créer des réunions, scanner le QR code, etc.

---

## Résumé des commandes

| Où       | Commande |
|----------|----------|
| Backend  | `cd backend && npm run dev` |
| Frontend | `cd frontend && npm run dev:mobile` |

**Sur le téléphone :** `http://<TON_IP>:3000`  
**Variable obligatoire pour le téléphone :** `NEXT_PUBLIC_API_URL=http://<TON_IP>:4000/api` dans `frontend/.env.local`.

Si l’IP de ton PC change (redémarrage du box, autre Wi‑Fi), refais un `ipconfig` et mets à jour `NEXT_PUBLIC_API_URL` puis redémarre le frontend.
