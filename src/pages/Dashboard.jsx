import { Activity } from 'lucide-react';
import { stats } from '../data.js';
import StatCard from '../components/StatCard.jsx';
import RevenueChart from '../components/RevenueChart.jsx';
import CustomerStatus from '../components/CustomerStatus.jsx';

export default function Dashboard({ onNavigate }) {
  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow"><span /> MAIN MENU</div>
          <h1>Dashboard</h1>
          <p className="muted lead">Real-time insights and analytics for your solar operations.</p>
        </div>
        <span className="live"><Activity size={14} /> Live data synced</span>
      </div>

      <div className="stats">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} onClick={() => onNavigate(s.go)} />
        ))}
      </div>

      <div className="charts">
        <RevenueChart />
        <CustomerStatus />
      </div>
    </>
  );
}
