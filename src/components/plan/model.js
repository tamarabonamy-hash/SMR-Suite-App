// ─── PLAN DATA MODEL ──────────────────────────────────────────────────────────
// One shared plan flows through all five stages:
// Clarify → Organise → Cascade → Track → Review.
//
// plan.priorities  annual company priorities (3–5), one owner each
// plan.goals       quarterly goals (parentId null) and team commitments
//                  (parentId = goal id); each has one owner
// plan.actions     owned actions raised in reviews
// plan.reviews     saved check-ins with decisions

export const STATUS = {
  new:  { label: 'Not started', tone: 'muted' },
  on:   { label: 'On track',    tone: 'teal' },
  risk: { label: 'At risk',     tone: 'warning' },
  off:  { label: 'Off track',   tone: 'error' },
  done: { label: 'Done',        tone: 'deep' },
}

export const STAGES = [
  { id: 'clarify',  num: '01', label: 'Clarify',  q: 'Where are we going, and what matters most this year?' },
  { id: 'organise', num: '02', label: 'Organise', q: 'Who owns what, and how will we run the business?' },
  { id: 'cascade',  num: '03', label: 'Cascade',  q: 'What will each leader and team deliver this quarter?' },
  { id: 'track',    num: '04', label: 'Track',    q: 'Are we on track, week by week?' },
  { id: 'review',   num: '05', label: 'Review',   q: 'What are we deciding, and who is doing what by when?' },
]

export const REVIEW_TYPES = {
  weekly:    { label: 'Weekly check-in',     length: '30 min',   prompt: 'Exceptions only. Talk about at-risk and off-track goals, and leave every one with a decision or an owned action.' },
  monthly:   { label: 'Monthly review',      length: '90 min',   prompt: 'Look at trends, not just status. Which measures have moved the wrong way two months running? What needs resourcing or stopping?' },
  quarterly: { label: 'Quarterly reset',     length: 'Half day', prompt: 'Close the quarter: mark each goal done, carry forward or drop. Then set next quarter\'s goals in Cascade.' },
}

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export const emptyPlan = () => ({
  version: 1,
  org: '',
  period: '',
  purpose: '',
  ambition: '',
  notDoing: [],
  people: [],
  priorities: [],
  goals: [],
  actions: [],
  reviews: [],
  rhythm: { weeklyDay: 'Monday', monthlyWeek: 'First', quarterly: 'Last two weeks of the quarter' },
})

// Fills gaps so plans saved by older versions (or empty new ones) always have every field.
export function normalisePlan(data) {
  const base = emptyPlan()
  const p = { ...base, ...(data || {}) }
  for (const k of ['notDoing', 'people', 'priorities', 'goals', 'actions', 'reviews']) if (!Array.isArray(p[k])) p[k] = []
  p.rhythm = { ...base.rhythm, ...(p.rhythm || {}) }
  return p
}

export const isPlanEmpty = p => !p.org && !p.purpose && !p.priorities.length && !p.people.length

// True when the item's owner is the person whose email is the signed-in user's.
export function ownsItem(plan, item, email) {
  if (!email || !item?.ownerId) return false
  const person = plan.people.find(p => p.id === item.ownerId)
  return !!person?.email && person.email.trim().toLowerCase() === email
}

export const personForEmail = (plan, email) => plan.people.find(p => p.email && p.email.trim().toLowerCase() === email)

