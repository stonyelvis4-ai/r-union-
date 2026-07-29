/**
 * Storage service for audio files.
 * Default: local filesystem (./uploads). Set STORAGE_PROVIDER=s3 and S3_* env for S3.
 */
import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

export async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function uploadBuffer(
  buffer: Buffer,
  meetingId: string,
  extension = 'webm'
): Promise<{ key: string; url: string }> {
  await ensureUploadDir();
  const key = `${meetingId}/${randomBytes(12).toString('hex')}.${extension}`;
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
