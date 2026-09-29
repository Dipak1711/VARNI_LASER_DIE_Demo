import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Filter, Search, X } from 'lucide-react';
import { showSize } from '../laserJobs.js';

const num = (j) => Number(j.split('-').pop());

const MACHINES = ['Press Brake 1', 'Press Brake 2', 'Manual Bender'];
const FITTING_TYPES = ['Welding', 'Bolting', 'Riveting', 'Assembly'];
const STATUSES = ['Not Started', 'In Progress', 'Completed'];
const QC = ['Pending', 'Pass', 'Fail'];

const empty = {
  operator: '', machine: MACHINES[0], bends: '', angle: '',
  quantity: '', bendingDone: '', fittingType: FITTING_TYPES[0], fittingDone: '', rejected: '',
  startDate: '', endDate: '', status: STATUSES[0], qc: QC[0], remarks: '',
};

const badgeClass = (s) => (s === 'Completed' ? 'completed' : s === 'In Progress' ? 'progress' : 'notstarted');

function Field({ label, children, wide }) {
  return (
    <label className={`field ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function FittingDialog({ job, data, onSave, onClose }) {
  const [f, setF] = useState({ ...empty, ...data });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    onSave(job.job, f);
    onClose();
  };

  return (
    <div className="modal-back" onMouseDown={onClose}>
      <form className="card modal wide-modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <div>
            <div className="req-id">{job.job}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              {job.email} · Size {showSize(job.size)}
            </div>
          </div>
          <button type="button" className="icon-btn plain" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="form-section">Bending</div>
        <div className="form-grid">
          <Field label="Operator name"><input value={f.operator} onChange={set('operator')} placeholder="e.g. Ramesh Patel" /></Field>
          <Field label="Bending machine">
            <select value={f.machine} onChange={set('machine')}>{MACHINES.map((m) => <option key={m}>{m}</option>)}</select>
          </Field>
          <Field label="Number of bends"><input type="number" min="0" value={f.bends} onChange={set('bends')} /></Field>
          <Field label="Bend angle (°)"><input type="number" min="0" max="180" value={f.angle} onChange={set('angle')} /></Field>
        </div>

        <div className="form-section">Fitting</div>
        <div className="form-grid">
          <Field label="Fitting type">
            <select value={f.fittingType} onChange={set('fittingType')}>{FITTING_TYPES.map((m) => <option key={m}>{m}</option>)}</select>
          </Field>
          <Field label="Total quantity"><input type="number" min="0" value={f.quantity} onChange={set('quantity')} /></Field>
          <Field label="Bending done (qty)"><input type="number" min="0" value={f.bendingDone} onChange={set('bendingDone')} /></Field>
          <Field label="Fitting done (qty)"><input type="number" min="0" value={f.fittingDone} onChange={set('fittingDone')} /></Field>
          <Field label="Rejected (qty)"><input type="number" min="0" value={f.rejected} onChange={set('rejected')} /></Field>
          <Field label="Quality check">
            <select value={f.qc} onChange={set('qc')}>{QC.map((m) => <option key={m}>{m}</option>)}</select>
          </Field>
        </div>

        <div className="form-section">Schedule</div>
        <div className="form-grid">
          <Field label="Start date"><input type="date" value={f.startDate} onChange={set('startDate')} /></Field>
          <Field label="Completion date"><input type="date" value={f.endDate} onChange={set('endDate')} /></Field>
          <Field label="Status">
            <select value={f.status} onChange={set('status')}>{STATUSES.map((m) => <option key={m}>{m}</option>)}</select>
          </Field>
          <Field label="Remarks" wide>
            <textarea rows="3" value={f.remarks} onChange={set('remarks')} placeholder="Any notes about bending or fitting…" />
          </Field>
        </div>

        <div className="form-actions">
          <button type="button" className="act reset" onClick={onClose}>Cancel</button>
          <button type="submit" className="act ok">Save</button>
        </div>
      </form>
    </div>
  );
}

export default function BendingFitting({ jobs, fitting, saveFitting }) {
  const [q, setQ] = useState('');
  const [size, setSize] = useState('All');
  const [menu, setMenu] = useState(false);
  const [latestFirst, setLatestFirst] = useState(true);
  const [open, setOpen] = useState(null);

  // only jobs whose CNC document has been sent (Laser page -> Sent CNC Document = Yes)
  const eligible = useMemo(() => jobs.filter((j) => j.sentCnc), [jobs]);
  const sizes = useMemo(() => ['All', ...new Set(eligible.map((r) => r.size))], [eligible]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return eligible
      .filter((r) => size === 'All' || r.size === size)
      .filter((r) => !t || [r.job, r.email, showSize(r.size), fitting[r.job]?.operator || ''].some((v) => v.toLowerCase().includes(t)))
      .sort((a, b) => (latestFirst ? num(b.job) - num(a.job) : num(a.job) - num(b.job)));
  }, [eligible, q, size, latestFirst, fitting]);

  const selected = open && eligible.find((j) => j.job === open);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow"><span /> WORKFLOW</div>
          <h1>Bending &amp; Fitting</h1>
          <p className="muted lead">Jobs with the CNC document sent. Click a row to fill in bending and fitting details.</p>
        </div>
      </div>

      <div className="card p-toolbar">
        <div className="p-search">
          <Search size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email, job code, size, operator…" />
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
            <tr><th>User Email</th><th>Size</th><th>Job Code</th><th>Operator</th><th>Status</th></tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 32 }}>
                No jobs yet. Set "Sent CNC Document" to Yes on the Laser page.
              </td></tr>
            )}
            {list.map((r) => {
              const d = fitting[r.job];
              const status = d?.status || 'Not Started';
              return (
                <tr key={r.job} className="click-row" onClick={() => setOpen(r.job)}>
                  <td>{r.email}</td>
                  <td><span className="chip size-chip">{showSize(r.size)}</span></td>
                  <td className="req-id">{r.job}<div className="req-time">{r.date}</div></td>
                  <td>{d?.operator || <span className="muted">—</span>}</td>
                  <td><span className={`status ${badgeClass(status)}`}>{status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="p-footer">{list.length} jobs in Bending &amp; Fitting</p>

      {selected && (
        <FittingDialog job={selected} data={fitting[selected.job]} onSave={saveFitting} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
