import { daysFromNow as d, emptyPlan } from './model'

// A worked example (fictional founder-led scale-up) so leaders can see a
// complete plan before building their own. Dates are relative to today.
export function samplePlan() {
  const people = [
    { id: 'p1', name: 'Sam Patel',   role: 'Founder & CEO' },
    { id: 'p2', name: 'Alex Morgan', role: 'COO' },
    { id: 'p3', name: 'Priya Shah',  role: 'CFO' },
    { id: 'p4', name: 'Jordan Lee',  role: 'Head of Product' },
    { id: 'p5', name: 'Chris Wong',  role: 'Head of Sales' },
  ]

  const priorities = [
    { id: 'pr1', title: 'Win the mid-market', why: 'Mid-market clinics churn least and buy the full platform.', measure: 'ARR from $2.1m to $4m', ownerId: 'p5' },
    { id: 'pr2', title: 'Make onboarding self-serve', why: 'Implementation is our bottleneck to growth and a drag on margin.', measure: 'Time to go-live from 45 to 14 days', ownerId: 'p4' },
    { id: 'pr3', title: 'Build an operating cadence that scales', why: 'We\'re past the size where the founder can hold it all.', measure: 'Every exec goal reviewed weekly; 90% actions closed on time', ownerId: 'p2' },
    { id: 'pr4', title: 'Fund the next stage', why: 'Gives us 24 months of runway to reach profitability.', measure: 'Series A closed by Q3', ownerId: 'p3' },
  ]

  const upd = (days, status, current, note) => ({ date: d(-days), status, current, note })

  const goals = [
    { id: 'g1', priorityId: 'pr1', parentId: null, title: 'Close 12 new mid-market clinics', ownerId: 'p5', measure: 'New mid-market clinics', baseline: '0', target: '12', current: '7', due: d(40), status: 'on',
      updates: [upd(10, 'on', '5', 'Pipeline healthy, 2 in contracting.'), upd(3, 'on', '7', 'Two more signed this week.')] },
    { id: 'g2', priorityId: 'pr1', parentId: null, title: 'Lift win rate on qualified deals', ownerId: 'p5', measure: 'Win rate %', baseline: '18', target: '28', current: '20', due: d(55), status: 'risk',
      updates: [upd(4, 'risk', '20', 'Losing on price to two competitors. Need a pricing call.')] },
    { id: 'g3', priorityId: 'pr2', parentId: null, title: 'Launch guided setup for new clinics', ownerId: 'p4', measure: 'Clinics live via guided setup', baseline: '0', target: '20', current: '4', due: d(30), status: 'off',
      updates: [upd(5, 'off', '4', 'Integration with practice systems slipped three weeks.')] },
    { id: 'g4', priorityId: 'pr2', parentId: null, title: 'Cut median go-live time', ownerId: 'p2', measure: 'Median days to go-live', baseline: '45', target: '21', current: '33', due: d(60), status: 'on',
      updates: [upd(2, 'on', '33', 'Templates for top 3 clinic types now in use.')] },
    { id: 'g5', priorityId: 'pr3', parentId: null, title: 'Run weekly exec check-in and monthly review', ownerId: 'p2', measure: 'Check-ins held', baseline: '0', target: '12', current: '6', due: d(45), status: 'on',
      updates: [upd(6, 'on', '6', '')] },
    { id: 'g6', priorityId: 'pr4', parentId: null, title: 'Board-approved plan and data room ready', ownerId: 'p3', measure: 'Milestones complete', baseline: '0', target: '5', current: '2', due: d(35), status: 'risk',
      updates: [upd(12, 'risk', '2', 'Cohort data needs cleaning before it can go in the data room.')] },

    { id: 'c1', priorityId: 'pr1', parentId: 'g1', title: 'Run 3 regional clinic events', ownerId: 'p5', due: d(20), status: 'done', updates: [] },
    { id: 'c2', priorityId: 'pr1', parentId: 'g1', title: 'Publish two mid-market case studies', ownerId: 'p4', due: d(25), status: 'new', updates: [] },
    { id: 'c3', priorityId: 'pr1', parentId: 'g2', title: 'New pricing tiers approved', ownerId: 'p3', due: d(14), status: 'new', updates: [] },
    { id: 'c4', priorityId: 'pr2', parentId: 'g3', title: 'Ship practice-system integration', ownerId: 'p4', due: d(18), status: 'new', updates: [] },
    { id: 'c5', priorityId: 'pr2', parentId: 'g4', title: 'Onboarding templates for all clinic types', ownerId: 'p2', due: d(21), status: 'new', updates: [] },
    { id: 'c6', priorityId: 'pr4', parentId: 'g6', title: 'Clean and validate cohort data', ownerId: 'p3', due: d(10), status: 'new', updates: [] },
  ]

  const reviews = [
    { id: 'r1', type: 'weekly', date: d(-8), summary: 'Pipeline is strong; onboarding integration is the main risk to the quarter.',
      decisions: [{ goalId: 'g3', issue: 'Integration vendor delayed API access.', decision: 'Escalate to vendor CEO; build CSV import as a fallback.' }] },
  ]

  const actions = [
    { id: 'a1', text: 'Escalate API access with vendor CEO', ownerId: 'p1', due: d(-5), done: true, goalId: 'g3', reviewId: 'r1' },
    { id: 'a2', text: 'Scope CSV import fallback', ownerId: 'p4', due: d(-1), done: false, goalId: 'g3', reviewId: 'r1' },
    { id: 'a3', text: 'Bring pricing options to next check-in', ownerId: 'p3', due: d(2), done: false, goalId: 'g2', reviewId: 'r1' },
  ]

  return {
    ...emptyPlan(),
    org: 'Northwind Health (example)',
    period: 'FY27',
    purpose: 'Give every clinic the tools to spend more time with patients and less on admin.',
    ambition: 'By 2029, 1,500 clinics run on Northwind, we\'re profitable, and new clinics go live in under a week without our help.',
    notDoing: ['Enter hospitals before mid-market is won', 'Custom builds for single customers', 'New countries before $5m ARR'],
    people, priorities, goals, reviews, actions,
  }
}
