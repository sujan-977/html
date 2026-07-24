import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

async function ensureData() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await ensureFile(USERS_FILE);
  await ensureFile(BOOKINGS_FILE);
}

async function ensureFile(file) {
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, '[]\n');
  }
}

export async function readJson(file) {
  await ensureData();
  const filePath = file === 'users' ? USERS_FILE : BOOKINGS_FILE;
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content || '[]');
}

export async function writeJson(file, data) {
  await ensureData();
  const filePath = file === 'users' ? USERS_FILE : BOOKINGS_FILE;
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, expected] = stored.split(':');
  const actual = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), actual);
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}
