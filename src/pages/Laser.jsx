import { useMemo, useState } from 'react';
import { ArrowUpDown, Filter, Search } from 'lucide-react';
import { showSize } from '../laserJobs.js';

const num = (j) => Number(j.split('-').pop());

export default function Laser({ rows, toggle }) {
  const [q, setQ] = useState('');
  const [size, setSize] = useState('All');
  const [menu, setMenu] = useState(false);
  const [latestFirst, setLatestFirst] = useState(true);

  const sizes = useMemo(() => ['All', ...new Set(rows.map((r) => r.size))], [rows]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows
      .filter((r) => size === 'All' || r.size === size)
      .filter((r) => !t || [r.job, r.email, showSize(r.size)].some((v) => v.toLowerCase().includes(t)))
      .sort((a, b) => (latestFirst ? num(b.job) - num(a.job) : num(a.job) - num(b.job)));
  }, [rows, q, size, latestFirst]);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow"><span /> WORKFLOW</div>
          <h1>Laser</h1>
          <p className="muted lead">Track which laser jobs have had their CNC document sent.</p>
        </div>
      </div>

      <div className="card p-toolbar">
        <div className="p-search">
          <Search size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email, job code, size…" />
        </div>
        <div className="pop-wrap">
          <button className="pill p-btn" onClick={() => setMenu((m) => !m)}>
            <Filter size={16} /> {size === 'All' ? 'Filter' : showSize(size)}
          </button>
          {menu && (
            <div className="popover filter-menu">
              {sizes.map((s) => (
                <button key={s} className={s === size ? 'sel' : ''} onClick={() => { setSize(s); setMenu(false); }}>
                  {s === 'All' ? 'All' : showSize(s)}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="pill p-btn" onClick={() => setLatestFirst((v) => !v)}>
          <ArrowUpDown size={16} /> {latestFirst ? 'Latest First' : 'Oldest First'}
        </button>
      </div>

      <div className="card table-wrap">
        <table className="req-table">
          <thead>
            <tr><th>User Email</th><th>Size</th><th>Job Code</th><th>Sent CNC Document</th></tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={4} className="muted" style={{ textAlign: 'center', padding: 32 }}>No laser jobs match your filters.</td></tr>
            )}
            {list.map((r) => (
              <tr key={r.job}>
                <td>{r.email}</td>
                <td><span className="chip size-chip">{showSize(r.size)}</span></td>
                <td className="req-id">{r.job}<div className="req-time">{r.date}</div></td>
                <td>
                  <button
                    className={`status cnc ${r.sentCnc ? 'yes' : 'no'}`}
                    onClick={() => toggle(r.job)}
                    title="Click to toggle"
                  >
                    {r.sentCnc ? 'Yes' : 'No'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="p-footer">{list.length} laser jobs</p>
    </>
  );
}
