import { useEffect, useState } from 'react';
import { emailRequests } from './emailRequests.js';
import { laserJobs } from './laserJobs.js';

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

function usePersisted(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved) return saved;
    } catch { /* ignore */ }
    return initial;
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  }, [key, value]);
  return [value, setValue];
}

// Laser jobs (Sent CNC Document yes/no). Jobs with sentCnc = true flow into Bending & Fitting.
export function useLaser() {
  const [laser, setLaser] = usePersisted('aris-erp-laser-v1', laserJobs);
  const toggleCnc = (job) =>
    setLaser((rs) => rs.map((r) => (r.job === job ? { ...r, sentCnc: !r.sentCnc } : r)));
  return { laser, toggleCnc };
}

// Bending & Fitting form data, keyed by job code (one record per job, so no duplicates).
export function useFitting() {
  const [fitting, setFitting] = usePersisted('aris-erp-fitting-v1', {});
  const saveFitting = (job, data) => setFitting((f) => ({ ...f, [job]: data }));
  return { fitting, saveFitting };
}

// QC records keyed by job code: { status, remark, photos: [dataUrl] }
export function useQc() {
  const [qc, setQc] = usePersisted('aris-erp-qc-v1', {});
  const saveQc = (job, data) => setQc((q) => ({ ...q, [job]: data }));
  return { qc, saveQc };
}
