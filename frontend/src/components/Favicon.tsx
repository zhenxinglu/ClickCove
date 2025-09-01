import { useMemo, useState } from 'react';

export default function Favicon({ url, size = 20 }: { url: string; size?: number }) {
  const parsed = useMemo(() => {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  }, [url]);

  const host = parsed?.hostname ?? '';
  const origin = parsed?.origin ?? '';

  const sources = useMemo(() => {
    if (!origin) return [] as string[];
    return [
      `${origin}/favicon.ico`,
      `${origin}/favicon.png`,
      `${origin}/apple-touch-icon.png`,
    ];
  }, [origin]);

  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  const src = sources[idx];

  if (!origin || failed || !src) {
    return (
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          background: '#f3f4f6',
          color: '#6b7280',
          fontSize: Math.max(10, Math.floor(size * 0.55)),
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
        title={host}
      >
        {(host[0] || '?').toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      style={{ display: 'inline-block', borderRadius: 4 }}
      onError={() => {
        if (idx + 1 < sources.length) setIdx(idx + 1);
        else setFailed(true);
      }}
    />
  );
}

