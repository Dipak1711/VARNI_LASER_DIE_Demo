import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, Download, FilePlus2, Filter, Pencil, Printer, Search, X } from 'lucide-react';
import { showSize } from '../laserJobs.js';
import { qcBadge } from './QC.jsx';
import { buildChallanPdf } from '../challanPdf.js';

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

const today = () => new Date().toISOString().slice(0, 10);

function ChallanDialog({ job, data, onSave, onClose }) {
  const [f, setF] = useState({
    challanNo: `DC-2026-${job.job.split('-').pop()}`,
    date: today(), vehicle: '', driver: '', driverPhone: '', transporter: '',
    address: '', quantity: '', notes: '', ...data,
  });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    onSave(job.job, f);
    onClose(true);
  };

  return (
    <div className="modal-back" onMouseDown={() => onClose()}>
      <form className="card modal wide-modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <div>
            <div className="req-id">Delivery Challan</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{job.job} · {job.email} · Size {showSize(job.size)}</div>
          </div>
          <button type="button" className="icon-btn plain" onClick={() => onClose()} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="form-section">Challan</div>
        <div className="form-grid">
          <label className="field"><span>Challan number</span><input required value={f.challanNo} onChange={set('challanNo')} /></label>
          <label className="field"><span>Delivery date</span><input required type="date" value={f.date} onChange={set('date')} /></label>
          <label className="field"><span>Quantity (pcs)</span><input required type="number" min="1" value={f.quantity} onChange={set('quantity')} /></label>
          <label className="field"><span>Transporter</span><input value={f.transporter} onChange={set('transporter')} placeholder="e.g. Shree Logistics" /></label>
        </div>

        <div className="form-section">Vehicle &amp; driver</div>
        <div className="form-grid">
          <label className="field"><span>Vehicle number</span><input required value={f.vehicle} onChange={set('vehicle')} placeholder="GJ 01 AB 1234" /></label>
          <label className="field"><span>Driver name</span><input value={f.driver} onChange={set('driver')} /></label>
          <label className="field"><span>Driver phone</span><input value={f.driverPhone} onChange={set('driverPhone')} inputMode="tel" /></label>
        </div>

        <div className="form-section">Delivery</div>
        <div className="form-grid">
          <label className="field wide"><span>Delivery address</span><textarea required rows="2" value={f.address} onChange={set('address')} /></label>
          <label className="field wide"><span>Notes</span><textarea rows="2" value={f.notes} onChange={set('notes')} placeholder="Handling instructions, receiver contact…" /></label>
        </div>

        <div className="form-actions">
          <button type="button" className="act reset" onClick={() => onClose()}>Cancel</button>
          <button type="submit" className="act ok">Save &amp; Preview</button>
        </div>
      </form>
    </div>
  );
}

// PDF preview: the generated PDF is shown in a frame, with Download and Print
function PdfPreview({ job, c, qc, fit, onClose }) {
  const frame = useRef(null);
  const [doc, url] = useMemo(() => {
    const d = buildChallanPdf({ job, c, qc, fit });
    return [d, d.output('bloburl')];
  }, [job, c, qc, fit]);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const print = () => {
    try {
      frame.current.contentWindow.focus();
      frame.current.contentWindow.print();
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="modal-back" onMouseDown={onClose}>
      <div className="card modal pdf-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="req-id">Delivery Challan · {c.challanNo}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{job.job} · PDF preview</div>
          </div>
          <button className="act reset" onClick={print}><Printer size={13} /> Print</button>
          <button className="act ok" onClick={() => doc.save(`${c.challanNo}.pdf`)}><Download size={13} /> Download PDF</button>
          <button className="icon-btn plain" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <iframe ref={frame} className="pdf-frame" src={url} title="Delivery challan preview" />
      </div>
    </div>
  );
}

export default function Dispatch({ jobs, fitting, qc, challan, saveChallan }) {
  const [q, setQ] = useState('');
  const [size, setSize] = useState('All');
  const [menu, setMenu] = useState(false);
  const [latestFirst, setLatestFirst] = useState(true);
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState(null); // job code whose challan form is open
  const [preview, setPreview] = useState(null); // job code whose PDF is shown

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
          <p className="muted lead">Jobs that passed Quality Assurance and are ready to dispatch.</p>
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
            <tr><th>User Email</th><th>Size</th><th>Job Code</th><th>Photos</th><th>QC Status</th><th>Challan</th><th>Print</th></tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 32 }}>
                Nothing to dispatch yet. Mark a job as Completed in Quality Assurance.
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
                  <td onClick={(e) => e.stopPropagation()}>
                    {challan[r.job] ? (
                      <button className="act reset" onClick={() => setForm(r.job)}><Pencil size={13} /> Edit</button>
                    ) : (
                      <button className="act ok" onClick={() => setForm(r.job)}><FilePlus2 size={13} /> Add Challan</button>
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="icon-btn print-btn"
                      title="Print delivery challan"
                      aria-label="Print delivery challan"
                      onClick={() => (challan[r.job] ? setPreview(r.job) : setForm(r.job))}
                    >
                      <Printer size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="p-footer">{list.length} jobs ready to dispatch</p>

      {form && eligible.find((j) => j.job === form) && (
        <ChallanDialog
          job={eligible.find((j) => j.job === form)}
          data={challan[form]}
          onSave={saveChallan}
          onClose={(saved) => { if (saved) setPreview(form); setForm(null); }}
        />
      )}
      {preview && challan[preview] && eligible.find((j) => j.job === preview) && (
        <PdfPreview
          job={eligible.find((j) => j.job === preview)}
          c={challan[preview]}
          qc={qc[preview]}
          fit={fitting[preview]}
          onClose={() => setPreview(null)}
        />
      )}
      {selected && <Details job={selected} data={qc[selected.job]} onClose={() => setOpen(null)} />}
    </>
  );
}
