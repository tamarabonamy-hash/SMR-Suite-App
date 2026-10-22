'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BRAND, globalBrandCSS, mono, serif } from '@/lib/brand'
import { exportPlanPack } from '@/lib/planExport'
import { STAGES, STATUS, coachNotes, emptyPlan, fmtDate, nextWeekday, progressOf, stageState, today, topGoals } from './model'
import { samplePlan } from './samplePlan'
import { Btn, C, Card, Label, SectionTitle, planCSS, toneColor } from './ui'
import { Cascade, Clarify, Organise } from './BuildStages'
import { Review, Track } from './RunStages'

// Prototype storage: the plan is kept in this browser per signed-in user.
// Moving it to Supabase is the next step so teams can share one plan.
function usePlan(userId) {
  const key = `smr-plan:${userId || 'anon'}`
  const [plan, setPlan] = useState(null)
  useEffect(() => {
    let saved = null
    try { saved = JSON.parse(localStorage.getItem(key)) } catch {}
    setPlan(saved?.version ? saved : emptyPlan())
  }, [key])
  useEffect(() => {
    if (!plan) return
    try { localStorage.setItem(key, JSON.stringify(plan)) } catch {}
  }, [key, plan])
  return [plan, setPlan]
}

export default function PlanApp({ user }) {
  const [plan, setPlan] = usePlan(user?.id)
  const [stage, setStage] = useState('home')

  if (!plan) return <div style={{ minHeight: '100vh', background: BRAND.paper }} />

  const update = fn => setPlan(p => { const next = structuredClone(p); fn(next); return next })
  const go = id => { setStage(id); window.scrollTo({ top: 0 }) }
  const notes = coachNotes(plan)
  const props = { plan, update, go }

  const loadExample = () => {
    if (plan.org || plan.priorities.length) {
      if (!window.confirm('Replace your current plan with the example? Your plan on this device will be overwritten.')) return
    }
    setPlan(samplePlan())
  }
  const clearPlan = () => { if (window.confirm('Clear the whole plan on this device? This can\'t be undone.')) { setPlan(emptyPlan()); go('home') } }

  return (
    <div style={{ minHeight: '100vh', background: C.paper }}>
      <style>{globalBrandCSS + planCSS}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,240,231,0.94)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 20, minHeight: 64 }}>
          <button type="button" onClick={() => go('home')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
            <svg width="34" height="28" viewBox="0 0 86 70" fill="none" aria-hidden="true">
              <path d="M37 10 L10 36 L39 64" stroke={C.ink} strokeWidth="3.4" strokeLinecap="square" />
              <path d="M49 10 L78 36 L50 64" stroke={C.teal} strokeWidth="3.4" strokeLinecap="square" />
            </svg>
            <span className="pl-hide-sm" style={{ ...serif, fontSize: 19, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap' }}>Strategy Made Real</span>
          </button>

          <nav className="pl-nav" style={{ flex: 1, justifyContent: 'center' }} aria-label="Plan stages">
            {[{ id: 'home', label: 'Overview' }, ...STAGES].map(s => {
              const active = stage === s.id
              const state = s.num ? stageState(plan, s.id) : null
              return (
                <button key={s.id} type="button" onClick={() => go(s.id)}
                  style={{ background: 'none', border: 'none', borderBottom: `2px solid ${active ? C.deep : 'transparent'}`, borderRadius: 0, padding: '22px 12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                    ...mono, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: active ? C.deep : C.muted }}>
                  {s.num && <span style={{ width: 6, height: 6, borderRadius: '50%', background: state === 'done' ? C.teal : state === 'started' ? C.mint : C.line }} />}
                  {s.label}
                </button>
              )
            })}
          </nav>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <Link href="/dashboard" style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }} className="pl-hide-sm">Toolkit</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 80px' }}>
        {stage === 'home' && <Home {...props} notes={notes} loadExample={loadExample} clearPlan={clearPlan} />}
        {stage === 'clarify' && <Clarify {...props} />}
        {stage === 'organise' && <Organise {...props} />}
        {stage === 'cascade' && <Cascade {...props} />}
        {stage === 'track' && <Track {...props} />}
        {stage === 'review' && <Review {...props} />}
      </main>
    </div>
  )
}

function Home({ plan, go, notes, loadExample, clearPlan }) {
  const empty = !plan.org && !plan.priorities.length && !plan.people.length
  const goals = topGoals(plan)
  const withProgress = goals.map(progressOf).filter(v => v != null)
  const overall = withProgress.length ? Math.round((withProgress.reduce((a, b) => a + b, 0) / withProgress.length) * 100) : null
  const openActions = plan.actions.filter(a => !a.done)
  const overdue = openActions.filter(a => a.due && a.due < today())

  return <>
    <div style={{ marginBottom: 32 }}>
      <Label color={C.deep}>{plan.period ? `${plan.period} operating plan` : 'Operating plan'}</Label>
      <h1 style={{ ...serif, fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 500, color: C.ink, lineHeight: 1, margin: '8px 0 16px' }}>
        {plan.org || <>Make your strategy <em style={{ color: C.teal }}>real.</em></>}
      </h1>
      <p style={{ fontSize: 17, color: C.body, maxWidth: 680, lineHeight: 1.6 }}>
        Five steps from a clear strategy to a leadership team that delivers it: priorities that cascade into owned goals, weekly tracking, and reviews that end in decisions.
      </p>
    </div>

    {empty && (
      <Card style={{ background: C.deep, border: 'none', color: C.cream, padding: 32 }}>
        <div style={{ ...serif, fontSize: 30, fontWeight: 500, lineHeight: 1.1, marginBottom: 10 }}>Start here</div>
        <p style={{ fontSize: 15, color: 'rgba(252,250,245,0.82)', maxWidth: 620, lineHeight: 1.6, marginBottom: 22 }}>
          Allow about 45 minutes with your leadership team for the first three steps. Then it takes five minutes a week to keep current. Your work saves automatically on this device.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn onClick={() => go('clarify')} style={{ background: C.cream, color: C.deep }}>Start with Clarify →</Btn>
          <Btn kind="secondary" onClick={loadExample} style={{ color: C.cream, borderColor: 'rgba(252,250,245,0.5)' }}>Explore an example</Btn>
        </div>
      </Card>
    )}

    <div className="pl-stages" style={{ marginBottom: 24 }}>
      {STAGES.map(s => {
        const st = stageState(plan, s.id)
        return (
          <button key={s.id} type="button" onClick={() => go(s.id)}
            style={{ textAlign: 'left', background: C.surface, border: `1px solid ${st === 'done' ? C.teal : C.line}`, borderRadius: 12, padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 150 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ ...mono, fontSize: 11, color: C.teal }}>{s.num}</span>
              <span style={{ ...mono, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: st === 'done' ? C.teal : st === 'started' ? C.body : C.muted }}>
                {st === 'done' ? '✓ Done' : st === 'started' ? 'In progress' : 'To do'}
              </span>
            </div>
            <div style={{ ...serif, fontSize: 24, fontWeight: 600, color: C.ink, lineHeight: 1 }}>{s.label}</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.45 }}>{s.q}</div>
          </button>
        )
      })}
    </div>

    {!empty && goals.length > 0 && (
      <div className="pl-grid2">
        <Card>
          <Label>This quarter</Label>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
            <div style={{ ...serif, fontSize: 52, fontWeight: 600, color: C.ink, lineHeight: 1 }}>{overall == null ? '—' : `${overall}%`}</div>
            <div style={{ fontSize: 13, color: C.muted }}>average progress to target<br />across {goals.length} goals</div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['on', 'risk', 'off', 'done'].map(k => (
              <div key={k} style={{ ...mono, fontSize: 11, color: toneColor(STATUS[k].tone) }}>{goals.filter(g => g.status === k).length} {STATUS[k].label.toLowerCase()}</div>
            ))}
          </div>
        </Card>
        <Card>
          <Label>Next up</Label>
          <div style={{ ...serif, fontSize: 26, fontWeight: 600, color: C.ink, lineHeight: 1.1, marginBottom: 6 }}>Weekly check-in · {plan.rhythm.weeklyDay} {fmtDate(nextWeekday(plan.rhythm.weeklyDay))}</div>
          <div style={{ fontSize: 14, color: C.body, marginBottom: 16 }}>
            {openActions.length} open action{openActions.length === 1 ? '' : 's'}{overdue.length ? <span style={{ color: C.error }}> · {overdue.length} overdue</span> : ''}
          </div>
          <Btn small onClick={() => go('review')}>Run check-in</Btn>
        </Card>
      </div>
    )}

    {!empty && notes.length > 0 && (
      <Card>
        <SectionTitle title="What needs attention" sub="Checks against good practice, in the order the stages run." right={`${notes.length} item${notes.length > 1 ? 's' : ''}`} />
        {notes.slice(0, 8).map((n, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 14, color: C.body }}>
              <span style={{ ...mono, fontSize: 10, color: C.teal, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 10 }}>{STAGES.find(s => s.id === n.stage).label}</span>
              {n.text}
            </div>
            <Btn kind="ghost" small onClick={() => go(n.stage)}>Fix →</Btn>
          </div>
        ))}
      </Card>
    )}

    {!empty && (
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
        <Btn kind="secondary" onClick={() => exportPlanPack(plan)}>↓ Download plan (Word)</Btn>
        <Btn kind="ghost" onClick={loadExample}>Load example</Btn>
        <Btn kind="ghost" onClick={clearPlan}>Clear plan</Btn>
      </div>
    )}
  </>
}
