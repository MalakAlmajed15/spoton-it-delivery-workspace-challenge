'use client';

import { useEffect, useState } from 'react';
import { api, WorkItem, WorkspaceSummary } from '@/lib/api';

export default function ItWorkspacePage() {
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.workspaceSummary(), api.workItems()])
      .then(([nextSummary, nextItems]) => {
        setSummary(nextSummary);
        setItems(nextItems);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load workspace'));
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <div className="eyebrow">IT Delivery Workspace</div>
          <h1>Build the software delivery workflow</h1>
          <p>
            Starter shell for request, planning, development, QA, release, and follow-up. The real workflow is intentionally incomplete.
          </p>
        </div>
        <span className="badge">2-day challenge</span>
      </div>

      {error ? <div className="card error">{error}</div> : null}

      <div className="grid">
        <div className="card">
          <h2>Work Items</h2>
          <p>Create the full CRUD workflow, ownership, filters, and valid status transitions.</p>
          <strong>{summary?.counts.workItems ?? 0}</strong>
        </div>
        <div className="card">
          <h2>QA Checks</h2>
          <p>Add test cases, pass/fail state, and the rule that blocks release readiness.</p>
          <strong>{summary?.counts.qaChecks ?? 0}</strong>
        </div>
        <div className="card">
          <h2>Release Notes</h2>
          <p>Plan releases, link ready work, deploy, and update released items.</p>
          <strong>{summary?.counts.releases ?? 0}</strong>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h2>Current Work Items</h2>
        {items.length === 0 ? (
          <div className="card empty">
            <h3>No work items yet</h3>
            <p>This empty state is part of the starter. Interns should replace it with real CRUD behavior.</p>
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Title</th><th>Status</th><th>Priority</th></tr></thead>
            <tbody>{items.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.status}</td><td>{item.priority}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </section>
  );
}
