import { useEffect, useState } from 'react';
import { api, LinkItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Favicon from './Favicon';

export default function LinkManager() {
  const { token } = useAuth();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', url: '', desc: '' });

  useEffect(() => {
    if (!token) return;
    api.getLinks(token)
      .then(setLinks)
      .catch((e) => setError(String(e)));
  }, [token]);

  async function addLink() {
    try {
      if (!token) return;
      if (!form.name || !form.url) return;
      const created = await api.addLink(token, { name: form.name, url: form.url, desc: form.desc || undefined });
      setLinks((prev) => [created, ...prev]);
      setForm({ name: '', url: '', desc: '' });
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove(id: string) {
    if (!token) return;
    await api.deleteLink(token, id);
    setLinks((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} style={{ minWidth: 240 }} />
        <input placeholder="描述(可选)" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
        <button onClick={addLink}>添加</button>
      </div>
      {error && <p style={{ color: 'crimson', marginTop: 8 }}>{error}</p>}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
        marginTop: 16,
      }}>
        {links.map((item) => (
          <div key={item.id} style={{
            padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#111827', textDecoration: 'none' }}>
                <Favicon url={item.url} size={20} />
                <div style={{ fontWeight: 600 }}>{item.name}</div>
              </a>
              <button onClick={() => remove(item.id)} style={{ color: '#b91c1c' }}>删除</button>
            </div>
            {item.desc && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{item.desc}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

