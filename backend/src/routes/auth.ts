import express from 'express';
import { login, register, verifyToken } from '../services/auth';
import { findUserById } from '../services/db';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || String(password).length < 6) {
    return res.status(400).json({ error: '用户名和密码必填，且密码至少 6 位' });
  }
  try {
    const result = await register(String(username).trim(), String(password));
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message || '注册失败' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: '用户名和密码必填' });
  try {
    const result = await login(String(username).trim(), String(password));
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message || '登录失败' });
  }
});

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: '未授权' });
  try {
    const token = auth.slice('Bearer '.length);
    const { userId } = verifyToken(token);
    const user = await findUserById(userId);
    if (!user) return res.status(401).json({ error: '用户不存在' });
    res.json({ id: user.id, username: user.username });
  } catch (e: any) {
    res.status(401).json({ error: '令牌无效' });
  }
});

export default router;

