import { useState } from 'react';
import { ChevronDown, ChevronRight, Leaf } from 'lucide-react';
import { menuGroups } from '../data.js';

export default function Sidebar({ active, onNavigate, open }) {
  const [collapsed, setCollapsed] = useState({});
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  return (
    <aside className={`sidebar ${open ? '' : 'closed'}`}>
      <div className="brand" onClick={() => onNavigate('dashboard')}>
        <div className="brand-logo"><Leaf size={20} /></div>
        <div>
          <div className="brand-name">VARNI</div>
          <div className="brand-sub">LASER DIE</div>
        </div>
      </div>

      <nav>
        {menuGroups.map((g) => {
          const GIcon = g.icon;
          const isCollapsed = collapsed[g.id];
          return (
            <div className="group" key={g.id}>
              <button
                className="group-head"
                onClick={() => setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))}
              >
                <span className="group-icon"><GIcon size={16} /></span>
                <span className="group-label">{g.label}</span>
                <ChevronDown size={15} className={`chev ${isCollapsed ? 'rot' : ''}`} />
              </button>

              {!isCollapsed && g.items.length > 0 && (
                <ul className="items">
                  {g.items.map((it) => {
                    const Icon = it.icon;
                    const isActive = active === it.id;
                    const hasKids = !!it.children;
                    return (
                      <li key={it.id}>
                        <button
                          className={`item ${isActive ? 'active' : ''}`}
                          onClick={() => (hasKids ? setInvoiceOpen((o) => !o) : onNavigate(it.id))}
                        >
                          <span className="dash" />
                          <Icon size={16} />
                          <span className="item-label">{it.label}</span>
                          {hasKids && (
                            <ChevronRight size={15} className={`chev ${invoiceOpen ? 'rot90' : ''}`} />
                          )}
                        </button>
                        {hasKids && invoiceOpen && (
                          <ul className="sub-items">
                            {it.children.map((c) => (
                              <li key={c}>
                                <button
                                  className={`sub-item ${active === c ? 'active-sub' : ''}`}
                                  onClick={() => onNavigate(c)}
                                >
                                  {c}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
