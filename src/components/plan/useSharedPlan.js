'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { normalisePlan, ownsItem, today } from './model'

const SAVE_DELAY = 700
const POLL_EVERY = 20000

// Keeps one company's plan in sync with Supabase.
// - Owners/admins edit locally; changes are saved in the background. Each
//   change is kept as a function until saved, so if someone else saved first
//   we load their version, replay our changes on top and save again.
// - Members can't save the whole plan; their goal, commitment and action
//   updates go through update_plan_item, which checks they own the item.
// - While nothing is pending, the plan is refreshed every 20s so a check-in
//   run on one screen shows up on everyone's.
export function useSharedPlan({ api, orgId, initial, canEdit, email }) {
  const [plan, setPlanState] = useState(() => normalisePlan(initial.data))
  const [status, setStatus] = useState('saved') // saving | saved | error
  const [notice, setNotice] = useState('')
  const planRef = useRef(plan)
  const version = useRef(initial.version)
  const pending = useRef([])
  const saving = useRef(false)
  const timer = useRef(null)

  const setPlan = p => { planRef.current = p; setPlanState(p) }

  const flushRef = useRef(null)
  const schedule = ms => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { timer.current = null; flushRef.current() }, ms)
  }

  // Saves everything pending. If a save is already running, it reschedules
  // itself when done, so changes made mid-save are never left behind.
  const flush = useCallback(async () => {
    if (saving.current || !pending.current.length) return
    saving.current = true
    setStatus('saving')
    const count = pending.current.length
    let retryIn = null
    try {
      version.current = await api.savePlan(orgId, planRef.current, version.current)
      pending.current = pending.current.slice(count)
      setStatus('saved')
      setNotice(n => (n.startsWith("Couldn't") ? '' : n))
    } catch (e) {
      if (e.conflict) {
        try {
          const latest = await api.loadPlan(orgId)
          const merged = normalisePlan(latest.data)
          pending.current.forEach(fn => fn(merged))
          version.current = latest.version
          setPlan(merged)
          setNotice('Someone else updated the plan at the same time. Their changes and yours have both been kept.')
          retryIn = 0
        } catch { retryIn = 5000 }
      } else {
        setStatus('error')
        setNotice(`Couldn't save: ${e.message}. Retrying…`)
        retryIn = 5000
      }
    } finally {
      saving.current = false
      if (pending.current.length) schedule(retryIn ?? SAVE_DELAY)
    }
  }, [api, orgId])
  flushRef.current = flush

  const update = useCallback(fn => {
    if (!canEdit) return
    const next = structuredClone(planRef.current)
    fn(next)
    pending.current.push(fn)
    setPlan(next)
    schedule(SAVE_DELAY)
  }, [canEdit])

  // Member-safe updates: owners/admins apply them locally like any edit;
  // members send them to the server, which checks ownership.
  const remote = useCallback(async (op, payload, local) => {
    if (canEdit) return update(local)
    setStatus('saving')
    try {
      const res = await api.updateItem(orgId, op, payload)
      version.current = res.version
      setPlan(normalisePlan(res.data))
      setStatus('saved')
    } catch (e) {
      setStatus('error')
      setNotice(`Couldn't save: ${e.message}`)
    }
  }, [api, orgId, canEdit, update])

  const act = {
    canUpdate: item => canEdit || ownsItem(planRef.current, item, email),
    goalUpdate: (goalId, { status: s, current, note }) => remote('goal_update', { goalId, status: s, current, note }, p => {
      const g = p.goals.find(x => x.id === goalId)
      if (!g) return
      g.status = s
      g.current = current
      g.updates = [...(g.updates || []), { date: today(), status: s, current, note }]
    }),
    setCommitmentDone: (goalId, done) => remote('commitment_done', { goalId, done }, p => {
      const g = p.goals.find(x => x.id === goalId)
      if (g) g.status = done ? 'done' : 'new'
    }),
    setActionDone: (actionId, done) => remote('action_done', { actionId, done }, p => {
      const a = p.actions.find(x => x.id === actionId)
      if (a) a.done = done
    }),
  }

  useEffect(() => {
    const id = setInterval(async () => {
      if (document.hidden || saving.current || pending.current.length) return
      try {
        const latest = await api.loadPlan(orgId)
        if (latest.version > version.current && !pending.current.length) {
          version.current = latest.version
          setPlan(normalisePlan(latest.data))
        }
      } catch { /* try again next tick */ }
    }, POLL_EVERY)
    const beforeUnload = e => { if (pending.current.length) { flush(); e.preventDefault() } }
    window.addEventListener('beforeunload', beforeUnload)
    return () => { clearInterval(id); window.removeEventListener('beforeunload', beforeUnload); clearTimeout(timer.current) }
  }, [api, orgId, flush])

  return { plan, update, act, status, notice, clearNotice: () => setNotice('') }
}
