// ─── SMR WORD EXPORT LIBRARY ══════════════════════════════════════════════════
// Nine export functions — one per tool — consistent SMR branding throughout
// Uses: docx (browser build via CDN or bundled)
// Usage: import { exportDiagnostic, ... } from './useWordExport'

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat, PageBreak
} from 'docx';
import { saveAs } from 'file-saver';

// ─── BRAND TOKENS ─────────────────────────────────────────────────────────────
const C = {
  GREEN:  "09524F",
  GOLD:   "D8F35E",
  CREAM:  "F5F8F6",
  S2:     "FFFFFF",
  S3:     "EEF4F1",
  T1:     "10211F",
  T2:     "37534F",
  T3:     "34524E",
  T4:     "667A76",
  RED:    "B94040",
  AMBER:  "9A6A00",
  GMID:   "0E6964",
  WHITE:  "FFFFFF",
  LIGHT:  "F5F8F6",
};

// ─── SHARED HELPERS ────────────────────────────────────────────────────────────
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
const RED_BORDER = { style: BorderStyle.SINGLE, size: 1, color: C.RED };
const GOLD_BORDER = { style: BorderStyle.SINGLE, size: 1, color: C.GOLD };

const CONTENT_WIDTH = 9360; // US Letter, 1" margins

function run(text, opts = {}) {
  return new TextRun({
    text: String(text || ''),
    font: "IBM Plex Sans",
    size: opts.size || 20,
    bold: opts.bold || false,
    color: opts.color || C.T1,
    italics: opts.italic || false,
    allCaps: opts.caps || false,
  });
}

function para(children, opts = {}) {
  const runs = Array.isArray(children) ? children : [children];
  return new Paragraph({
    spacing: { before: opts.before || 0, after: opts.after || 100 },
    alignment: opts.align || AlignmentType.LEFT,
    children: typeof runs[0] === 'string'
      ? [run(runs[0], opts)]
      : runs,
    border: opts.border || undefined,
  });
}

function blank(space = 80) {
  return new Paragraph({ spacing: { before: 0, after: space }, children: [run('')] });
}

function rule(color = C.GOLD) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color } },
    children: [run('')],
  });
}

function sectionLabel(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [run(text, { size: 17, bold: true, color: C.T4, caps: true })],
  });
}

function heading(text, level = 1) {
  return new Paragraph({
    spacing: { before: level === 1 ? 240 : 160, after: 100 },
    children: [run(text, {
      size: level === 1 ? 28 : level === 2 ? 22 : 20,
      bold: true,
      color: level === 1 ? C.GREEN : C.T1,
    })],
  });
}

function bullet(text, color = C.GREEN) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    numbering: { reference: "smr-bullets", level: 0 },
    children: [run(text, { size: 19 })],
  });
}

function cell(children, opts = {}) {
  const kids = Array.isArray(children) ? children : [para(children, { after: 0 })];
  return new TableCell({
    borders: opts.borders || BORDERS,
    width: { size: opts.width || 4680, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: opts.pad || 100, bottom: opts.pad || 100, left: opts.padH || 140, right: opts.padH || 140 },
    verticalAlign: opts.vAlign || undefined,
    columnSpan: opts.span || undefined,
    children: kids,
  });
}

function headerBlock(toolNum, toolLabel, title, subtitle, date) {
  return [
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [CONTENT_WIDTH],
      rows: [new TableRow({ children: [
        new TableCell({
          borders: NO_BORDERS,
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          shading: { fill: C.GREEN, type: ShadingType.CLEAR },
          margins: { top: 240, bottom: 240, left: 280, right: 280 },
          children: [
            new Paragraph({ spacing: { before: 0, after: 40 }, children: [
              run(`Tool ${toolNum}  ·  ${toolLabel}`, { size: 16, color: C.GOLD, caps: true }),
            ]}),
            new Paragraph({ spacing: { before: 0, after: 40 }, children: [
              run(title, { size: 30, bold: true, color: C.WHITE }),
            ]}),
            subtitle ? new Paragraph({ spacing: { before: 0, after: 0 }, children: [
              run(subtitle, { size: 18, color: "CCCCCC", italic: true }),
            ]}) : blank(0),
          ],
        }),
      ]})]
    }),
    new Paragraph({ spacing: { before: 0, after: 60 }, children: [
      run(`Strategy Made Real  ·  Generated ${date}`, { size: 16, italic: true, color: C.T4 }),
    ]}),
    rule(),
  ];
}

function metaRow(label, value, widths = [2800, 6560]) {
  return new TableRow({ children: [
    cell(para(run(label, { bold: true, color: C.T4, size: 18 }), { after: 0 }), { borders: NO_BORDERS, width: widths[0], pad: 50, padH: 0 }),
    cell(para(run(value || '—', { size: 18 }), { after: 0 }), { borders: NO_BORDERS, width: widths[1], pad: 50, padH: 0 }),
  ]});
}

function metaTable(rows, widths = [2800, 6560]) {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map(([l, v]) => metaRow(l, v, widths)),
  });
}

function scoreBar(label, score, max = 5, color = C.GREEN) {
  const pct = Math.round((score / max) * 100);
  const filled = Math.round((score / max) * 40);
  const bar = '█'.repeat(filled) + '░'.repeat(40 - filled);
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [
      run(`${label}`, { size: 18, bold: true, color: C.T1 }),
      run(`  ${score}/${max}  `, { size: 18, color }),
      run(bar, { size: 14, color: color + '88' }),
    ],
  });
}

function numbering() {
  return {
    config: [{
      reference: "smr-bullets",
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: "\u2013",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 560, hanging: 360 } } },
      }],
    }],
  };
}

function pageProps() {
  return {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
    },
  };
}

async function saveDoc(doc, filename) {
  const buf = await Packer.toBlob(doc);
  saveAs(buf, filename);
}

const today = () => new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

