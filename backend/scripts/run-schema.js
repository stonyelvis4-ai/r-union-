/**
 * Script pour appliquer le schéma SQL sur la base SMARTREUNION.
 * Usage: node scripts/run-schema.js
 * Nécessite .env avec DATABASE_URL.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL manquant dans .env');
  process.exit(1);
}

const sqlPath = path.join(__dirname, '..', 'prisma', 'APPLIQUER_DANS_PGADMIN.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const client = new Client({ connectionString });

client.connect()
  .then(() => client.query(sql))
  .then(() => {
    console.log('Schéma appliqué avec succès sur la base.');
    return client.end();
  })
  .catch((err) => {
    console.error('Erreur:', err.message);
    client.end().catch(() => {});
    process.exit(1);
  });
