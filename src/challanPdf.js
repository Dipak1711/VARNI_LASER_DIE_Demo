import { jsPDF } from 'jspdf';
import { showSize } from './laserJobs.js';

const GREEN = [79, 70, 229];
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// Builds the delivery challan PDF (A4) from the job, challan form, QC and bending/fitting records
export function buildChallanPdf({ job, c, qc, fit }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, M = 14, R = W - M;
  let y = 0;

  const text = (t, x, yy, opts = {}) => {
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(opts.size || 10);
    doc.setTextColor(...(opts.color || [15, 23, 42]));
    doc.text(String(t), x, yy, { align: opts.align, maxWidth: opts.maxWidth });
  };
  const need = (h) => { if (y + h > 280) { doc.addPage(); y = 20; } };
  const section = (title) => {
    need(14);
    y += 4;
    text(title.toUpperCase(), M, y, { bold: true, size: 9, color: GREEN });
    doc.setDrawColor(...GREEN); doc.setLineWidth(0.4); doc.line(M, y + 1.5, R, y + 1.5);
    y += 7;
  };
  const pair = (label, value, x, yy) => {
    text(label, x, yy, { size: 8.5, color: [100, 116, 139] });
    text(value || '—', x, yy + 4.5, { bold: true, size: 10, maxWidth: 80 });
  };

  // header band
  doc.setFillColor(...GREEN); doc.rect(0, 0, W, 30, 'F');
  text('VARNI', M, 14, { bold: true, size: 20, color: [255, 255, 255] });
  text('LASER DIE', M, 20, { size: 8.5, color: [224, 231, 255] });
  text('DELIVERY CHALLAN', R, 15, { bold: true, size: 17, color: [255, 255, 255], align: 'right' });
  text('Original for consignee', R, 21, { size: 8.5, color: [224, 231, 255], align: 'right' });
  y = 40;

  // challan meta
  pair('Challan No.', c.challanNo, M, y);
  pair('Challan Date', fmtDate(c.date), M + 62, y);
  pair('Job Code', job.job, M + 124, y);
  y += 14;
  pair('Vehicle No.', c.vehicle, M, y);
  pair('Transporter', c.transporter, M + 62, y);
  pair('Driver', c.driver ? `${c.driver}${c.driverPhone ? ` (${c.driverPhone})` : ''}` : '', M + 124, y);
  y += 12;

  section('Deliver to');
  text(job.email, M, y, { bold: true, size: 11 });
  y += 6;
  const addr = doc.splitTextToSize(c.address || '—', R - M);
  text(addr, M, y, { size: 10 });
  y += addr.length * 5 + 2;

  // item table
  section('Items');
  const cols = [M, M + 12, M + 100, M + 130, M + 155];
  doc.setFillColor(238, 240, 255); doc.rect(M, y - 4.5, R - M, 8, 'F');
  ['#', 'Description', 'Size', 'Qty', 'QC Status'].forEach((h, i) => text(h, cols[i] + 1.5, y, { bold: true, size: 9 }));
  y += 8;
  text('1', cols[0] + 1.5, y);
  text(`CNC / Laser cut job ${job.job}`, cols[1] + 1.5, y, { maxWidth: 84 });
  text(showSize(job.size), cols[2] + 1.5, y);
  text(`${c.quantity || '—'} pcs`, cols[3] + 1.5, y);
  text(qc?.status || '—', cols[4] + 1.5, y);
  y += 4;
  doc.setDrawColor(221, 225, 236); doc.setLineWidth(0.2); doc.line(M, y, R, y);
  y += 4;

  // production details
  if (fit) {
    section('Production details');
    pair('Operator', fit.operator, M, y);
    pair('Bending machine', fit.machine, M + 62, y);
    pair('Fitting type', fit.fittingType, M + 124, y);
    y += 13;
    pair('Bends / angle', fit.bends || fit.angle ? `${fit.bends || '—'} bends @ ${fit.angle || '—'} deg` : '', M, y);
    pair('Bending done', fit.bendingDone ? `${fit.bendingDone} pcs` : '', M + 62, y);
    pair('Fitting done', fit.fittingDone ? `${fit.fittingDone} pcs` : '', M + 124, y);
    y += 13;
  }

  // QC
  section('Quality check');
  pair('QC status', qc?.status, M, y);
  pair('CNC document sent', job.sentCnc ? 'Yes' : 'No', M + 62, y);
  y += 13;
  if (qc?.remark) {
    text('QC remark', M, y, { size: 8.5, color: [100, 116, 139] });
    y += 4.5;
    const lines = doc.splitTextToSize(qc.remark, R - M);
    text(lines, M, y);
    y += lines.length * 5 + 2;
  }
  if (qc?.photos?.length) {
    need(48);
    text('Product photos', M, y, { size: 8.5, color: [100, 116, 139] });
    y += 3;
    qc.photos.slice(0, 4).forEach((p, i) => {
      try { doc.addImage(p, 'JPEG', M + i * 45, y, 42, 32); } catch { /* skip bad image */ }
    });
    y += 36;
  }

  if (c.notes) {
    section('Notes');
    const lines = doc.splitTextToSize(c.notes, R - M);
    text(lines, M, y);
    y += lines.length * 5;
  }

  // signatures
  need(40);
  y = Math.max(y + 22, 245);
  if (y > 270) { doc.addPage(); y = 245; }
  doc.setDrawColor(90, 100, 92); doc.setLineWidth(0.3);
  [['Prepared by', M], ['Driver signature', M + 66], ['Receiver signature', M + 132]].forEach(([label, x]) => {
    doc.line(x, y, x + 48, y);
    text(label, x + 24, y + 5, { size: 8.5, align: 'center', color: [90, 100, 92] });
  });

  // footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    text(`Generated on ${new Date().toLocaleString('en-IN')}  |  Page ${i} of ${pages}`, W / 2, 290, { size: 8, align: 'center', color: [140, 150, 143] });
  }
  return doc;
}
