import express from 'express';
import { readDB, writeDB, LinkItem } from '../services/db';
import { verifyToken } from '../services/auth';
import crypto from 'crypto';

const router = express.Router();

router.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: '未授权' });
  try {
    const token = auth.slice('Bearer '.length);
    const payload = verifyToken(token);
    (req as any).userId = payload.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: '令牌无效' });
  }
});

router.get('/', async (req, res) => {
  const userId = (req as any).userId as string;
  const db = await readDB();
  const items = db.links[userId] ?? [];
  res.json(items);
});

router.post('/', async (req, res) => {
  const userId = (req as any).userId as string;
  const { name, url, desc } = req.body || {};
  if (!name || !url) return res.status(400).json({ error: 'name 与 url 必填' });
  const db = await readDB();
  const item: LinkItem = {
    id: crypto.randomUUID(),
    name: String(name),
    url: String(url),
    desc: desc ? String(desc) : undefined,
    createdAt: new Date().toISOString(),
  };
  db.links[userId] = db.links[userId] || [];
  db.links[userId].push(item);
  await writeDB(db);
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  const userId = (req as any).userId as string;
  const { id } = req.params;
  const db = await readDB();
  const list = db.links[userId] || [];
  const next = list.filter((x) => x.id !== id);
  db.links[userId] = next;
  await writeDB(db);
  res.json({ ok: true });
});

export default router;

