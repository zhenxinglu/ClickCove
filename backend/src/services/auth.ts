import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { readDB, writeDB, User, findUserByUsername } from '../services/db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export type PublicUser = { id: string; username: string };

function hashPassword(password: string, salt: string) {
  const derived = crypto.scryptSync(password, salt, 64);
  return derived.toString('hex');
}

export async function register(username: string, password: string): Promise<{ user: PublicUser; token: string }>{
  const db = await readDB();
  const exists = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) throw new Error('用户名已被占用');

  const id = crypto.randomUUID();
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const user: User = { id, username, salt, passwordHash, createdAt: new Date().toISOString() };
  db.users.push(user);
  db.links[id] = [];
  await writeDB(db);

  const token = jwt.sign({ sub: id, username }, JWT_SECRET, { expiresIn: '7d' });
  return { user: { id, username }, token };
}

export async function login(username: string, password: string): Promise<{ user: PublicUser; token: string }>{
  const db = await readDB();
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) throw new Error('用户不存在');
  const passwordHash = hashPassword(password, user.salt);
  if (passwordHash !== user.passwordHash) throw new Error('密码不正确');
  const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  return { user: { id: user.id, username: user.username }, token };
}

export function verifyToken(token: string): { userId: string; username: string } {
  const payload = jwt.verify(token, JWT_SECRET) as any;
  return { userId: payload.sub as string, username: payload.username as string };
}

