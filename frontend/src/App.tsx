type LinkItem = { name: string; url: string; desc?: string };

const PRESET_LINKS: LinkItem[] = [
  { name: 'Google', url: 'https://www.google.com', desc: '搜索' },
  { name: 'GitHub', url: 'https://github.com', desc: '代码托管' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: '技术问答' },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', desc: 'Web 文档' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org', desc: '百科' },
  { name: 'Bing', url: 'https://www.bing.com', desc: '搜索' },
];

import Favicon from './components/Favicon';
import { useAuth } from './context/AuthContext';
import LinkManager from './components/LinkManager';
import { useState } from 'react';

export default function App() {
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (mode === 'login') await login(form.username, form.password);
      else await register(form.username, form.password);
      setForm({ username: '', password: '' });
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, lineHeight: 1.5 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>ClickCove</h1>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>你好，{user.username}</span>
            <button onClick={logout}>退出</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
              <option value="login">登录</option>
              <option value="register">注册</option>
            </select>
            <input placeholder="用户名" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input placeholder="密码" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="submit">{mode === 'login' ? '登录' : '注册'}</button>
            {error && <span style={{ color: 'crimson' }}>{error}</span>}
          </form>
        )}
      </div>

      {user ? (
        <section style={{ marginTop: 16 }}>
          <h2>我的链接</h2>
          <LinkManager />
        </section>
      ) : (
        <section style={{ marginTop: 16 }}>
          <h2>默认链接</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
              marginTop: 12,
            }}
          >
            {PRESET_LINKS.map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '12px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: '#111827',
                  background: '#fff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Favicon url={item.url} size={20} />
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                </div>
                {item.desc && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{item.desc}</div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
