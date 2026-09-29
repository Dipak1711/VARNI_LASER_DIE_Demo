import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ icon: Icon, tone, value, label, sub, badge, onClick }) {
  return (
    <button className="card stat" onClick={onClick}>
      <div className="stat-top">
        <span className={`stat-icon ${tone}`}><Icon size={20} /></span>
        {badge && (
          <span className="trend"><ArrowUpRight size={11} /> {badge}</span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub">{sub}</div>
    </button>
  );
}
