import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Database, LogOut, Moon, PanelLeft, Sun } from 'lucide-react';

export default function Header({ onToggleSidebar, dark, onToggleDark, onLogout }) {
  const [dbOpen, setDbOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const wrap = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) {
        setDbOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="header" ref={wrap}>
      <button className="icon-btn plain" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <PanelLeft size={18} />
      </button>

      <div className="header-right">
        <div className="pop-wrap">
          <button className="pill db-pill" onClick={() => { setDbOpen((o) => !o); setNotifOpen(false); }}>
            <Database size={14} style={{ color: 'var(--primary)' }} />
            <span className="blue">46R</span>
            <span className="dot">·</span>
            <span className="amber">1W</span>
            <ChevronDown size={13} />
          </button>
          {dbOpen && (
            <div className="popover">
              <div className="pop-title">Database connections</div>
              <div className="pop-row"><span>Read replicas</span><b className="blue">46</b></div>
              <div className="pop-row"><span>Write primary</span><b className="amber">1</b></div>
              <div className="pop-row"><span>Status</span><b className="ok">Healthy</b></div>
            </div>
          )}
        </div>

        <div className="pop-wrap">
          <button
            className="icon-btn"
            onClick={() => { setNotifOpen((o) => !o); setDbOpen(false); setUnread(false); }}
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unread && <span className="badge-dot" />}
          </button>
          {notifOpen && (
            <div className="popover notif">
              <div className="pop-title">Notifications</div>
              <div className="notif-item"><b>6 tasks overdue</b><span>Review customer tasks</span></div>
              <div className="notif-item"><b>Payment received</b><span>₹4.04Cr collected this month</span></div>
              <div className="notif-item"><b>New installation</b><span>290 active on the floor</span></div>
            </div>
          )}
        </div>

        <button className="icon-btn" onClick={onToggleDark} aria-label="Toggle theme">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="user-pill">
          <div className="avatar">DP</div>
          <div className="user-info">
            <div className="user-name">DHRUMIL PATEL</div>
            <div className="user-phone">7802032338</div>
          </div>
          <span className="role">Admin Team</span>
        </div>

        <button className="pill logout" onClick={onLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}