// ─── TOOL 01 — STRATEGY DIAGNOSTIC ════════════════════════════════════════════
export async function exportDiagnostic({ scores, dims, slabels, risks, cautions, strengths, roadmapActions, riskMsgs }) {
  const date = today();
  const vals = dims.map(d => scores[d.id] || 0);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const ml = avg < 2 ? 'Critical' : avg < 3 ? 'Weak' : avg < 4 ? 'Developing' : avg < 5 ? 'Capable' : 'Leading';

  const scoreColor = s => !s ? C.T4 : s <= 2 ? C.RED : s === 3 ? C.AMBER : C.GMID;
  const tierColor  = t => t === 'Immediate' ? C.RED : t === 'Short-Term' ? C.AMBER : C.GMID;

  const doc = new Document({
    numbering: numbering(),
    sections: [{
      properties: pageProps(),
      children: [
        ...headerBlock('01', 'Think', 'Strategy Diagnostic', 'Where is strategy getting stuck?', date),

        // Overall score
        sectionLabel('Overall Maturity Score'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [2400, 6960],
          rows: [new TableRow({ children: [
            cell([
              para(run(avg.toFixed(1), { size: 52, bold: true, color: C.GOLD }), { after: 40 }),
              para(run(`/ 5.0  —  ${ml}`, { size: 20, color: C.T3 }), { after: 0 }),
            ], { borders: NO_BORDERS, width: 2400 }),
            cell([
              para(run(avg < 2.5
                ? 'Your organisation is at real risk of execution failure. Urgent action needed before the next major initiative.'
                : avg < 3.5
                ? 'Meaningful gaps between strategy and delivery. Progress is fragile without deliberate action.'
                : avg < 4.5
                ? 'The foundations are solid, but gaps remain that will compound under delivery pressure.'
                : 'Executing with genuine discipline. Protect what is working and build on it systematically.',
              { size: 19, italic: true, color: C.T3 }), { after: 60 }),
              new Table({
                width: { size: 6760, type: WidthType.DXA },
                columnWidths: [2253, 2253, 2254],
                rows: [
                  new TableRow({ children: [
                    cell([para(run(String(risks.length), { size: 36, bold: true, color: C.RED }), { after: 0 }), para(run('Critical', { size: 16, color: C.T4 }), { after: 0 })], { width: 2253, fill: C.LIGHT }),
                    cell([para(run(String(cautions.length), { size: 36, bold: true, color: C.AMBER }), { after: 0 }), para(run('Caution', { size: 16, color: C.T4 }), { after: 0 })], { width: 2253, fill: C.LIGHT }),
                    cell([para(run(String(strengths.length), { size: 36, bold: true, color: C.GMID }), { after: 0 }), para(run('Strength', { size: 16, color: C.T4 }), { after: 0 })], { width: 2254, fill: C.LIGHT }),
                  ]}),
                ],
              }),
            ], { borders: NO_BORDERS, width: 6960 }),
          ]})]
        }),

        blank(),
        rule(),

        // Dimension breakdown
        sectionLabel('Dimension Breakdown'),
        ...dims.map(dim => {
          const s = scores[dim.id] || 0;
          const col = scoreColor(s);
          return new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              run(`${dim.num}  ${dim.label}`, { size: 19, bold: true, color: C.T1 }),
              run(`     ${s > 0 ? s + ' — ' + (slabels[s] || '') : 'Not scored'}`, { size: 18, color: col }),
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "EEEEEE" } },
          });
        }),

        blank(),
        rule(),

        // Risk areas
        ...(risks.length > 0 ? [
          sectionLabel('Key Risk Areas'),
          ...risks.flatMap(d => [
            para(run(d.label, { size: 20, bold: true, color: C.RED }), { before: 120, after: 60 }),
            para(run(riskMsgs[d.id] || '', { size: 18, color: C.T3, italic: true }), { after: 80,
              border: { left: { style: BorderStyle.SINGLE, size: 6, color: C.RED } } }),
          ]),
          blank(),
          rule(),
        ] : []),

        // Roadmap
        sectionLabel('Improvement Roadmap'),
        ...[
          { label: 'Immediate — Address First', dims: risks, color: C.RED, note: 'Act before the next major initiative begins.' },
          { label: 'Short-Term — Strengthen', dims: cautions, color: C.AMBER, note: 'Embed into your programme plan in the next 90 days.' },
          { label: 'Sustain — Protect Strengths', dims: strengths, color: C.GMID, note: 'Strengths erode under pressure. Keep investing in them.' },
        ].filter(t => t.dims.length > 0).flatMap(tier => [
          para([run(tier.label, { size: 19, bold: true, color: tier.color })], { before: 160, after: 40 }),
          para(run(tier.note, { size: 17, italic: true, color: C.T4 }), { after: 80 }),
          ...tier.dims.flatMap(dim => [
            para(run(dim.label, { size: 18, bold: true, color: C.T2 }), { before: 80, after: 40 }),
            ...(roadmapActions[dim.id] || []).map(a => bullet(a)),
            blank(40),
          ]),
        ]),

        blank(),
        rule(C.T4),
        para(run('Strategy Made Real  ·  strategymadereal.com.au', { size: 16, color: C.T4, italic: true }), { align: AlignmentType.CENTER }),
      ],
    }],
  });

  await saveDoc(doc, `SMR-Strategy-Diagnostic-${date.replace(/ /g, '-')}.docx`);
}

