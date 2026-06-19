'use client';

import { useEffect, useState } from 'react';
import { api, Release, WorkItem } from '@/lib/api';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [readyItems, setReadyItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [version, setVersion] = useState('');
  const [summary, setSummary] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
const [deployTarget, setDeployTarget] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [rel, items] = await Promise.all([
        api.releases(),
        api.workItems({ status: 'ready_for_release' }),
      ]);
      setReleases(rel);
      setReadyItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load releases');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createRelease(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.createRelease({ version, summary: summary || undefined });
      setVersion('');
      setSummary('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create release');
    } finally {
      setSubmitting(false);
    }
  }

  async function addItem(releaseId: string) {
    const workItemId = selectedItems[releaseId];
    if (!workItemId) return;
    setError('');
    try {
      await api.addWorkItemToRelease(releaseId, workItemId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  }

  async function removeItem(releaseId: string, workItemId: string) {
    setError('');
    try {
      await api.removeWorkItemFromRelease(releaseId, workItemId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  }

    async function deploy(releaseId: string) {
    setError('');
    try {
        await api.deployRelease(releaseId);
        load();
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to deploy');
    } finally {
        setDeployTarget(null);
    }
    }

  return (
    <section>
      <div className="page-header">
        <div>
          <div className="eyebrow">IT Delivery Workspace</div>
          <h1>Releases</h1>
          <p>Group ready work items into a release, then deploy.</p>
        </div>
        <button className="button" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New Release'}
        </button>
      </div>

      {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

      {showForm && (
        <form onSubmit={createRelease} className="card" style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          <div className="field">
            <label>Version (e.g. v1.0.0)</label>
            <input value={version} onChange={(e) => setVersion(e.target.value)} required />
          </div>
          <div className="field">
            <label>Summary</label>
            <input value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <button className="button" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Release'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : releases.length === 0 ? (
        <div className="card empty">No releases yet. Create one above.</div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {releases.map((release) => (
            <div key={release.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3>{release.version} <span className="badge">{release.status}</span></h3>
                  <p>{release.summary || 'No summary'}</p>
                </div>
                {release.status !== 'deployed' && (
                <button className="button" onClick={() => setDeployTarget(release.id)}>
                    Deploy
                </button>
                )}
              </div>

              <table className="table" style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>Work Item</th>
                    <th>Status</th>
                    {release.status !== 'deployed' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {release.releaseItems.length === 0 ? (
                    <tr><td colSpan={3}>No items linked yet.</td></tr>
                  ) : (
                    release.releaseItems.map((ri) => (
                      <tr key={ri.id}>
                        <td>{ri.workItem.title}</td>
                        <td><span className="badge">{ri.workItem.status}</span></td>
                        {release.status !== 'deployed' && (
                          <td>
                            <button className="button secondary" onClick={() => removeItem(release.id, ri.workItemId)}>
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {release.status !== 'deployed' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <select
                    value={selectedItems[release.id] ?? ''}
                    onChange={(e) => setSelectedItems((s) => ({ ...s, [release.id]: e.target.value }))}
                  >
                    <option value="">Select a ready work item...</option>
                    {readyItems.map((item) => (
                      <option key={item.id} value={item.id}>{item.title}</option>
                    ))}
                  </select>
                  <button className="button secondary" onClick={() => addItem(release.id)}>
                    Add to Release
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={deployTarget !== null}
        title="Deploy this release?"
        message="Linked work items will be marked as released. This cannot be undone."
        confirmLabel="Deploy"
        onConfirm={() => deployTarget && deploy(deployTarget)}
        onCancel={() => setDeployTarget(null)}
      />
    </section>
  );
}