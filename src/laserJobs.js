// size is stored as "4x4" and rendered with the × symbol
export const laserJobs = [
  { job: 'JOB-2026-00125', email: 'rajesh@patelfabrication.in', size: '4x4', sentCnc: true, date: '29 Sep 2026, 10:42 AM' },
  { job: 'JOB-2026-00124', email: 'purchase@sunrackindia.com', size: '5x5', sentCnc: false, date: '29 Sep 2026, 09:15 AM' },
  { job: 'JOB-2026-00123', email: 'anita.shah@gmail.com', size: '6x6', sentCnc: false, date: '28 Sep 2026, 06:30 PM' },
  { job: 'JOB-2026-00122', email: 'works@meghaengineering.co.in', size: '4x4', sentCnc: true, date: '28 Sep 2026, 03:05 PM' },
  { job: 'JOB-2026-00121', email: 'ketan@signcraft.in', size: '5x5', sentCnc: true, date: '27 Sep 2026, 11:50 AM' },
  { job: 'JOB-2026-00120', email: 'dev@gujaratsolarstructures.in', size: '6x6', sentCnc: false, date: '27 Sep 2026, 09:20 AM' },
];

export const showSize = (s) => s.replace('x', ' × ');
