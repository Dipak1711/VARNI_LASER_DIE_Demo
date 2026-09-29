import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Filter, Search, X } from 'lucide-react';
import { showSize } from '../laserJobs.js';
import { qcBadge } from './QC.jsx';

const num = (j) => Number(j.split('-').pop());

function Details({ job, data, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-back" onMouseDown={onClose}>
      <div className="card modal wide-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="req-id">{job.job}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{job.email} · Size {showSize(job.size)}</div>
          </div>
          <span className={`status ${qcBadge(data.status)}`}>{data.status}</span>
          <button className="icon-btn plain" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="form-section">Product photos</div>
        {data.photos?.length ? (
          <div className="photo-grid">
            {data.photos.map((src, i) => <div className="photo" key={i}><img src={src} alt={`Product ${i + 1}`} /></div>)}
          </div>
        ) : <p className="muted">No photos added.</p>}
        <div className="form-section">QC remark</div>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>{data.remark || <span className="muted">No remark.</span>}</p>
      </div>
    </div>
  );
}

export default function Dispatch({ jobs, fitting, qc }) {
  const [q, setQ] = useState('');
  const [size, setSize] = useState('All');
  const [menu, setMenu] = useState(false);
  const [latestFirst, setLatestFirst] = useState(true);
  const [open, setOpen] = useState(null);

  // QC status = Completed
  const eligible = useMemo(
    () => jobs.filter((j) => j.sentCnc && fitting[j.job]?.status === 'Completed' && qc[j.job]?.status === 'Completed'),
    [jobs, fitting, qc]
  );
  const sizes = useMemo(() => ['All', ...new Set(eligible.map((r) => r.size))], [eligible]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return eligible
      .filter((r) => size === 'All' || r.size === size)
      .filter((r) => !t || [r.job, r.email, showSize(r.size)].some((v) => v.toLowerCase().includes(t)))
      .sort((a, b) => (latestFirst ? num(b.job) - num(a.job) : num(a.job) - num(b.job)));
  }, [eligible, q, size, latestFirst]);

  const selected = open && eligible.find((j) => j.job === open);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow"><span /> WORKFLOW</div>
          <h1>Dispatch</h1>
          <p className="muted lead">Jobs that passed QC and are ready to dispatch.</p>
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
            <tr><th>User Email</th><th>Size</th><th>Job Code</th><th>Photos</th><th>QC Status</th></tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 32 }}>
                Nothing to dispatch yet. Mark a job as Completed in QC.
              </td></tr>
            )}
            {list.map((r) => {
              const d = qc[r.job];
              return (
                <tr key={r.job} className="click-row" onClick={() => setOpen(r.job)}>
                  <td>{r.email}</td>
                  <td><span className="chip size-chip">{showSize(r.size)}</span></td>
                  <td className="req-id">{r.job}<div className="req-time">{r.date}</div></td>
                  <td>
                    {d.photos?.length ? (
                      <div className="thumbs">
                        {d.photos.slice(0, 3).map((p, i) => <img key={i} src={p} alt="" />)}
                        {d.photos.length > 3 && <em>+{d.photos.length - 3}</em>}
                      </div>
                    ) : <span className="muted">—</span>}
                  </td>
                  <td><span className={`status ${qcBadge(d.status)}`}>{d.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="p-footer">{list.length} jobs ready to dispatch</p>

      {selected && <Details job={selected} data={qc[selected.job]} onClose={() => setOpen(null)} />}
    </>
  );
}