// ─── TOOL 02 — PRIORITY SETTING ════════════════════════════════════════════════
export async function exportPrioritisation({ initiatives }) {
  const date = today();

  const getTier = s => s >= 3.8 ? 'Do Now' : s >= 2.8 ? 'Plan' : s >= 2.0 ? 'Defer' : 'Stop';
  const tierColor = t => t === 'Do Now' ? C.GMID : t === 'Plan' ? C.AMBER : t === 'Defer' ? C.T4 : C.RED;

  const colWidths = [3200, 1600, 1600, 1480, 1480];

  const doc = new Document({
    numbering: numbering(),
    sections: [{
      properties: pageProps(),
      children: [
        ...headerBlock('02', 'Think', 'Priority Setting', 'Do we know what matters most?', date),

        sectionLabel('Priority Rankings'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: colWidths,
          rows: [
            new TableRow({ children: [
              ...['Initiative', 'Owner', 'Score', 'Tier', 'Action'].map((h, i) =>
                cell(para(run(h, { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: colWidths[i], fill: C.GREEN, pad: 100 })
              ),
            ]}),
            ...initiatives.map((init, idx) => {
              const tier = getTier(init.weightedScore);
              const tc = tierColor(tier);
              return new TableRow({ children: [
                cell(para(run(init.name, { size: 18, bold: true }), { after: 0 }), { borders: BORDERS, width: colWidths[0], fill: idx % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run(init.owner || '—', { size: 17 }), { after: 0 }), { borders: BORDERS, width: colWidths[1], fill: idx % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run(init.weightedScore.toFixed(2), { size: 18, bold: true, color: tc }), { after: 0 }), { borders: BORDERS, width: colWidths[2], fill: idx % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run(tier, { size: 17, bold: true, color: tc }), { after: 0 }), { borders: BORDERS, width: colWidths[3], fill: tc + '15', pad: 90 }),
                cell(para(run('—', { size: 17, color: C.T4 }), { after: 0 }), { borders: BORDERS, width: colWidths[4], fill: idx % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
              ]});
            }),
          ],
        }),

        blank(),
        rule(),
        sectionLabel('Tier Summary'),

        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [2340, 2340, 2340, 2340],
          rows: [
            new TableRow({ children: [
              ...['Do Now', 'Plan', 'Defer', 'Stop'].map(tier => {
                const items = initiatives.filter(i => getTier(i.weightedScore) === tier);
                const tc = tierColor(tier);
                return cell([
                  para(run(tier, { size: 20, bold: true, color: tc }), { after: 60 }),
                  para(run(String(items.length) + ' initiative' + (items.length !== 1 ? 's' : ''), { size: 36, bold: true, color: tc }), { after: 80 }),
                  ...items.map(i => para(run(i.name, { size: 17, color: C.T3 }), { after: 30 })),
                ], { borders: BORDERS, width: 2340, fill: tc + '10', pad: 140 });
              }),
            ]}),
          ],
        }),

        blank(),
        sectionLabel('Scoring Criteria Reference'),
        ...['Strategic Alignment (30%) — How directly does this advance the agreed strategy?',
            'Business Impact (25%) — What is the scale of value if this succeeds?',
            'Feasibility (20%) — How achievable is this given current capability and capacity?',
            'Urgency (15%) — What is the real cost of delay?',
            'Organisation Readiness (10%) — Are people, process, and technology ready?',
        ].map(c => bullet(c)),

        blank(),
        rule(C.T4),
        para(run('Strategy Made Real  ·  strategymadereal.com.au', { size: 16, color: C.T4, italic: true }), { align: AlignmentType.CENTER }),
      ],
    }],
  });

  await saveDoc(doc, `SMR-Priority-Setting-${date.replace(/ /g, '-')}.docx`);
}

// ─── TOOL 03 — DECISION MAPPING ════════════════════════════════════════════════
export async function exportDecisionStack({ title, names, scores, ws, winner, dims }) {
  const date = today();
  const opts = ['a', 'b', 'c'];
  const COMMIT_LABELS = { full: 'Full Commit', pilot: 'Test and Learn', defer: 'Defer', stop: 'Do Not Do' };
  const winnerIdx = opts.indexOf(winner);
  const winnerName = names[winnerIdx] || `Option ${winner.toUpperCase()}`;

  const doc = new Document({
    numbering: numbering(),
    sections: [{
      properties: pageProps(),
      children: [
        ...headerBlock('03', 'Think', 'Decision Mapping', 'What needs to be decided?', date),

        sectionLabel('Decision'),
        para(run(title, { size: 24, bold: true, color: C.T1 }), { after: 60 }),
        rule(),

        sectionLabel('Recommendation'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [CONTENT_WIDTH],
          rows: [new TableRow({ children: [
            cell([
              para(run('Recommended Option', { size: 16, color: C.GOLD, caps: true }), { after: 40 }),
              para(run(winnerName, { size: 28, bold: true, color: C.WHITE }), { after: 40 }),
              para(run(`Weighted score: ${ws[winner].toFixed(2)} / 5.0`, { size: 18, color: "CCCCCC" }), { after: 0 }),
            ], { borders: NO_BORDERS, width: CONTENT_WIDTH, fill: C.GREEN, pad: 200, padH: 240 }),
          ]})]
        }),

        blank(),
        sectionLabel('Option Comparison'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [2600, 2253, 2253, 2254],
          rows: [
            new TableRow({ children: [
              cell(para(run('Dimension', { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 2600, fill: C.GREEN, pad: 100 }),
              ...opts.map((o, i) => cell(para(run(names[i] || `Option ${o.toUpperCase()}`, { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 2253 + (i === 2 ? 1 : 0), fill: C.GREEN, pad: 100 })),
            ]}),
            ...dims.map((dim, ri) => new TableRow({ children: [
              cell(para([run(dim.label, { size: 18, bold: true }), run(`  (${Math.round(dim.weight * 100)}%)`, { size: 16, color: C.T4 })], { after: 0 }), { borders: BORDERS, width: 2600, fill: ri % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
              ...opts.map((o, i) => {
                const s = scores[o][dim.id] || 0;
                return cell(para(run(String(s), { size: 20, bold: true, color: s >= 4 ? C.GMID : s >= 3 ? C.AMBER : s > 0 ? C.RED : C.T4 }), { after: 0, align: AlignmentType.CENTER }),
                  { borders: BORDERS, width: 2253 + (i === 2 ? 1 : 0), fill: ri % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 });
              }),
            ]})),
            new TableRow({ children: [
              cell(para(run('Weighted Total', { bold: true, size: 18, color: C.T1 }), { after: 0 }), { borders: BORDERS, width: 2600, fill: "F0EDE8", pad: 100 }),
              ...opts.map((o, i) => {
                const isWin = o === winner;
                return cell(para(run(ws[o].toFixed(2), { size: 20, bold: true, color: isWin ? C.GREEN : C.T3 }), { after: 0, align: AlignmentType.CENTER }),
                  { borders: BORDERS, width: 2253 + (i === 2 ? 1 : 0), fill: isWin ? C.GOLD + '20' : "F0EDE8", pad: 100 });
              }),
            ]}),
          ],
        }),

        blank(),
        rule(C.T4),
        para(run('Strategy Made Real  ·  strategymadereal.com.au', { size: 16, color: C.T4, italic: true }), { align: AlignmentType.CENTER }),
      ],
    }],
  });

  await saveDoc(doc, `SMR-Decision-Mapping-${date.replace(/ /g, '-')}.docx`);
}

// ─── TOOL 04 — ROLE SUCCESS PROFILE ═══════════════════════════════════════════
export async function exportRoleAnalyser({ form, result }) {
  const date = today();

  const section = (num, title, children) => [
    blank(80),
    new Paragraph({
      spacing: { before: 160, after: 80 },
      border: { left: { style: BorderStyle.SINGLE, size: 8, color: C.GOLD } },
      children: [
        run(`  ${num}  `, { size: 16, color: C.GOLD }),
        run(title, { size: 22, bold: true, color: C.T1 }),
      ],
    }),
    ...children,
  ];

  const pillars = result.accountabilityPillars || [];
  const responsibilities = result.responsibilitiesByPillar || [];
  const competencies = result.keyCompetencies || [];
  const successItems = result.whatSuccessLooksLike || [];
  const decisionRights = result.decisionRights || {};
  const influence = result.circleOfInfluence || {};
  const values = result.valuesAndBehaviours || [];
  const metrics = result.timeBasedMetrics || {};

  const doc = new Document({
    numbering: numbering(),
    sections: [{
      properties: pageProps(),
      children: [
        // Cover block
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [CONTENT_WIDTH],
          rows: [new TableRow({ children: [
            cell([
              para(run('Role Success Profile', { size: 16, color: C.GOLD, caps: true }), { after: 40 }),
              para(run(form.role || 'Role Title', { size: 34, bold: true, color: C.WHITE }), { after: 40 }),
              para(run(form.org || '', { size: 20, color: "CCCCCC" }), { after: 40 }),
              para([
                ...[form.level, form.func, form.location].filter(Boolean).flatMap((v, i, a) => [
                  run(v, { size: 17, color: "AAAAAA" }),
                  ...(i < a.length - 1 ? [run('  ·  ', { size: 17, color: "666666" })] : []),
                ]),
              ], { after: 0 }),
            ], { borders: NO_BORDERS, width: CONTENT_WIDTH, fill: C.GREEN, pad: 280, padH: 280 }),
          ]})]
        }),

        para(run(`Strategy Made Real  ·  Generated ${date}`, { size: 16, italic: true, color: C.T4 }), { before: 60, after: 0 }),
        rule(),

        // Role context table
        sectionLabel('Role Context'),
        metaTable([
          ['Reports To', result.roleContext?.reportsTo || form.reportsTo || '—'],
          ['Function', result.roleContext?.function || form.func || '—'],
          ['Direct Reports', form.reports || '—'],
          ['Location', result.roleContext?.location || form.location || '—'],
        ]),

        blank(),
        sectionLabel('Organisation Purpose'),
        para(run(result.purposeAndStrategy?.organisationPurpose || '—', { size: 19, color: C.T2 }), { after: 60 }),
        sectionLabel('Strategic Contribution of This Role'),
        para(run(result.purposeAndStrategy?.roleContribution || '—', { size: 19, color: C.T2 }), { after: 60 }),

        rule(),

        // Role success statement
        sectionLabel('Role Success Statement'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [CONTENT_WIDTH],
          rows: [new TableRow({ children: [
            cell([para(run(result.roleSuccessStatement || '—', { size: 20, color: C.T1 }), { after: 0 })],
              { borders: { top: GOLD_BORDER, bottom: GOLD_BORDER, left: { style: BorderStyle.SINGLE, size: 6, color: C.GOLD }, right: GOLD_BORDER },
                width: CONTENT_WIDTH, fill: C.CREAM, pad: 180, padH: 200 }),
          ]})]
        }),

        ...section('01', 'Core Accountability Pillars', [
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: Array(Math.min(pillars.length, 3)).fill(Math.floor(CONTENT_WIDTH / Math.min(pillars.length, 3))),
            rows: [new TableRow({ children: pillars.slice(0, 3).map((p, i) => cell([
              para(run(String(i + 1).padStart(2, '0'), { size: 16, color: C.GOLD }), { after: 30 }),
              para(run(p, { size: 18, bold: true, color: C.WHITE }), { after: 0 }),
            ], { borders: NO_BORDERS, width: Math.floor(CONTENT_WIDTH / 3), fill: C.GREEN, pad: 160, padH: 180 })) })],
          }),
          blank(60),
          ...(pillars.length > 3 ? [new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: Array(pillars.length - 3).fill(Math.floor(CONTENT_WIDTH / (pillars.length - 3))),
            rows: [new TableRow({ children: pillars.slice(3).map((p, i) => cell([
              para(run(String(i + 4).padStart(2, '0'), { size: 16, color: C.GOLD }), { after: 30 }),
              para(run(p, { size: 18, bold: true, color: C.WHITE }), { after: 0 }),
            ], { borders: NO_BORDERS, width: Math.floor(CONTENT_WIDTH / (pillars.length - 3)), fill: C.GREEN, pad: 160, padH: 180 })) })],
          })] : []),
        ]),

        ...section('02', 'Responsibilities by Pillar',
          responsibilities.flatMap(pillar => [
            para([run(pillar.pillar, { size: 20, bold: true, color: C.T1 })], { before: 120, after: 40,
              border: { left: { style: BorderStyle.SINGLE, size: 6, color: C.GOLD } } }),
            para(run(pillar.purpose || '', { size: 17, italic: true, color: C.T4 }), { before: 0, after: 60 }),
            ...(pillar.responsibilities || []).map(r => bullet(r)),
            blank(40),
          ])
        ),

        ...section('03', 'Key Competencies', [
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: [4680, 4680],
            rows: competencies.reduce((rows, c, i) => {
              if (i % 2 === 0) rows.push([]);
              rows[rows.length - 1].push(c);
              return rows;
            }, []).map(pair => new TableRow({ children: pair.map(c => cell([
              para(run(c.name, { size: 18, bold: true, color: C.T1 }), { after: 30 }),
              para(run(c.description, { size: 17, color: C.T3 }), { after: 0 }),
            ], { borders: BORDERS, width: 4680, fill: C.LIGHT, pad: 140 }))})),
          }),
        ]),

        ...section('04', 'Decision Rights', [
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: [3120, 3120, 3120],
            rows: [
              new TableRow({ children: [
                cell(para(run('Owns Decisions', { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 3120, fill: C.GOLD, pad: 100 }),
                cell(para(run('Influences', { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 3120, fill: C.GMID, pad: 100 }),
                cell(para(run('Escalates', { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 3120, fill: C.AMBER, pad: 100 }),
              ]}),
              new TableRow({ children: [
                cell((decisionRights.owns || []).map(d => para(run(d, { size: 17 }), { after: 30 })), { borders: BORDERS, width: 3120, fill: C.WHITE, pad: 100 }),
                cell((decisionRights.influences || []).map(d => para(run(d, { size: 17 }), { after: 30 })), { borders: BORDERS, width: 3120, fill: C.WHITE, pad: 100 }),
                cell((decisionRights.escalates || []).map(d => para(run(d, { size: 17 }), { after: 30 })), { borders: BORDERS, width: 3120, fill: C.WHITE, pad: 100 }),
              ]}),
            ],
          }),
        ]),

        ...section('05', 'Time-Based Success Metrics', [
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: [3120, 3120, 3120],
            rows: [
              new TableRow({ children: [
                cell(para(run('Quarterly Priorities', { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 3120, fill: C.GOLD, pad: 100 }),
                cell(para(run('6-Month Goals', { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 3120, fill: C.GMID, pad: 100 }),
                cell(para(run('Annual Measures', { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 3120, fill: C.GREEN, pad: 100 }),
              ]}),
              new TableRow({ children: [
                cell((metrics.quarterly || []).map((m, i) => para([run(`${i + 1}.  `, { size: 16, color: C.GOLD }), run(m, { size: 17 })], { after: 40 })), { borders: BORDERS, width: 3120, fill: C.WHITE, pad: 100 }),
                cell((metrics.sixMonth || []).map((m, i) => para([run(`${i + 1}.  `, { size: 16, color: C.GMID }), run(m, { size: 17 })], { after: 40 })), { borders: BORDERS, width: 3120, fill: C.WHITE, pad: 100 }),
                cell((metrics.annual || []).map((m, i) => para([run(`${i + 1}.  `, { size: 16, color: C.GREEN }), run(m, { size: 17 })], { after: 40 })), { borders: BORDERS, width: 3120, fill: C.WHITE, pad: 100 }),
              ]}),
            ],
          }),
        ]),

        blank(),
        rule(C.T4),
        para(run('Strategy Made Real  ·  strategymadereal.com.au', { size: 16, color: C.T4, italic: true }), { align: AlignmentType.CENTER }),
      ],
    }],
  });

  await saveDoc(doc, `SMR-Role-Profile-${(form.role || 'Role').replace(/ /g, '-')}-${date.replace(/ /g, '-')}.docx`);
}

// ─── TOOL 05 — DELIVERY READINESS ══════════════════════════════════════════════
export async function exportCapability({ domains, scores, imp, notes }) {
  const date = today();
  const capColor = s => !s ? C.T4 : s === 1 ? C.RED : s === 2 ? 'C0622A' : s === 3 ? C.AMBER : s === 4 ? C.GMID : '2C6B52';
  const capLabel = s => ['', 'Critical Gap', 'Significant Gap', 'Partial', 'Capable', 'Strong'][s] || '—';

  const critGaps = domains.filter(d => scores[d.id] === 1);
  const sigGaps  = domains.filter(d => scores[d.id] === 2);
  const partial  = domains.filter(d => scores[d.id] === 3);
  const capable  = domains.filter(d => scores[d.id] === 4);
  const strong   = domains.filter(d => scores[d.id] === 5);

  const doc = new Document({
    numbering: numbering(),
    sections: [{
      properties: pageProps(),
      children: [
        ...headerBlock('05', 'Do', 'Delivery Readiness', 'Can we actually deliver it?', date),

        sectionLabel('Summary'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [1872, 1872, 1872, 1872, 1872],
          rows: [new TableRow({ children: [
            ...[[critGaps.length, 'Critical Gaps', C.RED], [sigGaps.length, 'Sig. Gaps', 'C0622A'], [partial.length, 'Partial', C.AMBER], [capable.length, 'Capable', C.GMID], [strong.length, 'Strong', '2C6B52']].map(([n, l, col]) =>
              cell([para(run(String(n), { size: 36, bold: true, color: col }), { after: 30 }), para(run(l, { size: 16, color: C.T4 }), { after: 0 })], { borders: BORDERS, width: 1872, fill: col + '12', pad: 120 })
            ),
          ]})]
        }),

        blank(),
        sectionLabel('Capability Assessment'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3200, 1400, 3160, 1600],
          rows: [
            new TableRow({ children: [
              cell(para(run('Domain', { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 3200, fill: C.GREEN, pad: 100 }),
              cell(para(run('Score', { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 1400, fill: C.GREEN, pad: 100 }),
              cell(para(run('Notes', { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 3160, fill: C.GREEN, pad: 100 }),
              cell(para(run('Status', { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: 1600, fill: C.GREEN, pad: 100 }),
            ]}),
            ...domains.map((d, i) => {
              const s = scores[d.id] || 0;
              const col = capColor(s);
              return new TableRow({ children: [
                cell([para(run(d.label, { size: 18, bold: true }), { after: 20 }), para(run(d.sub, { size: 16, color: C.T4 }), { after: 0 })], { borders: BORDERS, width: 3200, fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run(s > 0 ? String(s) : '—', { size: 22, bold: true, color: col }), { after: 0, align: AlignmentType.CENTER }), { borders: BORDERS, width: 1400, fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run(notes[d.id] || '—', { size: 17, color: C.T3, italic: !notes[d.id] }), { after: 0 }), { borders: BORDERS, width: 3160, fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run(capLabel(s), { size: 16, bold: true, color: col }), { after: 0 }), { borders: BORDERS, width: 1600, fill: col + '12', pad: 90 }),
              ]});
            }),
          ],
        }),

        ...(critGaps.length > 0 ? [
          blank(),
          sectionLabel('Priority Actions — Critical Gaps'),
          ...critGaps.flatMap(d => [
            para(run(d.label, { size: 19, bold: true, color: C.RED }), { before: 120, after: 40 }),
            bullet('Immediate external hire, partnership, or outsourcing decision required'),
            bullet('Assess whether this capability is core to delivery or can be sourced externally'),
            bullet('Define a 90-day plan to close the gap before delivery scales'),
            blank(40),
          ]),
        ] : []),

        blank(),
        rule(C.T4),
        para(run('Strategy Made Real  ·  strategymadereal.com.au', { size: 16, color: C.T4, italic: true }), { align: AlignmentType.CENTER }),
      ],
    }],
  });

  await saveDoc(doc, `SMR-Delivery-Readiness-${date.replace(/ /g, '-')}.docx`);
}

// ─── TOOL 06 — OPERATING RHYTHM ════════════════════════════════════════════════
export async function exportRhythm({ orgName, meetings }) {
  const date = today();
  const layers = ['Individual', 'Team', 'Leadership', 'Governance', 'Organisation'];
  const colWidths = [2600, 1400, 1200, 2960, 1200];

  const doc = new Document({
    numbering: numbering(),
    sections: [{
      properties: pageProps(),
      children: [
        ...headerBlock('06', 'Do', 'Operating Rhythm', 'How will we keep it moving?', date),

        orgName ? metaTable([['Programme / Organisation', orgName]]) : blank(0),
        blank(),

        ...layers.filter(l => meetings.some(m => m.layer === l)).flatMap(layer => {
          const layerMeetings = meetings.filter(m => m.layer === layer);
          return [
            sectionLabel(layer + ' Layer'),
            new Table({
              width: { size: CONTENT_WIDTH, type: WidthType.DXA },
              columnWidths: colWidths,
              rows: [
                new TableRow({ children: ['Meeting', 'Cadence', 'Duration', 'Purpose', 'Owner'].map((h, i) =>
                  cell(para(run(h, { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: colWidths[i], fill: C.GREEN, pad: 90 })
                )}),
                ...layerMeetings.map((m, i) => new TableRow({ children: [
                  cell(para(run(m.label, { size: 18, bold: true }), { after: 0 }), { borders: BORDERS, width: colWidths[0], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                  cell(para(run(m.cadence, { size: 17 }), { after: 0 }), { borders: BORDERS, width: colWidths[1], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                  cell(para(run(m.duration, { size: 17 }), { after: 0 }), { borders: BORDERS, width: colWidths[2], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                  cell(para(run(m.purpose, { size: 17, color: C.T3 }), { after: 0 }), { borders: BORDERS, width: colWidths[3], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                  cell(para(run(m.owner || '—', { size: 17, color: C.T3 }), { after: 0 }), { borders: BORDERS, width: colWidths[4], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                ]})),
              ],
            }),
            blank(),
          ];
        }),

        rule(C.T4),
        para(run('Strategy Made Real  ·  strategymadereal.com.au', { size: 16, color: C.T4, italic: true }), { align: AlignmentType.CENTER }),
      ],
    }],
  });

  await saveDoc(doc, `SMR-Operating-Rhythm-${date.replace(/ /g, '-')}.docx`);
}

// ─── TOOL 07 — PERFORMANCE MEASURES ════════════════════════════════════════════
export async function exportKPIs({ kpis, pillars }) {
  const date = today();
  const colWidths = [2800, 1600, 1200, 1080, 2680];

  const doc = new Document({
    numbering: numbering(),
    sections: [{
      properties: pageProps(),
      children: [
        ...headerBlock('07', 'Do', 'Performance Measures', 'How will we know it is working?', date),

        sectionLabel('Scorecard Overview'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [new TableRow({ children: [
            cell([para(run(String(kpis.length), { size: 40, bold: true, color: C.GREEN }), { after: 30 }), para(run('Total KPIs', { size: 17, color: C.T4 }), { after: 0 })], { borders: BORDERS, width: 3120, fill: C.CREAM, pad: 140 }),
            cell([para(run(String(kpis.filter(k => k.lead).length), { size: 40, bold: true, color: C.GMID }), { after: 30 }), para(run('Lead Indicators', { size: 17, color: C.T4 }), { after: 0 })], { borders: BORDERS, width: 3120, fill: C.CREAM, pad: 140 }),
            cell([para(run(String(kpis.filter(k => !k.lead).length), { size: 40, bold: true, color: C.AMBER }), { after: 30 }), para(run('Lag Indicators', { size: 17, color: C.T4 }), { after: 0 })], { borders: BORDERS, width: 3120, fill: C.CREAM, pad: 140 }),
          ]})]
        }),

        blank(),
        ...pillars.filter(p => kpis.some(k => k.pillar === p.id)).flatMap(pillar => {
          const pillarKPIs = kpis.filter(k => k.pillar === pillar.id);
          return [
            sectionLabel(pillar.label),
            new Table({
              width: { size: CONTENT_WIDTH, type: WidthType.DXA },
              columnWidths: colWidths,
              rows: [
                new TableRow({ children: ['KPI', 'Target', 'Frequency', 'Type', 'Formula'].map((h, i) =>
                  cell(para(run(h, { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: colWidths[i], fill: C.GREEN, pad: 90 })
                )}),
                ...pillarKPIs.map((kpi, i) => new TableRow({ children: [
                  cell(para(run(kpi.name, { size: 18, bold: true }), { after: 0 }), { borders: BORDERS, width: colWidths[0], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                  cell(para(run(kpi.target, { size: 17, bold: true, color: C.GREEN }), { after: 0 }), { borders: BORDERS, width: colWidths[1], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                  cell(para(run(kpi.frequency, { size: 17 }), { after: 0 }), { borders: BORDERS, width: colWidths[2], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                  cell(para(run(kpi.lead ? 'Lead' : 'Lag', { size: 16, bold: true, color: kpi.lead ? C.GMID : C.AMBER }), { after: 0 }), { borders: BORDERS, width: colWidths[3], fill: (kpi.lead ? C.GMID : C.AMBER) + '12', pad: 90 }),
                  cell(para(run(kpi.formula, { size: 15, color: C.T4, italic: true }), { after: 0 }), { borders: BORDERS, width: colWidths[4], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                ]})),
              ],
            }),
            blank(),
          ];
        }),

        rule(C.T4),
        para(run('Strategy Made Real  ·  strategymadereal.com.au', { size: 16, color: C.T4, italic: true }), { align: AlignmentType.CENTER }),
      ],
    }],
  });

  await saveDoc(doc, `SMR-Performance-Measures-${date.replace(/ /g, '-')}.docx`);
}

// ─── TOOL 08 — ADOPTION PLANNING ═══════════════════════════════════════════════
export async function exportChange({ changeName, changeType, groups, scope, adkarScores, rfactors, adkar, resistance, resResp, interventions }) {
  const date = today();

  const adkarColor = s => !s ? C.T4 : s <= 2 ? C.RED : s === 3 ? C.AMBER : C.GMID;
  const adkarLabel = s => ['—', 'Very Low', 'Low', 'Moderate', 'High', 'Very High'][s] || '—';
  const weakest = adkar.reduce((min, el) => {
    const s = adkarScores[el.id] || 0;
    const ms = adkarScores[min?.id] || 6;
    return s > 0 && s < ms ? el : min;
  }, null);

  const doc = new Document({
    numbering: numbering(),
    sections: [{
      properties: pageProps(),
      children: [
        ...headerBlock('08', 'Enable', 'Adoption Planning', 'Will people actually change how they work?', date),

        sectionLabel('Change Overview'),
        metaTable([
          ['Change Name', changeName],
          ['Change Type', changeType || '—'],
          ['Impacted Groups', groups || '—'],
          ['Scale', `${scope} / 5  —  ${scope <= 2 ? 'Incremental' : scope === 3 ? 'Moderate' : 'Transformational'}`],
        ]),

        blank(),

        ...(weakest ? [
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: [CONTENT_WIDTH],
            rows: [new TableRow({ children: [cell([
              para(run('Barrier Point Identified', { size: 16, color: C.RED, caps: true }), { after: 40 }),
              para(run(weakest.label, { size: 24, bold: true, color: C.WHITE }), { after: 30 }),
              para(run('This is your most critical gap. Address it first — all other elements depend on it.', { size: 18, color: "CCCCCC" }), { after: 0 }),
            ], { borders: NO_BORDERS, width: CONTENT_WIDTH, fill: C.RED, pad: 180, padH: 220 })]})]
          }),
          blank(),
        ] : []),

        sectionLabel('ADKAR Readiness Assessment'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [2600, 1400, 1400, 3960],
          rows: [
            new TableRow({ children: ['Element', 'Score', 'Level', 'Key Interventions'].map((h, i) =>
              cell(para(run(h, { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: [2600, 1400, 1400, 3960][i], fill: C.GREEN, pad: 90 })
            )}),
            ...adkar.map((el, i) => {
              const s = adkarScores[el.id] || 0;
              const col = adkarColor(s);
              const isBarrier = weakest && el.id === weakest.id;
              const actions = (interventions[el.id] || []).slice(0, s <= 2 ? 3 : 2);
              return new TableRow({ children: [
                cell([para(run(el.label, { size: 18, bold: true, color: isBarrier ? C.RED : C.T1 }), { after: isBarrier ? 30 : 0 }), ...(isBarrier ? [para(run('Barrier Point', { size: 14, color: C.RED }), { after: 0 })] : [])], { borders: BORDERS, width: 2600, fill: isBarrier ? C.RED + '10' : i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run(s > 0 ? String(s) : '—', { size: 22, bold: true, color: col }), { after: 0, align: AlignmentType.CENTER }), { borders: BORDERS, width: 1400, fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run(adkarLabel(s), { size: 16, color: col }), { after: 0 }), { borders: BORDERS, width: 1400, fill: col + '12', pad: 90 }),
                cell(actions.map(a => para(run('\u2013  ' + a, { size: 16, color: C.T3 }), { after: 30 })), { borders: BORDERS, width: 3960, fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
              ]});
            }),
          ],
        }),

        ...(rfactors.length > 0 ? [
          blank(),
          sectionLabel('Resistance Response Plan'),
          ...rfactors.flatMap(id => {
            const factor = resistance.find(r => r.id === id);
            if (!factor) return [];
            const riskCol = factor.risk === 'High' ? C.RED : C.AMBER;
            return [
              para([run(factor.label, { size: 19, bold: true, color: C.T1 }), run(`  —  ${factor.risk} Risk`, { size: 16, color: riskCol })], { before: 120, after: 40,
                border: { left: { style: BorderStyle.SINGLE, size: 6, color: riskCol } } }),
              para(run(resResp[id] || '—', { size: 18, color: C.T3 }), { after: 60 }),
            ];
          }),
        ] : []),

        blank(),
        rule(C.T4),
        para(run('Strategy Made Real  ·  strategymadereal.com.au', { size: 16, color: C.T4, italic: true }), { align: AlignmentType.CENTER }),
      ],
    }],
  });

  await saveDoc(doc, `SMR-Adoption-Planning-${(changeName || 'Change').replace(/ /g, '-')}-${date.replace(/ /g, '-')}.docx`);
}

// ─── TOOL 09 — REVIEW & ACCOUNTABILITY ════════════════════════════════════════
export async function exportAccountability({ programName, sponsor, reviewForum, cadence, commitments, escalationPath, nonNegotiables, redLines }) {
  const date = today();
  const CADENCE_LABELS = { weekly: 'Weekly', fortnightly: 'Fortnightly', monthly: 'Monthly', quarterly: 'Quarterly' };
  const SLIP_LABELS = { flag: 'Flag and discuss', reset: 'Reset the plan', escalate: 'Escalate', reassign: 'Reassign', stop: 'Stop the work' };
  const slipColor = s => s === 'stop' ? C.RED : s === 'escalate' ? C.AMBER : s === 'reassign' ? 'C0622A' : C.GMID;

  const activeCommitments = commitments.filter(c => c.commitment && c.owner);
  const colWidths = [2800, 1400, 1200, 1600, 2360];

  const doc = new Document({
    numbering: numbering(),
    sections: [{
      properties: pageProps(),
      children: [
        ...headerBlock('09', 'Enable', 'Review & Accountability', 'Are we following through?', date),

        sectionLabel('Programme Details'),
        metaTable([
          ['Programme', programName],
          ['Sponsor', sponsor || '—'],
          ['Review Forum', reviewForum || '—'],
          ['Cadence', CADENCE_LABELS[cadence] || cadence || '—'],
        ]),

        blank(),
        sectionLabel('Commitments Register'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: colWidths,
          rows: [
            new TableRow({ children: ['Commitment', 'Owner', 'Due Date', 'Evidence', 'If It Slips'].map((h, i) =>
              cell(para(run(h, { bold: true, color: C.WHITE, size: 17 }), { after: 0 }), { borders: BORDERS, width: colWidths[i], fill: C.GREEN, pad: 90 })
            )}),
            ...activeCommitments.map((c, i) => {
              const sc = slipColor(c.slipResponse);
              return new TableRow({ children: [
                cell(para(run(c.commitment, { size: 18, bold: true }), { after: 0 }), { borders: BORDERS, width: colWidths[0], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run(c.owner, { size: 17, color: C.T2, bold: true }), { after: 0 }), { borders: BORDERS, width: colWidths[1], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run(c.dueDate ? new Date(c.dueDate).toLocaleDateString('en-AU') : '—', { size: 16, color: C.T3 }), { after: 0 }), { borders: BORDERS, width: colWidths[2], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run((c.evidenceTypes || []).join(', ') || '—', { size: 15, color: C.T4, italic: true }), { after: 0 }), { borders: BORDERS, width: colWidths[3], fill: i % 2 === 0 ? C.WHITE : C.LIGHT, pad: 90 }),
                cell(para(run(SLIP_LABELS[c.slipResponse] || '—', { size: 15, bold: true, color: sc }), { after: 0 }), { borders: BORDERS, width: colWidths[4], fill: sc + '12', pad: 90 }),
              ]});
            }),
          ],
        }),

        blank(),
        sectionLabel('Escalation Path'),
        ...escalationPath.filter(e => e.to).map(e =>
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: [1200, 8160],
            rows: [new TableRow({ children: [
              cell(para(run(e.level, { size: 16, bold: true, color: C.GOLD }), { after: 0 }), { borders: NO_BORDERS, width: 1200, pad: 80, padH: 0 }),
              cell([
                para(run(`Escalate to: ${e.to}`, { size: 18, bold: true, color: C.T1 }), { after: 30 }),
                e.trigger ? para(run(`When: ${e.trigger}`, { size: 17, color: C.T3 }), { after: 0 }) : blank(0),
              ], { borders: { top: NO_BORDER, bottom: NO_BORDER, right: NO_BORDER, left: { style: BorderStyle.SINGLE, size: 6, color: C.AMBER } }, width: 8160, pad: 80 }),
            ]})]
          })
        ),

        ...(nonNegotiables || redLines ? [
          blank(),
          sectionLabel('Non-Negotiables and Red Lines'),
          ...(nonNegotiables ? [
            para(run('Non-Negotiables', { size: 18, bold: true, color: C.T1 }), { before: 80, after: 40 }),
            para(run(nonNegotiables, { size: 18, color: C.T2 }), { after: 60 }),
          ] : []),
          ...(redLines ? [
            para(run('Red Lines', { size: 18, bold: true, color: C.RED }), { before: 80, after: 40 }),
            para(run(redLines, { size: 18, color: C.T2 }), { after: 60 }),
          ] : []),
        ] : []),

        blank(),
        sectionLabel('What Good Looks Like'),
        ...([
          'Every commitment has one named owner, not a team or a function.',
          `Progress is reviewed at every ${CADENCE_LABELS[cadence] || ''} session against this register.`,
          'Slippage is visible and addressed within one review cycle, not buried in a status update.',
          'The sponsor is told about any red-line risk within 48 hours.',
          'Commitments that cannot be met are reset with a new date and a clear reason, not quietly dropped.',
        ]).map(l => bullet(l)),

        blank(),
        rule(C.T4),
        para(run('Strategy Made Real  ·  strategymadereal.com.au', { size: 16, color: C.T4, italic: true }), { align: AlignmentType.CENTER }),
      ],
    }],
  });

  await saveDoc(doc, `SMR-Review-Accountability-${(programName || 'Programme').replace(/ /g, '-')}-${date.replace(/ /g, '-')}.docx`);
}
