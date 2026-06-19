'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ReadinessItem } from '@/lib/api';

export default function ReadinessPage() {
  const [items, setItems] = useState<ReadinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.releaseReadiness();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load readiness data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const ready = items.filter((i) => i.readiness === 'ready');
  const blocked = items.filter((i) => i.readiness === 'blocked');

  return (
    <section>
      <div className="page-header">
        <div>
          <div className="eyebrow">IT Delivery Workspace</div>
          <h1>Release Readiness</h1>
          <p>See exactly what&apos;s blocking each work item from being ready to release.</p>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <div className="card empty">No active work items. Everything is released, or nothing has been created yet.</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="card">
            <h3>Ready ({ready.length})</h3>
            {ready.length === 0 ? (
              <p>No items are ready for release yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {ready.map((item) => (
                  <div key={item.id} style={{ borderLeft: '3px solid #16a34a', paddingLeft: 12 }}>
                    <Link href={`/pm/it-workspace/${item.id}`} style={{ fontWeight: 700 }}>
                      {item.title}
                    </Link>
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>{item.status} · {item.priority}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3>Blocked ({blocked.length})</h3>
            {blocked.length === 0 ? (
              <p>Nothing is blocked right now.</p>
            ) : (
              <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
                {blocked.map((item) => (
                  <div key={item.id} style={{ borderLeft: '3px solid var(--orange)', paddingLeft: 12 }}>
                    <Link href={`/pm/it-workspace/${item.id}`} style={{ fontWeight: 700 }}>
                      {item.title}
                    </Link>
                    <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 4 }}>{item.status} · {item.priority}</div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: '#b13a00', fontSize: 13 }}>
                      {item.blockers.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}