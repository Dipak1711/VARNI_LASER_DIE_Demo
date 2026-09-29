import { useState } from 'react';
import { customerStatus } from '../data.js';

const MAX = Math.max(...customerStatus.map((s) => s.value));

export default function CustomerStatus() {
  const [hover, setHover] = useState(null);
  return (
    <div className="card status-card">
      <h3>Customer Status</h3>
      <p className="muted">Where your customers stand right now</p>
      <div className="bars">
        {customerStatus.map((s) => (
          <div
            className="bar-row"
            key={s.label}
            onMouseEnter={() => setHover(s.label)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="bar-label">{s.label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(s.value / MAX) * 100}%`, background: s.color }}
              />
              {hover === s.label && <span className="bar-tip">{s.value.toLocaleString()}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
