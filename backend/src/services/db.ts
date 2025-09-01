import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

export type LinkItem = {
  id: string;
  name: string;
  url: string;
  desc?: string;
  createdAt: string;
};

export type DB = {
  users: User[];
  links: Record<string, LinkItem[]>; // userId -> links
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

export async function initDB() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DB_PATH);
  } catch {
    const initial: DB = { users: [], links: {} };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

export async function readDB(): Promise<DB> {
  await initDB();
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DB;
}

export async function writeDB(db: DB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const db = await readDB();
  return db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export async function findUserById(id: string): Promise<User | undefined> {
  const db = await readDB();
  return db.users.find((u) => u.id === id);
}

