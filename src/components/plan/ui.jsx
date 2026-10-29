'use client'

import { useState } from 'react'
import { BRAND, mono, serif } from '@/lib/brand'
import { STAGES, STATUS } from './model'

export const C = {
  deep: BRAND.teal800,
  teal: BRAND.teal700,
  mint: BRAND.mint,
  paper: BRAND.paper,
  surface: BRAND.surface,
  raised: BRAND.surfaceElevated,
  ink: BRAND.ink,
  body: BRAND.body,
  muted: BRAND.muted,
  line: BRAND.line,
  cream: BRAND.white,
  error: BRAND.error,
  warning: BRAND.warning,
}

export const toneColor = tone => ({ muted: C.muted, teal: C.teal, warning: C.warning, error: C.error, deep: C.deep }[tone] || C.muted)

export const planCSS = `
.pl-grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.pl-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.pl-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.pl-stages{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;}
.pl-goalrow{display:grid;grid-template-columns:minmax(0,1fr) 220px 104px 84px 96px;grid-template-areas:"title progress status updated btn";gap:16px;align-items:center;}
.pl-goalrow > .a-title{grid-area:title;} .pl-goalrow > .a-progress{grid-area:progress;} .pl-goalrow > .a-status{grid-area:status;}
.pl-goalrow > .a-updated{grid-area:updated;} .pl-goalrow > .a-btn{grid-area:btn;justify-self:end;}
.pl-nav{display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;}
.pl-nav::-webkit-scrollbar{display:none;}
.pl-hide-sm{}
body{font-variant-numeric:lining-nums;}
@media (max-width: 900px){
  .pl-stages{grid-template-columns:1fr 1fr;}
  .pl-grid4{grid-template-columns:1fr 1fr;}
  .pl-grid3{grid-template-columns:1fr;}
  .pl-goalrow{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"title status" "progress progress" "updated btn";gap:12px;}
}
@media (max-width: 640px){
  .pl-grid2{grid-template-columns:1fr;}
  .pl-stages{grid-template-columns:1fr;}
  .pl-hide-sm{display:none;}
}
`

export const Label = ({ children, color = C.muted, style }) => (
  <div style={{ ...mono, fontSize: 10, color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, ...style }}>{children}</div>
)

export function Field({ label, hint, children, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <div style={{ fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  )
}

export function Btn({ children, onClick, kind = 'primary', small, disabled, style, title }) {
  const base = {
    ...mono, fontSize: small ? 10 : 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
    padding: small ? '7px 14px' : '11px 22px', borderRadius: 999, whiteSpace: 'nowrap',
    cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 160ms ease, color 160ms ease',
  }
  const kinds = {
    primary: { background: disabled ? 'rgba(46,90,87,0.34)' : C.deep, color: C.cream, border: '1px solid transparent' },
    secondary: { background: 'transparent', color: C.deep, border: `1px solid ${C.deep}` },
    ghost: { background: 'transparent', color: C.muted, border: '1px solid transparent', padding: small ? '7px 8px' : '11px 12px' },
  }
  return <button type="button" title={title} onClick={onClick} disabled={disabled} style={{ ...base, ...kinds[kind], ...style }}>{children}</button>
}

export const Card = ({ children, style }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, padding: 24, marginBottom: 16, ...style }}>{children}</div>
)

export function SectionTitle({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ ...serif, fontSize: 24, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{sub}</div>}
      </div>
      {right && <div style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{right}</div>}
    </div>
  )
}

export function StatusPill({ status = 'new' }) {
  const s = STATUS[status] || STATUS.new
  const col = toneColor(s.tone)
  return (
    <span style={{ ...mono, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: col, background: col + '14', border: `1px solid ${col}55`, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap', display: 'inline-block', alignSelf: 'flex-start', flexShrink: 0, lineHeight: 1.5 }}>
      {s.label}
    </span>
  )
}

export function StatusPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {Object.entries(STATUS).map(([id, s]) => {
        const on = value === id
        const col = toneColor(s.tone)
        return (
          <button key={id} type="button" onClick={() => onChange(id)}
            style={{ ...mono, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
              background: on ? col : 'transparent', color: on ? C.cream : col, border: `1px solid ${on ? col : col + '66'}` }}>
            {s.label}
          </button>
        )
      })}
    </div>
  )
}

export function ProgressBar({ value, status }) {
  const col = toneColor((STATUS[status] || STATUS.new).tone)
  return (
    <div style={{ height: 6, background: C.raised, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${Math.round((value ?? 0) * 100)}%`, height: '100%', background: col, borderRadius: 999, transition: 'width 300ms ease' }} />
    </div>
  )
}

export function PersonSelect({ people, value, onChange, placeholder = 'Owner' }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value || null)} aria-label={placeholder}>
      <option value="">{people.length ? placeholder : 'Add people in Organise'}</option>
      {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  )
}

export function StageHeader({ stageId, tip }) {
  const s = STAGES.find(x => x.id === stageId)
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'inline-block', ...mono, fontSize: 10, color: C.cream, background: C.deep, borderRadius: 999, padding: '4px 11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        Step {s.num} · {s.label}
      </div>
      <div style={{ ...serif, fontSize: 'clamp(32px, 4vw, 46px)', fontWeight: 500, color: C.ink, lineHeight: 1.05 }}>{s.q}</div>
      {tip && (
        <div style={{ marginTop: 16, borderLeft: `2px solid ${C.teal}`, padding: '4px 0 4px 14px', fontSize: 14, color: C.body, lineHeight: 1.6, maxWidth: 760 }}>
          <span style={{ ...mono, fontSize: 10, color: C.teal, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 8 }}>Good practice</span>{tip}
        </div>
      )}
    </div>
  )
}

export function ChipList({ items, onAdd, onRemove, placeholder }) {
  const [draft, setDraft] = useState('')
  const add = () => { if (draft.trim()) { onAdd(draft.trim()); setDraft('') } }
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder={placeholder} />
        <Btn kind="secondary" small onClick={add} disabled={!draft.trim()}>Add</Btn>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {items.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.raised, border: `1px solid ${C.line}`, borderRadius: 999, padding: '6px 8px 6px 14px', fontSize: 13, color: C.body }}>
            {t}
            <button type="button" onClick={() => onRemove(i)} aria-label={`Remove ${t}`} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}>×</button>
          </span>
        ))}
      </div>
    </div>
  )
}

export const RemoveBtn = ({ onClick, label }) => (
  <button type="button" onClick={onClick} aria-label={label} title={label}
    style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '6px 8px', flexShrink: 0 }}>×</button>
)

export function Empty({ title, children, action }) {
  return (
    <Card style={{ textAlign: 'center', padding: '40px 24px', background: 'transparent', borderStyle: 'dashed' }}>
      <div style={{ ...serif, fontSize: 24, color: C.ink, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: action ? 20 : 0, maxWidth: 520, margin: '0 auto' }}>{children}</div>
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </Card>
  )
}

export function NextBar({ onBack, onNext, nextLabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
      {onBack ? <Btn kind="ghost" onClick={onBack}>← Back</Btn> : <span />}
      {onNext && <Btn onClick={onNext}>{nextLabel} →</Btn>}
    </div>
  )
}

// Members see the build stages but can't change them; a disabled fieldset
// switches off every input and button inside in one go.
export function Guard({ readOnly, children }) {
  if (!readOnly) return children
  return (
    <fieldset disabled style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>View only. Your company's owner or admin edits this step.</div>
      {children}
    </fieldset>
  )
}
