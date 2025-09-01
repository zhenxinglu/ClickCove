export type AuthResult = { token: string; user: { id: string; username: string } };
export type LinkItem = { id: string; name: string; url: string; desc?: string };

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  register: (username: string, password: string) =>
    request<AuthResult>('/api/register', { method: 'POST', body: JSON.stringify({ username, password }) }),
  login: (username: string, password: string) =>
    request<AuthResult>('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: (token: string) => request<{ id: string; username: string }>('/api/me', {}, token),
  getLinks: (token: string) => request<LinkItem[]>('/api/links', {}, token),
  addLink: (token: string, item: { name: string; url: string; desc?: string }) =>
    request<LinkItem>('/api/links', { method: 'POST', body: JSON.stringify(item) }, token),
  deleteLink: (token: string, id: string) =>
    request<{ ok: true }>(`/api/links/${id}`, { method: 'DELETE' }, token),
};

