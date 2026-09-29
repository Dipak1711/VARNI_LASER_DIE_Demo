import { Badge, Description } from '../components/RequestParts.jsx';
import { useMemo, useState } from 'react';
import {
  ArrowUpDown, Calendar, CheckCircle2, ChevronRight, Clock, FileCode2, FileText, Filter, LayoutGrid, Mail, Scissors, Search, Table2,
} from 'lucide-react';

const columns = [
  { id: 'ready', title: 'Ready', icon: FileText },
  { id: 'approval', title: 'Approval', icon: CheckCircle2 },
];

const num = (id) => Number(id.split('-').pop());

function Card({ r, stage, dragging, onDragStart, onDragEnd, onMove }) {
  const [date, time] = r.received.split(', ');
  const isReady = stage === 'ready';
  return (
    <article
      className={`pcard ${isReady ? 'draggable' : ''} ${dragging ? 'dragging' : ''}`}
      draggable={isReady}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <h4 className="p-name"><Mail size={14} /> {r.email}</h4>
      <div className="tags">
        <span className="tag id">{r.id}</span>
        <span className="tag purple">{r.material}</span>
        <span className="tag green">Qty {r.quantity}</span>
        <span className="tag blue">{r.approval}</span>
        <span className="tag amber">{r.thickness}</span>
      </div>
      <div className="p-line"><Scissors size={14} className="c-green" /> {r.cutting}</div>
      <div className="p-line"><FileCode2 size={14} className="c-blue" /> {r.file}</div>
      <div className="p-foot">
        <span><Calendar size={14} /> {date}</span>
        <span><Clock size={14} /> {time}</span>
        {isReady && (
          <button className="p-move" onClick={onMove} title="Move to Approval" aria-label="Move to Approval">
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </article>
  );
}

export default function DocumentProgress({ rows, moveToApproval }) {
  const [dragId, setDragId] = useState(null);
  const [over, setOver] = useState(false);
  const [q, setQ] = useState('');
  const [material, setMaterial] = useState('All');
  const [menu, setMenu] = useState(false);
  const [latestFirst, setLatestFirst] = useState(true);
  const [view, setView] = useState('card');

  const materials = useMemo(() => ['All', ...new Set(rows.map((r) => r.material))], [rows]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows
      .filter((r) => r.stage)
      .filter((r) => material === 'All' || r.material === material)
      .filter((r) => !t || [r.id, r.email, r.material, r.cutting, r.file].some((v) => v.toLowerCase().includes(t)))
      .sort((a, b) => (latestFirst ? num(b.id) - num(a.id) : num(a.id) - num(b.id)));
  }, [rows, q, material, latestFirst]);

  const inStage = (stage) => list.filter((r) => r.stage === stage);
  const label = (r) => (r.stage === 'approval' ? 'Approval' : 'Ready');

  const drop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragId;
    if (id) moveToApproval(id);
    setDragId(null);
    setOver(false);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow"><span /> WORKFLOW</div>
          <h1>Document Progress</h1>
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

      <div className="card p-toolbar">
        <div className="p-search">
          <Search size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email, request ID, material…" />
        </div>
        <div className="pop-wrap">
          <button className="pill p-btn" onClick={() => setMenu((m) => !m)}>
            <Filter size={16} /> {material === 'All' ? 'Filter' : material}
          </button>
          {menu && (
            <div className="popover filter-menu">
              {materials.map((m) => (
                <button key={m} className={m === material ? 'sel' : ''} onClick={() => { setMaterial(m); setMenu(false); }}>
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="pill p-btn" onClick={() => setLatestFirst((v) => !v)}>
          <ArrowUpDown size={16} /> {latestFirst ? 'Latest First' : 'Oldest First'}
        </button>
      </div>

      {view === 'table' ? (
        <div className="card table-wrap">
          <table className="req-table">
            <thead>
              <tr><th>User Email</th><th>Requirement Description</th><th>Request ID</th><th>Status</th></tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr><td colSpan={4} className="muted" style={{ textAlign: 'center', padding: 32 }}>No requests in Document Progress.</td></tr>
              )}
              {list.map((r) => (
                <tr key={r.id}>
                  <td>{r.email}</td>
                  <td><Description r={r} /></td>
                  <td className="req-id">{r.id}<div className="req-time">{r.received}</div></td>
                  <td><Badge status={label(r)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
      <div className="p-board">
        {columns.map((col) => {
          const items = inStage(col.id);
          const Icon = col.icon;
          const target = col.id === 'approval';
          return (
            <section
              key={col.id}
              className={`p-col ${target && dragId ? 'drop-ready' : ''} ${target && dragId && over ? 'drop-over' : ''}`}
              onDragOver={target ? (e) => { e.preventDefault(); setOver(true); } : undefined}
              onDragLeave={target ? () => setOver(false) : undefined}
              onDrop={target ? drop : undefined}
            >
              <header className="p-col-head">
                <span className="p-col-icon"><Icon size={15} /></span>
                <span className="p-col-title">{col.title}</span>
                <span className="p-count">{items.length}</span>
              </header>
              <div className="p-col-body">
                {items.length === 0 && (
                  <div className="col-empty">{target ? 'Drop a card here' : 'No approved requests yet'}</div>
                )}
                {items.map((r) => (
                  <Card
                    key={r.id}
                    r={r}
                    stage={col.id}
                    dragging={dragId === r.id}
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', r.id); e.dataTransfer.effectAllowed = 'move'; setDragId(r.id); }}
                    onDragEnd={() => { setDragId(null); setOver(false); }}
                    onMove={() => moveToApproval(r.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      )}
      <p className="p-footer">{list.length} requests · Document Progress pipeline</p>
    </>
  );
}
