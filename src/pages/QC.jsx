import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, Camera, Filter, Search, X } from 'lucide-react';
import { showSize } from '../laserJobs.js';

const num = (j) => Number(j.split('-').pop());
const STATUSES = ['Pending', 'Completed', 'Rework Required', 'Not Completed'];
const MAX_PHOTOS = 4;

export const qcBadge = (s) =>
  ({ Completed: 'completed', 'Rework Required': 'progress', 'Not Completed': 'rejected' }[s] || 'notstarted');

// shrink photos before saving so they fit in browser storage
function compress(file, max = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });
}


// Live camera: opens the device camera in the page and grabs a frame as a photo
function CameraCapture({ onShot, onClose, onFallback }) {
  const video = useRef(null);
  const stream = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera is not supported in this browser.');
        const st = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (dead) { st.getTracks().forEach((t) => t.stop()); return; }
        stream.current = st;
        video.current.srcObject = st;
        await video.current.play();
        setReady(true);
      } catch (e) {
        setError(
          e.name === 'NotAllowedError' ? 'Camera permission was blocked. Allow camera access in the browser and try again.'
          : e.name === 'NotFoundError' ? 'No camera found on this device.'
          : e.message || 'Could not open the camera.'
        );
      }
    })();
    return () => { dead = true; stream.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const shoot = () => {
    const v = video.current;
    const k = Math.min(1, 900 / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(v.videoWidth * k);
    c.height = Math.round(v.videoHeight * k);
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    onShot(c.toDataURL('image/jpeg', 0.7));
  };

  return (
    <div className="camera">
      {error ? (
        <div className="camera-error">
          <p>{error}</p>
          <button type="button" className="act reset" onClick={onFallback}>Choose a file instead</button>
        </div>
      ) : (
        <video ref={video} playsInline muted />
      )}
      <div className="camera-actions">
        <button type="button" className="act reset" onClick={onClose}>Close camera</button>
        {!error && (
          <button type="button" className="act ok" disabled={!ready} onClick={shoot}>
            <Camera size={14} /> Capture
          </button>
        )}
      </div>
    </div>
  );
}

function QcDialog({ job, data, onSave, onClose }) {
  const [status, setStatus] = useState(data?.status || 'Pending');
  const [remark, setRemark] = useState(data?.remark || '');
  const [photos, setPhotos] = useState(data?.photos || []);
  const input = useRef(null);
  const [camera, setCamera] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addPhotos = async (e) => {
    const files = [...e.target.files].slice(0, MAX_PHOTOS - photos.length);
    e.target.value = '';
    const urls = await Promise.all(files.map((f) => compress(f).catch(() => null)));
    setPhotos((p) => [...p, ...urls.filter(Boolean)]);
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(job.job, { status, remark, photos });
    onClose();
  };

  return (
    <div className="modal-back" onMouseDown={onClose}>
      <form className="card modal wide-modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <div>
            <div className="req-id">{job.job}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{job.email} · Size {showSize(job.size)}</div>
          </div>
          <button type="button" className="icon-btn plain" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="form-section">Product photos</div>
        <div className="photo-grid">
          {photos.map((src, i) => (
            <div className="photo" key={i}>
              <img src={src} alt={`Product ${i + 1}`} />
              <button type="button" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} aria-label="Remove photo"><X size={12} /></button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button type="button" className="photo add" onClick={() => setCamera(true)}>
              <Camera size={20} />
              <span>Take Photo</span>
            </button>
          )}
        </div>
        {camera && photos.length < MAX_PHOTOS && (
          <CameraCapture
            onShot={(url) => setPhotos((p) => { const n = [...p, url]; if (n.length >= MAX_PHOTOS) setCamera(false); return n; })}
            onClose={() => setCamera(false)}
            onFallback={() => { setCamera(false); input.current.click(); }}
          />
        )}
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
        <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>Up to {MAX_PHOTOS} photos. Take Photo opens your live camera.</p>

        <div className="form-section">QC result</div>
        <div className="form-grid">
          <label className="field wide">
            <span>QC status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="field wide">
            <span>Remark</span>
            <textarea rows="3" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Finish, dimensions, defects, rework needed…" />
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="act reset" onClick={onClose}>Cancel</button>
          <button type="submit" className="act ok">Save</button>
        </div>
      </form>
    </div>
  );
}

export default function QC({ jobs, fitting, qc, saveQc }) {
  const [q, setQ] = useState('');
  const [size, setSize] = useState('All');
  const [menu, setMenu] = useState(false);
  const [latestFirst, setLatestFirst] = useState(true);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');

  // Bending & Fitting status = Completed
  const eligible = useMemo(
    () => jobs.filter((j) => j.sentCnc && fitting[j.job]?.status === 'Completed'),
    [jobs, fitting]
  );
  const sizes = useMemo(() => ['All', ...new Set(eligible.map((r) => r.size))], [eligible]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return eligible
      .filter((r) => size === 'All' || r.size === size)
      .filter((r) => !t || [r.job, r.email, showSize(r.size), qc[r.job]?.status || ''].some((v) => v.toLowerCase().includes(t)))
      .sort((a, b) => (latestFirst ? num(b.job) - num(a.job) : num(a.job) - num(b.job)));
  }, [eligible, q, size, latestFirst, qc]);

  const selected = open && eligible.find((j) => j.job === open);

  const save = (job, data) => {
    try {
      saveQc(job, data);
      setError('');
    } catch {
      setError('Could not save — photos may be too large.');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow"><span /> WORKFLOW</div>
          <h1>Quality Assurance</h1>
          <p className="muted lead">Jobs with Bending &amp; Fitting completed. Click a row to add product photos, status and remark.</p>
        </div>
      </div>

      <div className="card p-toolbar">
        <div className="p-search">
          <Search size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email, job code, size, status…" />
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

      {error && <p className="form-error">{error}</p>}

      <div className="card table-wrap">
        <table className="req-table">
          <thead>
            <tr><th>User Email</th><th>Size</th><th>Job Code</th><th>Photos</th><th>QC Status</th></tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 32 }}>
                No jobs yet. Complete a job in Bending &amp; Fitting first.
              </td></tr>
            )}
            {list.map((r) => {
              const d = qc[r.job];
              const status = d?.status || 'Pending';
              return (
                <tr key={r.job} className="click-row" onClick={() => setOpen(r.job)}>
                  <td>{r.email}</td>
                  <td><span className="chip size-chip">{showSize(r.size)}</span></td>
                  <td className="req-id">{r.job}<div className="req-time">{r.date}</div></td>
                  <td>
                    {d?.photos?.length ? (
                      <div className="thumbs">
                        {d.photos.slice(0, 3).map((p, i) => <img key={i} src={p} alt="" />)}
                        {d.photos.length > 3 && <em>+{d.photos.length - 3}</em>}
                      </div>
                    ) : <span className="muted">—</span>}
                  </td>
                  <td><span className={`status ${qcBadge(status)}`}>{status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="p-footer">{list.length} jobs in Quality Assurance</p>

      {selected && <QcDialog job={selected} data={qc[selected.job]} onSave={save} onClose={() => setOpen(null)} />}
    </>
  );
}
