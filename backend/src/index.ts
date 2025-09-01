import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import linksRouter from './routes/links';
import { initDB } from './services/db';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', time: new Date().toISOString() });
});

app.use('/api', (_req, _res, next) => { initDB().then(() => next()); });
app.use('/api', authRouter);
app.use('/api/links', linksRouter);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

