import { useEffect } from 'react';
import { FileCode2, X } from 'lucide-react';

export function Badge({ status }) {
  return <span className={`status ${status.toLowerCase()}`}>{status}</span>;
}

export function Description({ r }) {
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

// Job code shown in Document Progress, derived from the linked request (REQ-2026-00125 -> JOB-2026-00125)
export const jobCode = (r) => r.jobCode || r.id.replace('REQ', 'JOB');

export function Chips({ r }) {
  return (
    <div className="chips">
      <span className="chip">{r.material}</span>
      <span className="chip">{r.thickness}</span>
      <span className="chip">Qty {r.quantity}</span>
    </div>
  );
}

export function RequestDialog({ r, status, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rows = [
    ['Job Code', jobCode(r)],
    ['User Email', r.email],
    ['Received', r.received],
    ['Material', r.material],
    ['Thickness', r.thickness],
    ['Quantity', r.quantity],
    ['Required Cutting', r.cutting],
  ];

  return (
    <div className="modal-back" onMouseDown={onClose}>
      <div className="card modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="req-id">{jobCode(r)}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Requirement details</div>
          </div>
          <Badge status={status} />
          <button className="icon-btn plain" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <dl className="detail-list">
          {rows.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
          <div>
            <dt>Attached Design</dt>
            <dd><span className="file"><FileCode2 size={14} /> {r.file}</span></dd>
          </div>
          <div><dt>Designer Approval</dt><dd><Badge status={r.approval} /></dd></div>
        </dl>
      </div>
    </div>
  );
}
