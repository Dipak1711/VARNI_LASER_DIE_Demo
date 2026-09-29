import { useEffect, useState } from 'react';
import { emailRequests } from './emailRequests.js';

const KEY = 'aris-erp-requests-v1';

// One record per request. `approval` = designer approval, `stage` = Document Progress column
// ('ready' | 'approval' | null). Approved requests always get a stage, so the two pages
// share the same record and can never duplicate it.
const seed = () =>
  emailRequests.map((r) => ({ ...r, stage: r.approval === 'Approved' ? 'ready' : null }));

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved;
  } catch { /* ignore */ }
  return seed();
}

export function useRequests() {
  const [requests, setRequests] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(requests)); } catch { /* ignore */ }
  }, [requests]);

  const setApproval = (id, approval) =>
    setRequests((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const stage = approval === 'Approved' ? r.stage || 'ready' : null;
        return { ...r, approval, stage };
      })
    );

  const moveToApproval = (id) =>
    setRequests((rs) =>
      rs.map((r) => (r.id === id && r.approval === 'Approved' && r.stage === 'ready' ? { ...r, stage: 'approval' } : r))
    );

  return { requests, setApproval, moveToApproval };
}
