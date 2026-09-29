import { useMemo, useState } from 'react';
import { Check, FileCode2, LayoutGrid, Mail, Search, Table2, X } from 'lucide-react';
import { emailRequests } from '../emailRequests.js';

const statuses = ['All', 'Pending', 'Approved', 'Rejected'];

function Badge({ status }) {
  return <span className={`status ${status.toLowerCase()}`}>{status}</span>;
}

function Description({ r }) {
  return (
    <div className="req-desc">
      <div className="chips">
        <span className="chip">{r.material}</span>
        <span className="chip">{r.thickness}</span>
        <span className="chip">Qty {r.quantity}</span>
      </div>
      <p>{r.cutting}</p>
      <span className="file"><FileCode2 size={13} /> {r.file}</span>
    </div>
  );
}

export default function EmailRequests() {
  const [rows, setRows] = useState(emailRequests);
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');

  const setApproval = (id, approval) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, approval } : r)));

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filter === 'All' || r.approval === filter) &&
        (!t || [r.id, r.email, r.material, r.cutting, r.file].some((v) => v.toLowerCase().includes(t)))
    );
  }, [rows, filter, q]);

  const Actions = ({ r }) =>
    r.approval === 'Pending' ? (
      <div className="actions">
        <button className="act ok" onClick={() => setApproval(r.id, 'Approved')}><Check size={14} /> Approve</button>
        <button className="act no" onClick={() => setApproval(r.id, 'Rejected')}><X size={14} /> Reject</button>
      </div>
    ) : (
      <button className="act reset" onClick={() => setApproval(r.id, 'Pending')}>Reset</button>
    );

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow"><span /> WORKFLOW</div>
          <h1>Email Requests</h1>
          <p className="muted lead">Incoming CNC / laser cutting requests from customers.</p>
        </div>
        <div className="view-toggle">
          <button className={view === 'card' ? 'on' : ''} onClick={() => setView('card')}>
            <LayoutGrid size={15} /> Card View
          </button>
          <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>
            <Table2 size={15} /> Table View
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, email, material…" />
        </div>
        <div className="filters">
          {statuses.map((s) => (
            <button key={s} className={filter === s ? 'on' : ''} onClick={() => setFilter(s)}>
              {s}
              <em>{s === 'All' ? rows.length : rows.filter((r) => r.approval === s).length}</em>
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="card empty">No requests match your filters.</div>
      ) : view === 'card' ? (
        <div className="req-grid">
          {shown.map((r) => (
            <div className="card req-card" key={r.id}>
              <div className="req-top">
                <span className="req-id">{r.id}</span>
                <Badge status={r.approval} />
              </div>
              <div className="req-email"><Mail size={14} /> {r.email}</div>
              <div className="req-time">{r.received}</div>
              <Description r={r} />
              <div className="req-foot">
                <span className="muted">Designer Approval</span>
                <Actions r={r} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="req-table">
            <thead>
              <tr>
                <th>Request ID</th><th>User Email</th><th>Requirement Description</th>
                <th>Designer Approval</th><th />
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className="req-id">{r.id}<div className="req-time">{r.received}</div></td>
                  <td>{r.email}</td>
                  <td><Description r={r} /></td>
                  <td><Badge status={r.approval} /></td>
                  <td><Actions r={r} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
