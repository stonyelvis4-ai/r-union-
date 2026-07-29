/**
 * Crée des comptes de démonstration pour tester l'application.
 * Usage: node scripts/seed-users.js
 * Nécessite backend/.env avec DATABASE_URL.
 *
 * Mot de passe commun pour tous les comptes : Demo123!
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const SALT_ROUNDS = 10;

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Fichier .env introuvable dans backend/');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL manquant dans .env');
  process.exit(1);
}

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Demo123!';

const users = [
  {
    email: 'admin@demo.local',
    name: 'Admin Demo',
    role: 'ADMIN',
    password: DEMO_PASSWORD,
  },
  {
    email: 'organizer@demo.local',
    name: 'Organisateur Demo',
    role: 'ADMIN',
    password: DEMO_PASSWORD,
  },
  {
    email: 'participant@demo.local',
    name: 'Participant Demo',
    role: 'PARTICIPANT',
    password: DEMO_PASSWORD,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log('Déjà existant (ignoré):', u.email);
      continue;
    }
    await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
      },
    });
    console.log('Créé:', u.email, `(${u.role})`);
  }

  console.log('\n--- Comptes de démonstration ---');
  console.log('Mot de passe commun :', DEMO_PASSWORD);
  console.log('');
  console.log('  admin@demo.local       (Admin)');
  console.log('  organizer@demo.local   (Organisateur)');
  console.log('  participant@demo.local (Participant)');
  console.log('\nVoir scripts/COMPTES-DEMO.md pour le détail.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
