'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { globalBrandCSS, mono, serif } from '@/lib/brand'
import { createPlanApi } from '@/lib/planApi'
import { STATUS, daysSince, fmtDate, isStale, normalisePlan, today, topGoals } from './model'
import PlanApp from './PlanApp'
import { Btn, C, Card, Label, SectionTitle, StatusPill, planCSS, toneColor } from './ui'

const orgFromUrl = () => new URLSearchParams(window.location.search).get('org')

// Entry point for /dashboard/plan: joins any companies the user was invited
// to, then opens their plan. Platform admins land on an overview of every
// company; people in one company go straight to its plan.
export default function PlanRoot({ api: injected }) {
  const api = useMemo(() => injected || createPlanApi(), [injected])
  const [state, setState] = useState({ loading: true })
  const [orgId, setOrgId] = useState(null)

  const refresh = useCallback(async () => {
    try {
      await api.acceptInvitations()
      const [me, workspaces] = await Promise.all([api.whoami(), api.workspaces()])
      setState({ loading: false, me, workspaces })
      return { me, workspaces }
    } catch (e) {
      setState({ loading: false, error: e.message })
      return null
    }
  }, [api])

  useEffect(() => {
    refresh().then(res => {
      if (!res) return
      const wanted = orgFromUrl()
      if (wanted && res.workspaces.some(w => w.org_id === wanted)) setOrgId(wanted)
      else if (!res.me.isPlatformAdmin && res.workspaces.length === 1) setOrgId(res.workspaces[0].org_id)
    })
    const onPop = () => setOrgId(orgFromUrl())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [refresh])

  const open = id => {
    setOrgId(id)
    window.history.pushState(null, '', id ? `?org=${id}` : window.location.pathname)
    window.scrollTo({ top: 0 })
    if (!id) refresh()
  }

  if (state.loading) return <div style={{ minHeight: '100vh', background: C.paper }} />
  if (state.error) return <Shell><Card><SectionTitle title="Something went wrong" sub={state.error} /><Btn onClick={() => window.location.reload()}>Try again</Btn></Card></Shell>

  const { me, workspaces } = state
  const ws = workspaces.find(w => w.org_id === orgId)
  if (ws) {
    return (
      <PlanApp key={ws.org_id} api={api} me={me} role={ws.role}
        org={{ id: ws.org_id, name: ws.name }}
        initial={{ data: ws.data, version: ws.version ?? 0 }}
        onExit={me.isPlatformAdmin || workspaces.length > 1 ? () => open(null) : null} />
    )
  }

  if (!workspaces.length && !me.isPlatformAdmin) {
    return (
      <Shell>
        <Card>
          <SectionTitle title="You're not part of a company yet" sub={`Ask your Strategy Made Real contact to invite ${me.email}. Once they have, reload this page.`} />
          <Btn kind="secondary" onClick={() => window.location.reload()}>Reload</Btn>
        </Card>
      </Shell>
    )
  }

  return <Companies api={api} me={me} workspaces={workspaces} onOpen={open} onCreated={async id => { await refresh(); open(id) }} />
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: C.paper }}>
      <style>{globalBrandCSS + planCSS}</style>
      <header style={{ borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px', minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="34" height="28" viewBox="0 0 86 70" fill="none" aria-hidden="true">
              <path d="M37 10 L10 36 L39 64" stroke={C.ink} strokeWidth="3.4" strokeLinecap="square" />
              <path d="M49 10 L78 36 L50 64" stroke={C.teal} strokeWidth="3.4" strokeLinecap="square" />
            </svg>
            <span style={{ ...serif, fontSize: 19, fontWeight: 600, color: C.ink }}>Strategy Made Real</span>
          </div>
          <Link href="/dashboard" style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Toolkit</Link>
        </div>
      </header>
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 80px' }}>{children}</main>
    </div>
  )
}

// Health of one company's plan, for the overview.
function health(data) {
  const plan = normalisePlan(data)
  const goals = topGoals(plan)
  const lastReview = plan.reviews.map(r => r.date).sort().pop()
  return {
    plan, goals,
    counts: Object.fromEntries(['on', 'risk', 'off', 'done'].map(k => [k, goals.filter(g => g.status === k).length])),
    stale: goals.filter(isStale).length,
    overdue: plan.actions.filter(a => !a.done && a.due && a.due < today()).length,
    lastReview,
  }
}

function Companies({ api, me, workspaces, onOpen, onCreated }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const create = async () => {
    setError(''); setBusy(true)
    try { onCreated(await api.createOrganisation(name.trim())) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  const rows = workspaces.map(w => ({ ...w, h: health(w.data) }))
  const needAttention = rows.filter(r => r.h.counts.off || r.h.stale || r.h.overdue || (r.h.goals.length && (daysSince(r.h.lastReview) ?? 99) > 7)).length

  return (
    <Shell>
      <div style={{ marginBottom: 32 }}>
        <Label color={C.deep}>{me.isPlatformAdmin ? 'Consultant view' : 'Your companies'}</Label>
        <h1 style={{ ...serif, fontSize: 'clamp(40px, 6vw, 60px)', fontWeight: 500, color: C.ink, lineHeight: 1, margin: '8px 0 12px' }}>All companies</h1>
        <p style={{ fontSize: 16, color: C.body }}>
          {rows.length} compan{rows.length === 1 ? 'y' : 'ies'}{needAttention ? <> · <span style={{ color: C.warning }}>{needAttention} need attention</span></> : ''}
        </p>
      </div>

      {me.isPlatformAdmin && (
        <Card>
          <SectionTitle title="Add a company" sub="Creates an empty plan. Then open it and invite the leadership team from Organise." />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input style={{ flex: '1 1 260px' }} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && name.trim() && create()} placeholder="Company name" />
            <Btn onClick={create} disabled={!name.trim() || busy}>{busy ? 'Creating…' : 'Create company'}</Btn>
          </div>
          {error && <div style={{ fontSize: 13, color: C.error, marginTop: 10 }}>{error}</div>}
        </Card>
      )}

      {rows.map(({ org_id, name: orgName, role, h }) => (
        <Card key={org_id} style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '2 1 260px', minWidth: 0 }}>
            <div style={{ ...serif, fontSize: 26, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{orgName}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              {h.plan.period || 'No period set'} · {h.plan.priorities.length} priorit{h.plan.priorities.length === 1 ? 'y' : 'ies'} · {h.goals.length} goals
            </div>
          </div>
          <div style={{ flex: '2 1 260px', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {h.goals.length === 0
              ? <span style={{ fontSize: 13, color: C.muted }}>Plan not set up yet</span>
              : ['on', 'risk', 'off', 'done'].map(k => <span key={k} style={{ ...mono, fontSize: 11, color: toneColor(STATUS[k].tone) }}>{h.counts[k]} {STATUS[k].label.toLowerCase()}</span>)}
            <div style={{ width: '100%', fontSize: 12, color: C.muted }}>
              Last check-in: {h.lastReview ? fmtDate(h.lastReview) : 'none'}
              {h.stale > 0 && <span style={{ color: C.warning }}> · {h.stale} not updated this week</span>}
              {h.overdue > 0 && <span style={{ color: C.error }}> · {h.overdue} overdue action{h.overdue > 1 ? 's' : ''}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {h.counts.off > 0 && <StatusPill status="off" />}
            <Btn onClick={() => onOpen(org_id)}>Open</Btn>
          </div>
        </Card>
      ))}

      {!rows.length && <div style={{ fontSize: 14, color: C.muted }}>No companies yet. Add your first one above.</div>}
    </Shell>
  )
}
