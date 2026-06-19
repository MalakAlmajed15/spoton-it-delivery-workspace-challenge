'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {api, WorkItem} from '@/lib/api';

const STATUS_OPTIONS = ['backlog','planned', 'in_progress','qa' ,'ready_for_release', 'released'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
const TYPE_OPTIONS = ['feature', 'bug', 'chore', 'request'];

export default function ItWorkspacePage() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('feature');
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.workItems(statusFilter ? {status: statusFilter} : undefined);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load work items');
    } finally {
      setLoading(false);
    }
  } 

  useEffect(() => {
    load();
  }, [statusFilter]);
  
  async function createItem(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.createWorkItem({
        title,
        description: description || undefined,
        type,
        priority,
        assignee: assignee || undefined,
      });
      setTitle('');
      setDescription('');
      setAssignee('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create work item');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <div className="eyebrow">IT Delivery Workspace</div>
          <h1>Work Items</h1>
          <p>Track requests through planning, development, QA, and release.</p>
        </div>
        <button className="button" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New Work Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createItem} className="card" style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="field">
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Assignee</label>
              <input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <button className="button" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Work Item'}
          </button>
        </form>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 700, marginRight: 10 }}>Filter by status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error && items.length === 0 ? (
        <div className="card empty">{error}</div>
      ) : items.length === 0 ? (
        <div className="card empty">No work items yet. Create your first one above.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link href={`/pm/it-workspace/${item.id}`} style={{ fontWeight: 700, color: 'var(--orange)' }}>
                    {item.title}
                  </Link>
                </td>
                <td>{item.type}</td>
                <td><span className="badge">{item.status}</span></td>
                <td>{item.priority}</td>
                <td>{item.assignee ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}