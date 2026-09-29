import { FileCode2 } from 'lucide-react';

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
