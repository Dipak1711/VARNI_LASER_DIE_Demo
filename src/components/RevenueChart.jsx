import { useState } from 'react';
import { revenue } from '../data.js';

const W = 940, H = 300;
const PAD = { l: 62, r: 30, t: 20, b: 36 };
const MAX = 600, MIN = 150;
const ticks = [150, 300, 450, 600];

const x = (i) => PAD.l + (i * (W - PAD.l - PAD.r)) / (revenue.length - 1);
const y = (v) => PAD.t + ((MAX - v) * (H - PAD.t - PAD.b)) / (MAX - MIN);

// smooth (catmull-rom -> bezier) path
function smooth(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export default function RevenueChart() {
  const [hover, setHover] = useState(null);
  const pts = revenue.map((r, i) => [x(i), y(r.v)]);
  const line = smooth(pts);
  const area = `${line} L${x(revenue.length - 1)},${H - PAD.b} L${x(0)},${H - PAD.b} Z`;

  return (
    <div className="card chart-card">
      <h3>Revenue Trend</h3>
      <p className="muted">Credited payments (₹ Lakhs) — last 6 months</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="fillG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--primary)' }} stopOpacity="0.25" />
            <stop offset="100%" style={{ stopColor: 'var(--primary)' }} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={PAD.l - 14} y={y(t) + 4} textAnchor="end" className="tick">{t}</text>
          </g>
        ))}
        <path d={area} fill="url(#fillG)" />
        <path d={line} fill="none" style={{ stroke: 'var(--primary)' }} strokeWidth="3" strokeLinecap="round" />
        {revenue.map((r, i) => (
          <g key={r.m} onMouseEnter={() => setHover(i)}>
            <rect x={x(i) - 40} y={PAD.t} width="80" height={H - PAD.t - PAD.b} fill="transparent" />
            <text x={x(i)} y={H - 10} textAnchor="middle" className="tick">{r.m}</text>
            {hover === i && (
              <>
                <line x1={x(i)} x2={x(i)} y1={PAD.t} y2={H - PAD.b} className="hover-line" />
                <circle cx={x(i)} cy={y(r.v)} r="6" fill="var(--surface)" style={{ stroke: 'var(--primary)' }} strokeWidth="3" />
                <g transform={`translate(${Math.min(x(i) - 45, W - 110)},${y(r.v) - 46})`}>
                  <rect width="90" height="34" rx="8" className="tip" />
                  <text x="45" y="21" textAnchor="middle" className="tip-text">₹{r.v}L</text>
                </g>
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
