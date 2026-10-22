'use client'

import { useState } from 'react'
import { mono, serif } from '@/lib/brand'
import { REVIEW_TYPES, STATUS, childrenOf, daysSince, fmtDate, isStale, lastUpdate, personName, progressOf, today, topGoals, uid } from './model'
import { Btn, C, Card, Empty, Field, Label, NextBar, PersonSelect, ProgressBar, SectionTitle, StageHeader, StatusPicker, StatusPill, toneColor } from './ui'

// ─── 04 TRACK ─────────────────────────────────────────────────────────────────
export function Track({ plan, update, go }) {
  const [owner, setOwner] = useState('')
  const [open, setOpen] = useState(null)
  const all = topGoals(plan)

  if (!all.length) {
    return <>
      <StageHeader stageId="track" />
      <Empty title="No goals to track yet" action={<Btn onClick={() => go('cascade')}>Go to Cascade</Btn>}>Set quarterly goals in Cascade and they'll appear here as your scorecard.</Empty>
    </>
  }

  const goals = owner ? all.filter(g => g.ownerId === owner) : all

  return <>
    <StageHeader stageId="track" tip="Each owner updates their goals weekly in under five minutes: status, latest number, one line on why. Red is fine. Surprises are not." />

    <ScoreSummary goals={goals} />

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, margin: '8px 0 16px', flexWrap: 'wrap' }}>
      <div style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Scorecard</div>
      <div style={{ width: 220 }}>
        <select value={owner} onChange={e => setOwner(e.target.value)} aria-label="Filter by owner">
          <option value="">Everyone</option>
          {plan.people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
    </div>

    {plan.priorities.map(pr => {
      const rows = goals.filter(g => g.priorityId === pr.id)
      if (!rows.length) return null
      return (
        <Card key={pr.id} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.line}`, background: C.raised }}>
            <div style={{ ...serif, fontSize: 20, fontWeight: 600, color: C.ink }}>{pr.title}</div>
          </div>
          {rows.map(g => (
            <GoalRow key={g.id} plan={plan} g={g} update={update} open={open === g.id} onToggle={() => setOpen(open === g.id ? null : g.id)} />
          ))}
        </Card>
      )
    })}

    <NextBar onBack={() => go('cascade')} onNext={() => go('review')} nextLabel="Review" />
  </>
}

function ScoreSummary({ goals }) {
  const stale = goals.filter(isStale).length
  return (
    <div className="pl-grid4" style={{ marginBottom: 8 }}>
      {['on', 'risk', 'off', 'done'].map(k => {
        const n = goals.filter(g => g.status === k).length
        return (
          <div key={k} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ ...serif, fontSize: 36, fontWeight: 600, color: toneColor(STATUS[k].tone), lineHeight: 1 }}>{n}</div>
            <div style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 6 }}>{STATUS[k].label}</div>
          </div>
        )
      })}
      {stale > 0 && <div style={{ gridColumn: '1 / -1', fontSize: 13, color: C.warning }}>{stale} goal{stale > 1 ? 's need' : ' needs'} an update this week.</div>}
    </div>
  )
}

function GoalRow({ plan, g, update, open, onToggle }) {
  const [draft, setDraft] = useState({ status: g.status, current: g.current, note: '' })
  const pct = progressOf(g)
  const since = daysSince(lastUpdate(g))
  const kids = childrenOf(plan, g.id)

  const save = () => {
    update(p => {
      const goal = p.goals.find(x => x.id === g.id)
      goal.status = draft.status
      goal.current = draft.current
      goal.updates = [...(goal.updates || []), { date: today(), status: draft.status, current: draft.current, note: draft.note }]
    })
    setDraft(d => ({ ...d, note: '' }))
    onToggle()
  }

  return (
    <div style={{ borderTop: `1px solid ${C.line}` }}>
      <div className="pl-goalrow" style={{ padding: '16px 20px' }}>
        <div className="a-title" style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, lineHeight: 1.35 }}>{g.title || 'Untitled goal'}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{personName(plan, g.ownerId)} · due {fmtDate(g.due)}</div>
        </div>
        <div className="a-progress" style={{ minWidth: 0 }}>
          <ProgressBar value={pct} status={g.status} />
          <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 6 }}>
            {g.current || '—'} / {g.target || '—'} {g.measure}
          </div>
        </div>
        <div className="a-status"><StatusPill status={g.status} /></div>
        <div className="a-updated" style={{ ...mono, fontSize: 10, color: since == null || since > 7 ? C.warning : C.muted, whiteSpace: 'nowrap' }}>
          {since == null ? 'Never updated' : since === 0 ? 'Today' : `${since}d ago`}
        </div>
        <div className="a-btn"><Btn kind={open ? 'ghost' : 'secondary'} small onClick={onToggle}>{open ? 'Close' : 'Update'}</Btn></div>
      </div>

      {open && (
        <div style={{ padding: '4px 20px 20px', background: C.paper, borderTop: `1px dashed ${C.line}` }}>
          <div className="pl-grid2" style={{ marginTop: 16 }}>
            <div>
              <Field label="Status"><StatusPicker value={draft.status} onChange={s => setDraft(d => ({ ...d, status: s }))} /></Field>
              <Field label={`Latest value${g.measure ? ` (${g.measure})` : ''}`}><input value={draft.current} onChange={e => setDraft(d => ({ ...d, current: e.target.value }))} placeholder={`Target ${g.target || ''}`} /></Field>
              <Field label="What changed, and what's needed?" hint={draft.status === 'risk' || draft.status === 'off' ? 'Say what would get it back on track and what you need from others.' : null}>
                <textarea rows={2} value={draft.note} onChange={e => setDraft(d => ({ ...d, note: e.target.value }))} />
              </Field>
              <Btn onClick={save}>Save update</Btn>
            </div>
            <div>
              {kids.length > 0 && <>
                <Label>Team commitments</Label>
                {kids.map(c => (
                  <label key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: `1px solid ${C.line}`, cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: 16, marginTop: 3 }} checked={c.status === 'done'}
                      onChange={e => { const done = e.target.checked; update(p => { p.goals.find(x => x.id === c.id).status = done ? 'done' : 'new' }) }} />
                    <span style={{ fontSize: 13, color: c.status === 'done' ? C.muted : C.body, textDecoration: c.status === 'done' ? 'line-through' : 'none' }}>
                      {c.title || 'Untitled'} <span style={{ color: C.muted }}>· {personName(plan, c.ownerId)} · {fmtDate(c.due)}</span>
                    </span>
                  </label>
                ))}
              </>}
              {g.updates?.length > 0 && <div style={{ marginTop: kids.length ? 20 : 0 }}>
                <Label>Recent updates</Label>
                {[...g.updates].reverse().slice(0, 3).map((u, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.body, padding: '6px 0', lineHeight: 1.5 }}>
                    <span style={{ ...mono, fontSize: 10, color: C.muted, marginRight: 8 }}>{fmtDate(u.date)}</span>
                    <StatusPill status={u.status} /> <span style={{ marginLeft: 6 }}>{u.note || <em style={{ color: C.muted }}>No note</em>}</span>
                  </div>
                ))}
              </div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 05 REVIEW ────────────────────────────────────────────────────────────────
export function Review({ plan, update, go }) {
  const [tab, setTab] = useState('checkin')
  const tabs = [['checkin', 'Run a check-in'], ['actions', 'Actions & accountability'], ['history', 'History']]

  return <>
    <StageHeader stageId="review" tip="Keep the weekly check-in to 30 minutes and spend it on exceptions. Only at-risk and off-track goals get airtime, and each one ends in a decision or an action with an owner and a date." />

    <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.line}`, marginBottom: 24, overflowX: 'auto' }}>
      {tabs.map(([id, label]) => (
        <button key={id} type="button" onClick={() => setTab(id)}
          style={{ background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? C.deep : 'transparent'}`, borderRadius: 0, padding: '10px 14px', ...mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: tab === id ? C.deep : C.muted, cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1 }}>
          {label}
        </button>
      ))}
    </div>

    {tab === 'checkin' && <CheckIn plan={plan} update={update} go={go} onSaved={() => setTab('history')} />}
    {tab === 'actions' && <Actions plan={plan} update={update} />}
    {tab === 'history' && <History plan={plan} />}

    <NextBar onBack={() => go('track')} onNext={() => go('home')} nextLabel="Overview" />
  </>
}

const STEPS = ['Scorecard', 'Exceptions', 'Last actions', 'Close']

function CheckIn({ plan, update, go, onSaved }) {
  const [type, setType] = useState('weekly')
  const [step, setStep] = useState(0)
  const [notes, setNotes] = useState({})
  const [newActions, setNewActions] = useState([])
  const [closed, setClosed] = useState([])
  const [summary, setSummary] = useState('')

  const goals = topGoals(plan)
  if (!goals.length) {
    return <Empty title="Nothing to review yet" action={<Btn onClick={() => go('cascade')}>Go to Cascade</Btn>}>Once goals are set and updated, run your check-in here.</Empty>
  }

  const exceptions = goals.filter(g => g.status === 'risk' || g.status === 'off')
  const stale = goals.filter(isStale)
  const openActions = plan.actions.filter(a => !a.done)
  const setNote = (id, key, v) => setNotes(n => ({ ...n, [id]: { ...n[id], [key]: v } }))
  const addAction = goalId => setNewActions(a => [...a, { id: uid(), goalId, text: '', ownerId: null, due: '' }])
  const setAction = (id, key, v) => setNewActions(a => a.map(x => (x.id === id ? { ...x, [key]: v } : x)))

  const decisions = Object.entries(notes).filter(([, n]) => n.issue || n.decision).map(([goalId, n]) => ({ goalId, issue: n.issue || '', decision: n.decision || '' }))
  const actionsToSave = newActions.filter(a => a.text.trim())

  const save = () => {
    const reviewId = uid()
    update(p => {
      p.reviews.push({ id: reviewId, type, date: today(), summary, decisions })
      actionsToSave.forEach(a => p.actions.push({ ...a, done: false, reviewId }))
      p.actions.forEach(a => { if (closed.includes(a.id)) a.done = true })
    })
    setStep(0); setNotes({}); setNewActions([]); setClosed([]); setSummary('')
    onSaved()
  }

  return <>
    <Card>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {Object.entries(REVIEW_TYPES).map(([id, t]) => (
          <Btn key={id} small kind={type === id ? 'primary' : 'secondary'} onClick={() => setType(id)}>{t.label}</Btn>
        ))}
      </div>
      <div style={{ fontSize: 14, color: C.body, lineHeight: 1.6 }}>
        <span style={{ ...mono, fontSize: 10, color: C.muted, marginRight: 8 }}>{REVIEW_TYPES[type].length}</span>{REVIEW_TYPES[type].prompt}
      </div>
    </Card>

    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
      {STEPS.map((s, i) => (
        <button key={s} type="button" onClick={() => setStep(i)}
          style={{ ...mono, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
            border: `1px solid ${i === step ? C.deep : C.line}`, background: i === step ? C.deep : 'transparent', color: i === step ? C.cream : i < step ? C.deep : C.muted }}>
          {i + 1}. {s}
        </button>
      ))}
    </div>

    {step === 0 && (
      <Card>
        <SectionTitle title="Where we are" sub="Two minutes. Read the scorecard; don't discuss it yet." />
        {stale.length > 0 && (
          <div style={{ fontSize: 13, color: C.warning, marginBottom: 14 }}>
            Not updated this week: {stale.map(g => personName(plan, g.ownerId)).filter((v, i, a) => a.indexOf(v) === i).join(', ')}. Ask for updates before the meeting next time.
          </div>
        )}
        {goals.map(g => (
          <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: `1px solid ${C.line}`, alignItems: 'center' }}>
            <div style={{ fontSize: 14, color: C.ink, minWidth: 0 }}>{g.title} <span style={{ color: C.muted }}>· {personName(plan, g.ownerId)}</span></div>
            <StatusPill status={g.status} />
          </div>
        ))}
      </Card>
    )}

    {step === 1 && (
      exceptions.length === 0
        ? <Empty title="Nothing at risk or off track">Use the time to look ahead: what could knock a goal off course next month?</Empty>
        : exceptions.map(g => (
          <Card key={g.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ ...serif, fontSize: 22, fontWeight: 600, color: C.ink, lineHeight: 1.15 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{personName(plan, g.ownerId)} · {g.current || '—'} / {g.target} {g.measure}</div>
              </div>
              <StatusPill status={g.status} />
            </div>
            {g.updates?.length > 0 && g.updates[g.updates.length - 1].note && (
              <div style={{ fontSize: 13, color: C.body, background: C.raised, borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>“{g.updates[g.updates.length - 1].note}”</div>
            )}
            <div className="pl-grid2">
              <Field label="What's the real issue?"><textarea rows={2} value={notes[g.id]?.issue || ''} onChange={e => setNote(g.id, 'issue', e.target.value)} /></Field>
              <Field label="Decision"><textarea rows={2} value={notes[g.id]?.decision || ''} onChange={e => setNote(g.id, 'decision', e.target.value)} placeholder="What did we decide?" /></Field>
            </div>
            {newActions.filter(a => a.goalId === g.id).map(a => (
              <div key={a.id} style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <input style={{ flex: '2 1 220px' }} value={a.text} onChange={e => setAction(a.id, 'text', e.target.value)} placeholder="Action" />
                <div style={{ flex: '1 1 140px' }}><PersonSelect people={plan.people} value={a.ownerId} onChange={v => setAction(a.id, 'ownerId', v)} /></div>
                <input style={{ flex: '1 1 140px' }} type="date" value={a.due} onChange={e => setAction(a.id, 'due', e.target.value)} />
              </div>
            ))}
            <Btn kind="ghost" small onClick={() => addAction(g.id)}>+ Add action</Btn>
          </Card>
        ))
    )}

    {step === 2 && (
      <Card>
        <SectionTitle title="Did we do what we said?" sub="Tick off what's done. Anything still open stays on the list with its owner." />
        {openActions.length === 0 && <div style={{ fontSize: 14, color: C.muted }}>No open actions.</div>}
        {openActions.map(a => (
          <label key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderTop: `1px solid ${C.line}`, cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: 16, marginTop: 3 }} checked={closed.includes(a.id)}
              onChange={e => setClosed(c => (e.target.checked ? [...c, a.id] : c.filter(x => x !== a.id)))} />
            <span style={{ fontSize: 14, color: C.body }}>
              {a.text} <span style={{ color: a.due && a.due < today() ? C.error : C.muted }}>· {personName(plan, a.ownerId)} · due {fmtDate(a.due)}</span>
            </span>
          </label>
        ))}
      </Card>
    )}

    {step === 3 && (
      <Card>
        <SectionTitle title="Close the loop" sub="Agree the one or two messages each leader takes back to their team." />
        <Field label="Key messages to cascade"><textarea rows={3} value={summary} onChange={e => setSummary(e.target.value)} /></Field>
        <div style={{ ...mono, fontSize: 11, color: C.body, marginBottom: 20 }}>
          {decisions.length} decision{decisions.length === 1 ? '' : 's'} · {actionsToSave.length} new action{actionsToSave.length === 1 ? '' : 's'} · {closed.length} closed
        </div>
        <Btn onClick={save}>Save {REVIEW_TYPES[type].label.toLowerCase()}</Btn>
      </Card>
    )}

    {step < 3 && <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Btn kind="secondary" onClick={() => setStep(step + 1)}>Next: {STEPS[step + 1]} →</Btn></div>}
  </>
}

function Actions({ plan, update }) {
  const [showDone, setShowDone] = useState(false)
  const list = plan.actions.filter(a => showDone || !a.done).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))
  const goalTitle = id => plan.goals.find(g => g.id === id)?.title

  return <>
    <Card>
      <SectionTitle title="Accountability" sub="Do people do what they say they'll do? Measured from actions agreed in reviews." />
      {plan.people.length === 0 && <div style={{ fontSize: 14, color: C.muted }}>Add your leadership team in Organise.</div>}
      <div className="pl-grid3">
        {plan.people.map(per => {
          const mine = plan.actions.filter(a => a.ownerId === per.id)
          const due = mine.filter(a => a.done || (a.due && a.due < today()))
          const kept = due.filter(a => a.done).length
          const overdue = mine.filter(a => !a.done && a.due && a.due < today()).length
          const rate = due.length ? Math.round((kept / due.length) * 100) : null
          return (
            <div key={per.id} style={{ background: C.raised, borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{per.name}</div>
              <div style={{ ...serif, fontSize: 30, fontWeight: 600, color: rate == null ? C.muted : rate >= 80 ? C.teal : rate >= 50 ? C.warning : C.error, lineHeight: 1.2, marginTop: 6 }}>
                {rate == null ? '—' : `${rate}%`}
              </div>
              <div style={{ ...mono, fontSize: 10, color: C.muted }}>
                Actions kept{overdue ? ` · ${overdue} overdue` : ''}
              </div>
            </div>
          )
        })}
      </div>
    </Card>

    <Card>
      <SectionTitle title="Action list" right={<label style={{ cursor: 'pointer' }}><input type="checkbox" style={{ width: 'auto', marginRight: 6 }} checked={showDone} onChange={e => setShowDone(e.target.checked)} />Show done</label>} />
      {list.length === 0 && <div style={{ fontSize: 14, color: C.muted }}>No actions yet. They're created during check-ins.</div>}
      {list.map(a => (
        <label key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderTop: `1px solid ${C.line}`, cursor: 'pointer' }}>
          <input type="checkbox" style={{ width: 16, marginTop: 3 }} checked={a.done} onChange={e => { const done = e.target.checked; update(p => { p.actions.find(x => x.id === a.id).done = done }) }} />
          <span style={{ fontSize: 14, color: a.done ? C.muted : C.body, textDecoration: a.done ? 'line-through' : 'none', lineHeight: 1.5 }}>
            {a.text}
            <span style={{ display: 'block', fontSize: 12, color: !a.done && a.due && a.due < today() ? C.error : C.muted, textDecoration: 'none' }}>
              {personName(plan, a.ownerId)} · due {fmtDate(a.due)}{goalTitle(a.goalId) ? ` · ${goalTitle(a.goalId)}` : ''}
            </span>
          </span>
        </label>
      ))}
    </Card>
  </>
}

function History({ plan }) {
  if (!plan.reviews.length) return <Empty title="No reviews yet">Your saved check-ins, decisions and messages will build up here.</Empty>
  return [...plan.reviews].reverse().map(r => (
    <Card key={r.id}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ ...serif, fontSize: 22, fontWeight: 600, color: C.ink }}>{REVIEW_TYPES[r.type]?.label}</div>
        <div style={{ ...mono, fontSize: 11, color: C.muted }}>{fmtDate(r.date)}</div>
      </div>
      {r.summary && <div style={{ fontSize: 14, color: C.body, marginBottom: 12, lineHeight: 1.6 }}>{r.summary}</div>}
      {r.decisions.map((d, i) => (
        <div key={i} style={{ borderTop: `1px solid ${C.line}`, padding: '10px 0', fontSize: 13, color: C.body, lineHeight: 1.55 }}>
          <div style={{ fontWeight: 600, color: C.ink }}>{plan.goals.find(g => g.id === d.goalId)?.title || 'Goal'}</div>
          {d.issue && <div><span style={{ color: C.muted }}>Issue:</span> {d.issue}</div>}
          {d.decision && <div><span style={{ color: C.muted }}>Decision:</span> {d.decision}</div>}
        </div>
      ))}
      <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 8 }}>
        {plan.actions.filter(a => a.reviewId === r.id).length} actions raised
      </div>
    </Card>
  ))
}
