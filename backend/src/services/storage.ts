/**
 * Storage service for audio files.
 * Default: local filesystem (./uploads). Set STORAGE_PROVIDER=s3 and S3_* env for S3.
 */
import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { getEnv } from '../config/env.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

export async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function uploadBuffer(
  buffer: Buffer,
  meetingId: string,
  extension = 'webm'
): Promise<{ key: string; url: string }> {
  const key = `${meetingId}/${randomBytes(12).toString('hex')}.${extension}`;
  const env = getEnv();
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    const response = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${env.SUPABASE_STORAGE_BUCKET}/${key}`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': `audio/${extension}`,
        'x-upsert': 'false',
      },
      body: buffer,
    });
    if (!response.ok) throw new Error(`Supabase Storage upload failed: ${response.status}`);
    return { key, url: '' };
  }

  await ensureUploadDir();
  const fullPath = path.join(UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);
  const url = `/uploads/${key}`;
  return { key, url };
}

export async function getFileStream(key: string): Promise<{ path: string } | null> {
  const fullPath = path.join(UPLOAD_DIR, key);
  try {
    await fs.access(fullPath);
    return { path: fullPath };
  } catch {
    return null;
  }
}

export async function getFileBuffer(key: string): Promise<Buffer | null> {
  const env = getEnv();
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    const response = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${env.SUPABASE_STORAGE_BUCKET}/${key}`, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  }
  try {
    return await fs.readFile(path.join(UPLOAD_DIR, key));
  } catch {
    return null;
  }
}