export const uid = () => Math.random().toString(36).slice(2, 10)
export const today = () => new Date().toISOString().slice(0, 10)
export const daysFromNow = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)
export const daysSince = d => (d ? Math.floor((Date.now() - new Date(d).getTime()) / 864e5) : null)
export const fmtDate = d => (d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—')

const num = v => {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : null
}

export const topGoals = plan => plan.goals.filter(g => !g.parentId)
export const childrenOf = (plan, goalId) => plan.goals.filter(g => g.parentId === goalId)
export const personName = (plan, id) => plan.people.find(p => p.id === id)?.name || 'Unassigned'
export const lastUpdate = g => (g.updates?.length ? g.updates[g.updates.length - 1].date : null)
export const isStale = g => g.status !== 'done' && (daysSince(lastUpdate(g)) ?? 99) > 7

// Share of the way from baseline to target, or null when the numbers can't say.
export function progressOf(g) {
  if (g.status === 'done') return 1
  const b = num(g.baseline) ?? 0
  const t = num(g.target)
  const c = num(g.current)
  if (t == null || c == null || t === b) return null
  return Math.max(0, Math.min(1, (c - b) / (t - b)))
}

export function nextWeekday(dayName) {
  const target = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dayName)
  const d = new Date()
  const diff = (target - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

export function stageState(plan, id) {
  const top = topGoals(plan)
  const pr = plan.priorities
  switch (id) {
    case 'clarify':
      if (plan.purpose && plan.ambition && pr.length >= 1 && pr.length <= 5 && pr.every(p => p.title && p.measure)) return 'done'
      return plan.purpose || plan.org || pr.length ? 'started' : 'todo'
    case 'organise':
      if (plan.people.length >= 2 && pr.length && pr.every(p => p.ownerId)) return 'done'
      return plan.people.length ? 'started' : 'todo'
    case 'cascade':
      if (pr.length && pr.every(p => top.some(g => g.priorityId === p.id)) && top.every(g => g.ownerId && g.target && g.due)) return 'done'
      return top.length ? 'started' : 'todo'
    case 'track':
      if (top.length && !top.some(isStale)) return 'done'
      return top.some(g => g.updates?.length) ? 'started' : 'todo'
    case 'review':
      if (plan.reviews.some(r => daysSince(r.date) <= 7)) return 'done'
      return plan.reviews.length ? 'started' : 'todo'
    default:
      return 'todo'
  }
}

// Best-practice checks, phrased as coaching rather than errors.
export function coachNotes(plan) {
  const notes = []
  const add = (stage, text) => notes.push({ stage, text })
  const top = topGoals(plan)
  const name = t => `“${t || 'Untitled'}”`

  if (!plan.purpose || !plan.ambition) add('clarify', 'Write your purpose and 3-year ambition so every priority has something to ladder up to.')
  if (!plan.priorities.length) add('clarify', 'Choose 3–5 priorities for this year.')
  if (plan.priorities.length > 5) add('clarify', `You have ${plan.priorities.length} priorities. More than 5 usually means none of them are.`)

  plan.priorities.forEach(p => {
    if (!p.measure) add('clarify', `${name(p.title)} needs a success measure, so you'll know when it's achieved.`)
    if (!p.ownerId) add('organise', `${name(p.title)} has no single owner.`)
    if (!top.some(g => g.priorityId === p.id)) add('cascade', `${name(p.title)} has no quarterly goals yet.`)
  })

  top.forEach(g => {
    const missing = [!g.ownerId && 'an owner', !g.target && 'a target', !g.due && 'a due date'].filter(Boolean)
    if (missing.length) add('cascade', `${name(g.title)} needs ${missing.join(', ')}.`)
  })

  plan.people.forEach(per => {
    const load = top.filter(g => g.ownerId === per.id && g.status !== 'done').length
    if (load > 3) add('cascade', `${per.name} owns ${load} live goals. More than 3 at once tends to stall.`)
  })

  if (top.length) {
    const stale = top.filter(isStale)
    if (stale.length) add('track', `${stale.length} goal${stale.length > 1 ? 's haven\'t' : ' hasn\'t'} been updated in the last week.`)
    const silentRed = top.filter(g => (g.status === 'off' || g.status === 'risk') && !g.updates?.[g.updates.length - 1]?.note)
    if (silentRed.length) add('track', `${silentRed.length} at-risk or off-track goal${silentRed.length > 1 ? 's have' : ' has'} no explanation.`)
    if (!plan.reviews.some(r => daysSince(r.date) <= 7)) add('review', 'No check-in in the last week. Run a 30-minute weekly check-in.')
  }

  const overdue = plan.actions.filter(a => !a.done && a.due && a.due < today())
  if (overdue.length) add('review', `${overdue.length} action${overdue.length > 1 ? 's are' : ' is'} overdue.`)

  return notes
}
