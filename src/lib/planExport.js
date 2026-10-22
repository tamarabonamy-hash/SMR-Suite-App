// ─── PLAN PACK EXPORT ─────────────────────────────────────────────────────────
// One Word document for the whole operating plan: strategy on a page,
// ownership, the cascade, the scorecard, open actions and the latest review.

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  BorderStyle, WidthType, ShadingType, PageBreak,
} from 'docx';
import { saveAs } from 'file-saver';
import { STATUS, REVIEW_TYPES, childrenOf, fmtDate, personName, today, topGoals } from '@/components/plan/model';

const C = { DEEP: "2E5A57", TEAL: "557C78", MINT: "A9C3BF", CREAM: "F5F0E7", RAISED: "EEE7DA", INK: "171717", BODY: "3D3A36", MUTED: "6B6760", LINE: "DDD6C8", RED: "B94040", AMBER: "9A6A00" };
const FONT = { serif: "Cormorant Garamond", sans: "IBM Plex Sans", mono: "IBM Plex Mono" };
const WIDTH = 9360;
const STATUS_COLOR = { new: C.MUTED, on: C.TEAL, risk: C.AMBER, off: C.RED, done: C.DEEP };

const LINE = { style: BorderStyle.SINGLE, size: 1, color: C.LINE };
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const BORDERS = { top: LINE, bottom: LINE, left: LINE, right: LINE };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE };

const run = (text, o = {}) => new TextRun({ text: String(text ?? ''), font: o.font || FONT.sans, size: o.size || 20, bold: o.bold, italics: o.italic, color: o.color || C.INK, allCaps: o.caps });
const para = (runs, o = {}) => new Paragraph({ spacing: { before: o.before || 0, after: o.after ?? 100 }, children: Array.isArray(runs) ? runs : [runs] });
const label = text => para(run(text, { font: FONT.mono, size: 16, color: C.MUTED, caps: true }), { before: 240, after: 80 });
const heading = text => para(run(text, { font: FONT.serif, size: 40, bold: true, color: C.DEEP }), { before: 120, after: 120 });
const sub = text => para(run(text, { font: FONT.serif, size: 28, bold: true }), { before: 200, after: 60 });

function cell(children, o = {}) {
  return new TableCell({
    borders: o.borders || BORDERS,
    width: { size: o.width, type: WidthType.DXA },
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 90, bottom: 90, left: 120, right: 120 },
    children: Array.isArray(children) ? children : [para(children, { after: 0 })],
  });
}

function table(headers, rows, widths) {
  return new Table({
    width: { size: WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(run(h, { font: FONT.mono, size: 15, color: C.CREAM, caps: true }), { width: widths[i], fill: C.DEEP })) }),
      ...rows.map((r, ri) => new TableRow({ children: r.map((v, i) => cell(v instanceof TextRun ? v : run(v, { size: 18 }), { width: widths[i], fill: ri % 2 ? C.CREAM : undefined })) })),
    ],
  });
}

const statusRun = s => run((STATUS[s] || STATUS.new).label, { size: 17, bold: true, color: STATUS_COLOR[s] || C.MUTED });

export async function exportPlanPack(plan) {
  const goals = topGoals(plan);
  const who = id => personName(plan, id);
  const latest = plan.reviews[plan.reviews.length - 1];
  const openActions = plan.actions.filter(a => !a.done);

  const cover = new Table({
    width: { size: WIDTH, type: WidthType.DXA },
    columnWidths: [WIDTH],
    rows: [new TableRow({ children: [cell([
      para(run(`${plan.period || ''} Operating plan`.trim(), { font: FONT.mono, size: 16, color: C.MINT, caps: true }), { after: 60 }),
      para(run(plan.org || 'Our plan', { font: FONT.serif, size: 52, bold: true, color: C.CREAM }), { after: 60 }),
      para(run(`Strategy Made Real  ·  ${fmtDate(today())}`, { size: 17, color: "D6E0DD" }), { after: 0 }),
    ], { width: WIDTH, fill: C.DEEP, borders: NO_BORDERS })] })],
  });

  const children = [
    cover,
    heading('Strategy on a page'),
    label('Purpose'), para(run(plan.purpose || '—', { size: 22 })),
    label('3-year ambition'), para(run(plan.ambition || '—', { size: 22 })),
    label("This year's priorities"),
    table(['#', 'Priority', 'Success measure', 'Owner'],
      plan.priorities.map((p, i) => [String(i + 1), p.title, p.measure || '—', who(p.ownerId)]), [500, 3900, 3060, 1900]),
    ...(plan.notDoing.length ? [label('We will not'), ...plan.notDoing.map(t => para(run(`—  ${t}`, { size: 19 }), { after: 40 }))] : []),

    new Paragraph({ children: [new PageBreak()] }),
    heading('Cascade'),
    ...plan.priorities.flatMap((p, i) => {
      const pg = goals.filter(g => g.priorityId === p.id);
      return [
        sub(`${i + 1}. ${p.title}`),
        para(run(`${who(p.ownerId)}${p.measure ? `  ·  ${p.measure}` : ''}`, { size: 18, color: C.MUTED })),
        ...(pg.length ? [table(['Quarterly goal', 'Owner', 'Baseline → target', 'Due', 'Team commitments'],
          pg.map(g => [g.title, who(g.ownerId), `${g.baseline || '0'} → ${g.target || '—'} ${g.measure || ''}`, fmtDate(g.due),
            childrenOf(plan, g.id).map(c => `${c.title} (${who(c.ownerId)})`).join('; ') || '—']),
          [2600, 1400, 1700, 960, 2700])] : [para(run('No goals set yet.', { size: 18, italic: true, color: C.MUTED }))]),
      ];
    }),

    new Paragraph({ children: [new PageBreak()] }),
    heading('Scorecard'),
    table(['Goal', 'Owner', 'Progress', 'Status', 'Latest note'],
      goals.map(g => [g.title, who(g.ownerId), `${g.current || '—'} / ${g.target || '—'}`, statusRun(g.status), g.updates?.[g.updates.length - 1]?.note || '—']),
      [2700, 1400, 1100, 1160, 3000]),

    heading('Open actions'),
    openActions.length
      ? table(['Action', 'Owner', 'Due'], openActions.map(a => [a.text, who(a.ownerId), fmtDate(a.due)]), [5760, 2000, 1600])
      : para(run('No open actions.', { size: 18, italic: true, color: C.MUTED })),

    ...(latest ? [
      heading(`Latest review: ${REVIEW_TYPES[latest.type]?.label || ''}, ${fmtDate(latest.date)}`),
      ...(latest.summary ? [label('Key messages'), para(run(latest.summary, { size: 20 }))] : []),
      ...(latest.decisions.length ? [label('Decisions'), table(['Goal', 'Issue', 'Decision'],
        latest.decisions.map(d => [plan.goals.find(g => g.id === d.goalId)?.title || '—', d.issue || '—', d.decision || '—']), [2600, 3380, 3380])] : []),
    ] : []),
  ];

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT.sans, size: 20, color: C.INK } } } },
    sections: [{ properties: { page: { margin: { top: 1080, bottom: 1080, left: 1440, right: 1440 } } }, children }],
  });

  const blob = await Packer.toBlob(doc);
  const name = (plan.org || 'Operating-plan').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
  saveAs(blob, `SMR-${name}-${today()}.docx`);
}
