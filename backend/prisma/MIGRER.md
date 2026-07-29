# Appliquer la structure à la base SMARTREUNION

Deux options possibles.

---

## Option A : Prisma Migrate (recommandé si la connexion fonctionne)

1. Vérifier que PostgreSQL est démarré et que la base **SMARTREUNION** existe (utilisateur : postgres).
2. Le fichier `backend/.env` contient déjà :
   ```
   DATABASE_URL=postgresql://postgres:0797186095@localhost:5432/SMARTREUNION
   ```
   Si votre mot de passe ou l’hôte est différent, modifiez cette ligne.
3. Dans un terminal :
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
4. Si vous voyez **Authentication failed** : vérifiez le mot de passe dans pgAdmin, que le serveur PostgreSQL écoute sur `localhost:5432`, et que l’utilisateur `postgres` a le droit de se connecter en « Password ».

---

## Option B : Exécuter le SQL dans pgAdmin

Si `prisma migrate deploy` ne peut pas se connecter :

1. Ouvrir **pgAdmin** et vous connecter au serveur PostgreSQL.
2. Sélectionner la base **SMARTREUNION**.
3. Clic droit sur la base → **Query Tool** (ou Outil de requête).
4. Ouvrir le fichier `backend/prisma/APPLIQUER_DANS_PGADMIN.sql` dans un éditeur de texte, copier tout le contenu et le coller dans la fenêtre de requête.
5. Exécuter (bouton Play / F5).
6. Vérifier dans **Schemas → public → Tables** que les tables **User**, **Meeting**, **Participant**, **Attendance**, **AudioRecording**, **Transcription**, **Summary** sont présentes.

**Important** : après avoir appliqué le script SQL à la main, Prisma ne saura pas que les migrations ont été exécutées. Pour éviter que `prisma migrate deploy` ne tente de les réappliquer plus tard, vous pouvez soit ne plus utiliser `migrate deploy` sur cette base, soit marquer les migrations comme appliquées (avancé).

---

## Vérifier que tout fonctionne

Après avoir créé les tables (Option A ou B) :

```bash
cd backend
npm run dev
```

Puis créer un utilisateur via l’API (inscription) ou en insérant un enregistrement dans la table **User** pour vous connecter à l’application.
