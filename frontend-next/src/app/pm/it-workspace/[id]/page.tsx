'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, WorkItem, QaCheck } from '@/lib/api';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const NEXT_STATUS: Record<string, string[]> = {
  backlog: ['planned'],
  planned: ['in_progress'],
  in_progress: ['qa'],
  qa: ['ready_for_release', 'in_progress'],
  ready_for_release: ['released'],
  released: [],
};

export default function WorkItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  const [checkTitle, setCheckTitle] = useState('');
  const [checkExpected, setCheckExpected] = useState('');
  const [addingCheck, setAddingCheck] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.workItem(id);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load work item');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function transition(status: string) {
    setTransitioning(true);
    setError('');
    try {
      await api.transitionWorkItem(id, status);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transition failed');
    } finally {
      setTransitioning(false);
    }
  }

  async function addCheck(event: React.FormEvent) {
    event.preventDefault();
    setAddingCheck(true);
    setError('');
    try {
      await api.createQaCheck(id, { title: checkTitle, expectedResult: checkExpected });
      setCheckTitle('');
      setCheckExpected('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add QA check');
    } finally {
      setAddingCheck(false);
    }
  }

  async function setCheckStatus(checkId: string, status: string) {
    setError('');
    try {
      await api.updateQaCheck(checkId, { status });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update check');
    }
  }

  async function deleteCheck(checkId: string) {
    setError('');
    try {
      await api.deleteQaCheck(checkId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete check');
    }
  }

const [confirmingDelete, setConfirmingDelete] = useState(false);

    async function removeItem() {
    try {
        await api.deleteWorkItem(id);
        router.push('/pm/it-workspace');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
        setConfirmingDelete(false);
    }
    }

  if (loading) return <p>Loading...</p>;
  if (!item) return <div className="card empty">{error || 'Work item not found'}</div>;

  const allowedNext = NEXT_STATUS[item.status] ?? [];

  return (
    <section>
      <div className="page-header">
        <div>
          <div className="eyebrow">{item.type} · {item.priority}</div>
          <h1>{item.title}</h1>
          <p>{item.description || 'No description provided.'}</p>
        </div>
        <button className="button secondary" onClick={() => setConfirmingDelete(true)}>Delete</button>      </div>

      {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Status: <span className="badge">{item.status}</span></h3>
        <p>Assignee: {item.assignee ?? 'Unassigned'}</p>
        {allowedNext.length > 0 ? (
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {allowedNext.map((s) => (
              <button
                key={s}
                className="button"
                disabled={transitioning}
                onClick={() => transition(s)}
              >
                Move to {s}
              </button>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: 10 }}>This item has reached its final status.</p>
        )}
      </div>

      <div className="card">
        <h3>QA Checks</h3>
        {item.qaChecks && item.qaChecks.length > 0 ? (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Expected</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {item.qaChecks.map((check: QaCheck) => (
                <tr key={check.id}>
                  <td>{check.title}</td>
                  <td>{check.expectedResult}</td>
                  <td><span className="badge">{check.status}</span></td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {check.status !== 'passed' && (
                      <button className="button" onClick={() => setCheckStatus(check.id, 'passed')}>Pass</button>
                    )}
                    {check.status !== 'failed' && (
                      <button className="button secondary" onClick={() => setCheckStatus(check.id, 'failed')}>Fail</button>
                    )}
                    <button className="button secondary" onClick={() => deleteCheck(check.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No QA checks yet. Add one below — at least one must pass before this item can be released.</p>
        )}

        <form onSubmit={addCheck} style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          <div className="field">
            <label>Check title</label>
            <input value={checkTitle} onChange={(e) => setCheckTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label>Expected result</label>
            <input value={checkExpected} onChange={(e) => setCheckExpected(e.target.value)} required />
          </div>
          <button className="button" disabled={addingCheck}>
            {addingCheck ? 'Adding...' : 'Add QA Check'}
          </button>
        </form>
      </div>
        <ConfirmDialog
                open={confirmingDelete}
                title="Delete this work item?"
                message="This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={removeItem}
                onCancel={() => setConfirmingDelete(false)}
            />
    </section>
  );
}