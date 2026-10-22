'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { globalBrandCSS, mono, serif } from '@/lib/brand'
import { exportPlanPack } from '@/lib/planExport'
import { STAGES, STATUS, coachNotes, emptyPlan, fmtDate, isPlanEmpty, nextWeekday, normalisePlan, personForEmail, progressOf, stageState, today, topGoals } from './model'
import { samplePlan } from './samplePlan'
import { Btn, C, Card, Label, SectionTitle, planCSS, toneColor } from './ui'
import { Cascade, Clarify, Organise } from './BuildStages'
import { Review, Track } from './RunStages'
import { useSharedPlan } from './useSharedPlan'

const ROLE_LABEL = { owner: 'Owner', admin: 'Admin', member: 'Member' }

// One company's plan. Owners and admins edit everything; members read the
// plan and update the goals, commitments and actions they own.
export default function PlanApp({ api, org, role, me, initial, onExit }) {
  const canEdit = role === 'owner' || role === 'admin'
  const { plan, update, act, status, notice, clearNotice } = useSharedPlan({ api, orgId: org.id, initial, canEdit, email: me.email })
  const [stage, setStage] = useState('home')
  const [browserPlan, setBrowserPlan] = useState(null)

  // Plans made in the earlier prototype lived in this browser; offer to bring one in.
  useEffect(() => {
    if (!canEdit) return
    try {
      const saved = JSON.parse(localStorage.getItem(`smr-plan:${me.id}`))
      if (saved?.version && !isPlanEmpty(normalisePlan(saved))) setBrowserPlan(saved)
    } catch {}
  }, [canEdit, me.id])

  const go = id => { setStage(id); window.scrollTo({ top: 0 }) }
  const notes = coachNotes(plan)
  const myPerson = personForEmail(plan, me.email)
  const props = { plan, update, go, act, readOnly: !canEdit, me, myPerson, api, org, role }

  const replaceWith = next => update(p => { Object.keys(p).forEach(k => delete p[k]); Object.assign(p, normalisePlan(structuredClone(next))) })
  const loadExample = () => {
    if (!isPlanEmpty(plan) && !window.confirm(`Replace ${org.name}'s plan with the example? Everyone in the company will see the change.`)) return
    replaceWith({ ...samplePlan(), org: plan.org || samplePlan().org })
  }
  const clearPlan = () => { if (window.confirm(`Clear ${org.name}'s whole plan for everyone? This can't be undone.`)) { replaceWith(emptyPlan()); go('home') } }
  const importBrowserPlan = () => {
    if (!isPlanEmpty(plan) && !window.confirm(`Replace ${org.name}'s plan with the one saved in this browser?`)) return
    replaceWith(browserPlan)
    try { localStorage.removeItem(`smr-plan:${me.id}`) } catch {}
    setBrowserPlan(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.paper }}>
      <style>{globalBrandCSS + planCSS}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,240,231,0.94)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 20, minHeight: 64 }}>
          <button type="button" onClick={() => go('home')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, textAlign: 'left' }}>
            <svg width="34" height="28" viewBox="0 0 86 70" fill="none" aria-hidden="true">
              <path d="M37 10 L10 36 L39 64" stroke={C.ink} strokeWidth="3.4" strokeLinecap="square" />
              <path d="M49 10 L78 36 L50 64" stroke={C.teal} strokeWidth="3.4" strokeLinecap="square" />
            </svg>
            <span className="pl-hide-sm" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ ...serif, fontSize: 19, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', lineHeight: 1.1 }}>{org.name}</span>
              <span style={{ ...mono, fontSize: 9, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{ROLE_LABEL[role]} · {status === 'saving' ? 'Saving…' : status === 'error' ? 'Not saved' : 'Saved'}</span>
            </span>
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

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexShrink: 0 }}>
            {onExit && <button type="button" onClick={onExit} className="pl-hide-sm" style={{ background: 'none', border: 'none', cursor: 'pointer', ...mono, fontSize: 10, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>All companies</button>}
            <Link href="/dashboard" style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }} className="pl-hide-sm">Toolkit</Link>
          </div>
        </div>
      </header>

      {notice && (
        <div role="status" style={{ background: C.raised, borderBottom: `1px solid ${C.line}` }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', fontSize: 13, color: C.body }}>
            {notice}
            <Btn kind="ghost" small onClick={clearNotice}>Dismiss</Btn>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 80px' }}>
        {stage === 'home' && <Home {...props} notes={notes} loadExample={loadExample} clearPlan={clearPlan} browserPlan={browserPlan} importBrowserPlan={importBrowserPlan} />}
        {stage === 'clarify' && <Clarify {...props} />}
        {stage === 'organise' && <Organise {...props} />}
        {stage === 'cascade' && <Cascade {...props} />}
        {stage === 'track' && <Track {...props} />}
        {stage === 'review' && <Review {...props} />}
      </main>
    </div>
  )
}

function Home({ plan, go, notes, loadExample, clearPlan, readOnly, org, browserPlan, importBrowserPlan }) {
  const empty = isPlanEmpty(plan)
  const goals = topGoals(plan)
  const withProgress = goals.map(progressOf).filter(v => v != null)
  const overall = withProgress.length ? Math.round((withProgress.reduce((a, b) => a + b, 0) / withProgress.length) * 100) : null
  const openActions = plan.actions.filter(a => !a.done)
  const overdue = openActions.filter(a => a.due && a.due < today())

  return <>
    <div style={{ marginBottom: 32 }}>
      <Label color={C.deep}>{plan.period ? `${plan.period} operating plan` : 'Operating plan'}</Label>
      <h1 style={{ ...serif, fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 500, color: C.ink, lineHeight: 1, margin: '8px 0 16px' }}>
        {plan.org || org.name}
      </h1>
      <p style={{ fontSize: 17, color: C.body, maxWidth: 680, lineHeight: 1.6 }}>
        Five steps from a clear strategy to a leadership team that delivers it: priorities that cascade into owned goals, weekly tracking, and reviews that end in decisions.
      </p>
    </div>

    {browserPlan && !readOnly && (
      <Card style={{ borderColor: C.teal }}>
        <SectionTitle title="Bring in the plan from this browser" sub={`You started “${browserPlan.org || 'a plan'}” in the earlier version, which saved it only on this device. Move it into ${org.name} so your team can see it.`} />
        <Btn onClick={importBrowserPlan}>Move it into {org.name}</Btn>
      </Card>
    )}

    {empty && !readOnly && (
      <Card style={{ background: C.deep, border: 'none', color: C.cream, padding: 32 }}>
        <div style={{ ...serif, fontSize: 30, fontWeight: 500, lineHeight: 1.1, marginBottom: 10 }}>Start here</div>
        <p style={{ fontSize: 15, color: 'rgba(252,250,245,0.82)', maxWidth: 620, lineHeight: 1.6, marginBottom: 22 }}>
          Allow about 45 minutes with your leadership team for the first three steps. Then it takes five minutes a week to keep current. Everything saves automatically and your team sees the same plan.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn onClick={() => go('clarify')} style={{ background: C.cream, color: C.deep }}>Start with Clarify →</Btn>
          <Btn kind="secondary" onClick={loadExample} style={{ color: C.cream, borderColor: 'rgba(252,250,245,0.5)' }}>Start from the example</Btn>
        </div>
      </Card>
    )}

    {empty && readOnly && (
      <Card>
        <SectionTitle title="Your plan is being set up" sub="Your company's owner or admin hasn't added the plan yet. Once they do, it appears here and you can update your goals each week." />
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
          {readOnly ? <Btn small onClick={() => go('track')}>Update my goals</Btn> : <Btn small onClick={() => go('review')}>Run check-in</Btn>}
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
        {!readOnly && <Btn kind="ghost" onClick={loadExample}>Load example</Btn>}
        {!readOnly && <Btn kind="ghost" onClick={clearPlan}>Clear plan</Btn>}
      </div>
    )}
  </>
}
