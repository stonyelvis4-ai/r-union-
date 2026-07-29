# Structure de la base SMARTREUNION

Base PostgreSQL utilisée par le backend (Prisma).  
Les migrations sont dans `backend/prisma/migrations/` (à appliquer dans l’ordre).

---

## Tables (ordre de création)

### 1. **User**
- `id` (PK, TEXT)
- `email` (UNIQUE)
- `name`, `password_hash`, `role` (enum Role), `is_active`, `created_at`, `updated_at`
- **Rôle** : ADMIN | ORGANIZER | PARTICIPANT

### 2. **Meeting**
- `id` (PK), `title`, `date`, `time`, `location`, `agenda`, `status` (enum MeetingStatus), `owner_id` (FK → User), `qr_token` (UNIQUE), `created_at`, `updated_at`
- **Status** : DRAFT | SCHEDULED | COMPLETED | CANCELLED

### 3. **Participant**
- `id` (PK), `meeting_id` (FK → Meeting), `email`, `display_name`, `created_at`
- **Contrainte** : UNIQUE(meeting_id, email)

### 4. **Attendance**
- `id` (PK), `meeting_id` (FK → Meeting), `scanned_at`, `user_id` (FK → User, nullable), `attendee_name`, `attendee_email`

### 5. **AudioRecording**
- `id` (PK), `meeting_id` (FK → Meeting), `storage_key`, `storage_url`, `duration_seconds`, `status`, `created_at`

### 6. **Transcription**
- `id` (PK), `meeting_id` (FK → Meeting, UNIQUE), `recording_id` (FK → AudioRecording, UNIQUE), `full_text`, `status`, `created_at`, `updated_at`

### 7. **Summary**
- `id` (PK), `meeting_id` (FK → Meeting, UNIQUE), `title`, `meeting_date`, `participants_text`, `discussion_summary`, `key_decisions`, `action_items`, `responsible_persons`, `next_steps`, `generated_at`, `version`

---

## Appliquer les migrations

Avec une base **SMARTREUNION** déjà créée dans pgAdmin :

1. Dans `backend/`, créer un fichier `.env` (voir `.env.example`) avec :
   ```
   DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/SMARTREUNION
   JWT_SECRET=une_cle_secrete_aleatoire
   ```

2. Générer le client Prisma et appliquer les migrations :
   ```bash
   cd backend
   npm install
   npx prisma migrate deploy
   ```
   Ou en développement (crée la base si besoin) :
   ```bash
   npx prisma migrate dev
   ```

3. Vérifier dans pgAdmin : schéma `public`, tables `User`, `Meeting`, `Participant`, `Attendance`, `AudioRecording`, `Transcription`, `Summary` + enums `Role`, `MeetingStatus`.
