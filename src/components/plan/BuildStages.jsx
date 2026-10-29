'use client'

import { mono, serif } from '@/lib/brand'
import { WEEKDAYS, REVIEW_TYPES, childrenOf, personName, topGoals, uid } from './model'
import { Btn, C, Card, ChipList, Empty, Field, Guard, Label, NextBar, PersonSelect, RemoveBtn, SectionTitle, StageHeader } from './ui'
import { TeamAccess } from './TeamAccess'

// ─── 01 CLARIFY ───────────────────────────────────────────────────────────────
export function Clarify({ plan, update, go, readOnly, api, org, role }) {
  const n = plan.priorities.length
  const setField = key => e => { const v = e.target.value; update(p => { p[key] = v }) }
  const setPriority = (id, key) => e => { const v = e.target.value; update(p => { p.priorities.find(x => x.id === id)[key] = v }) }

  return <>
    <StageHeader stageId="clarify" tip="Fit the strategy on one page: a purpose, a 3-year ambition, and 3–5 priorities for this year, each with a measurable definition of success. If it doesn't fit on a page, people won't remember it." />
    <Guard readOnly={readOnly}>

    <Card>
      <SectionTitle title="Strategy on a page" />
      <div className="pl-grid2">
        <Field label="Organisation"><input value={plan.org} onChange={setField('org')} placeholder="e.g. Northwind Health" /></Field>
        <Field label="Planning period"><input value={plan.period} onChange={setField('period')} placeholder="e.g. FY27" /></Field>
      </div>
      <Field label="Purpose" hint="Why you exist, in one sentence a new hire could repeat.">
        <textarea rows={2} value={plan.purpose} onChange={setField('purpose')} />
      </Field>
      <Field label="3-year ambition" hint="What will be true in three years? Make it concrete enough to know whether you got there." style={{ marginBottom: 0 }}>
        <textarea rows={3} value={plan.ambition} onChange={setField('ambition')} />
      </Field>
    </Card>

    <Card>
      <SectionTitle title="This year's priorities" sub="The few things that must go right this year. Everything else supports them or waits." right={`${n} of 3–5`} />
      {plan.priorities.map((pr, i) => (
        <div key={pr.id} style={{ display: 'flex', gap: 14, padding: '16px 0', borderTop: `1px solid ${C.line}` }}>
          <div style={{ ...serif, fontSize: 28, color: C.teal, lineHeight: 1, width: 28, flexShrink: 0, paddingTop: 22 }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pl-grid2">
              <Field label="Priority"><input value={pr.title} onChange={setPriority(pr.id, 'title')} placeholder="e.g. Win the mid-market" /></Field>
              <Field label="Success measure"><input value={pr.measure} onChange={setPriority(pr.id, 'measure')} placeholder="e.g. ARR from $2.1m to $4m" /></Field>
            </div>
            <Field label="Why it matters" style={{ marginBottom: 0 }}><input value={pr.why} onChange={setPriority(pr.id, 'why')} placeholder="The case you'd make to the team in one line" /></Field>
          </div>
          <RemoveBtn label="Remove priority" onClick={() => update(p => {
            p.priorities = p.priorities.filter(x => x.id !== pr.id)
            p.goals = p.goals.filter(g => g.priorityId !== pr.id)
          })} />
        </div>
      ))}
      {n > 5 && <div style={{ fontSize: 13, color: C.warning, margin: '8px 0 16px' }}>More than 5 priorities usually means none of them are. What could wait until next year?</div>}
      <Btn kind="secondary" small onClick={() => update(p => { p.priorities.push({ id: uid(), title: '', why: '', measure: '', ownerId: null }) })}>+ Add priority</Btn>
    </Card>

    <Card>
      <SectionTitle title="What we will not do" sub="Saying no out loud is what makes the priorities real." />
      <ChipList items={plan.notDoing} placeholder="e.g. Enter new countries before $5m ARR"
        onAdd={t => update(p => { p.notDoing.push(t) })}
        onRemove={i => update(p => { p.notDoing.splice(i, 1) })} />
    </Card>

    </Guard>
    <NextBar onBack={() => go('home')} onNext={() => go('organise')} nextLabel="Organise" />
  </>
}

// ─── 02 ORGANISE ──────────────────────────────────────────────────────────────
export function Organise({ plan, update, go, readOnly, api, org, role }) {
  const top = topGoals(plan)
  const setPerson = (id, key) => e => { const v = e.target.value; update(p => { p.people.find(x => x.id === id)[key] = v }) }

  return <>
    <StageHeader stageId="organise" tip="Give every priority exactly one owner. Shared ownership usually means nobody owns it. Then fix the meeting rhythm in advance, so progress gets reviewed on a schedule rather than chased." />
    {!readOnly && <TeamAccess api={api} org={org} role={role} plan={plan} />}
    <Guard readOnly={readOnly}>

    <Card>
      <SectionTitle title="Leadership team" sub="The people who own priorities and goals. Use the email they sign in with, so they can update their own goals." />
      {plan.people.map(per => (
        <div key={per.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <input style={{ flex: '1 1 160px' }} value={per.name} onChange={setPerson(per.id, 'name')} placeholder="Name" />
          <input style={{ flex: '1 1 160px' }} value={per.role} onChange={setPerson(per.id, 'role')} placeholder="Role" />
          <input style={{ flex: '1.4 1 220px' }} type="email" value={per.email || ''} onChange={setPerson(per.id, 'email')} placeholder="Sign-in email" />
          <RemoveBtn label="Remove person" onClick={() => update(p => {
            p.people = p.people.filter(x => x.id !== per.id)
            p.priorities.forEach(x => { if (x.ownerId === per.id) x.ownerId = null })
            p.goals.forEach(x => { if (x.ownerId === per.id) x.ownerId = null })
            p.actions.forEach(x => { if (x.ownerId === per.id) x.ownerId = null })
          })} />
        </div>
      ))}
      <Btn kind="secondary" small onClick={() => update(p => { p.people.push({ id: uid(), name: '', role: '', email: '' }) })}>+ Add person</Btn>
    </Card>

    <Card>
      <SectionTitle title="Who owns each priority" sub="One name per priority: the person who reports on it and makes the calls." />
      {!plan.priorities.length && <div style={{ fontSize: 14, color: C.muted }}>Add priorities in Clarify first.</div>}
      {plan.priorities.map((pr, i) => (
        <div key={pr.id} className="pl-grid2" style={{ alignItems: 'center', padding: '10px 0', borderTop: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 15, color: C.ink }}><span style={{ ...mono, fontSize: 11, color: C.teal, marginRight: 10 }}>{String(i + 1).padStart(2, '0')}</span>{pr.title || 'Untitled priority'}</div>
          <PersonSelect people={plan.people} value={pr.ownerId} onChange={v => update(p => { p.priorities.find(x => x.id === pr.id).ownerId = v })} />
        </div>
      ))}
    </Card>

    {plan.people.length > 0 && (
      <Card>
        <SectionTitle title="Load by person" sub="Spot overloaded leaders before the quarter starts." />
        <div className="pl-grid3">
          {plan.people.map(per => {
            const pri = plan.priorities.filter(x => x.ownerId === per.id).length
            const gl = top.filter(g => g.ownerId === per.id && g.status !== 'done').length
            const acts = plan.actions.filter(a => a.ownerId === per.id && !a.done).length
            return (
              <div key={per.id} style={{ background: C.raised, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{per.name || 'Unnamed'}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{per.role}</div>
                <div style={{ ...mono, fontSize: 11, color: gl > 3 ? C.warning : C.body, lineHeight: 1.8 }}>
                  {pri} priorit{pri === 1 ? 'y' : 'ies'} · {gl} goal{gl === 1 ? '' : 's'} · {acts} action{acts === 1 ? '' : 's'}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    )}

    <Card>
      <SectionTitle title="Operating rhythm" sub="Three meetings, each with a different job. Put them in calendars now." />
      <div className="pl-grid3">
        <RhythmCard type="weekly">
          <Label>Day</Label>
          <select value={plan.rhythm.weeklyDay} onChange={e => { const v = e.target.value; update(p => { p.rhythm.weeklyDay = v }) }}>
            {WEEKDAYS.map(d => <option key={d}>{d}</option>)}
          </select>
        </RhythmCard>
        <RhythmCard type="monthly">
          <Label>Week of month</Label>
          <select value={plan.rhythm.monthlyWeek} onChange={e => { const v = e.target.value; update(p => { p.rhythm.monthlyWeek = v }) }}>
            {['First', 'Second', 'Third', 'Last'].map(d => <option key={d}>{d}</option>)}
          </select>
        </RhythmCard>
        <RhythmCard type="quarterly">
          <Label>When</Label>
          <div style={{ fontSize: 13, color: C.body, padding: '10px 0' }}>{plan.rhythm.quarterly}</div>
        </RhythmCard>
      </div>
    </Card>

    </Guard>
    <NextBar onBack={() => go('clarify')} onNext={() => go('cascade')} nextLabel="Cascade" />
  </>
}

function RhythmCard({ type, children }) {
  const t = REVIEW_TYPES[type]
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <div style={{ ...serif, fontSize: 20, fontWeight: 600, color: C.ink }}>{t.label}</div>
        <div style={{ ...mono, fontSize: 10, color: C.muted }}>{t.length}</div>
      </div>
      <div style={{ fontSize: 13, color: C.body, lineHeight: 1.55, flex: 1 }}>{t.prompt}</div>
      <div>{children}</div>
    </div>
  )
}

// ─── 03 CASCADE ───────────────────────────────────────────────────────────────
export function Cascade({ plan, update, go, readOnly, api, org, role }) {
  if (!plan.priorities.length) {
    return <>
      <StageHeader stageId="cascade" />
      <Empty title="Nothing to cascade yet" action={readOnly ? null : <Btn onClick={() => go('clarify')}>Go to Clarify</Btn>}>Set this year's priorities first, then break each one into quarterly goals here.</Empty>
    </>
  }

  const addGoal = (priorityId, parentId = null) => update(p => {
    p.goals.push({ id: uid(), priorityId, parentId, title: '', ownerId: null, measure: '', baseline: '', target: '', current: '', due: '', status: 'new', updates: [] })
  })
  const setGoal = (id, key, v) => update(p => { p.goals.find(g => g.id === id)[key] = v })
  const removeGoal = id => update(p => { p.goals = p.goals.filter(g => g.id !== id && g.parentId !== id) })

  return <>
    <StageHeader stageId="cascade" tip="Break each priority into 1–3 goals for the quarter, each owned by one executive. Then break each goal into team commitments. A good goal states a measure, where you are now, where you'll be, and by when." />
    <Guard readOnly={readOnly}>

    {plan.priorities.map((pr, i) => {
      const goals = topGoals(plan).filter(g => g.priorityId === pr.id)
      return (
        <Card key={pr.id}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            <div style={{ ...serif, fontSize: 32, color: C.teal, lineHeight: 1 }}>{i + 1}</div>
            <div>
              <div style={{ ...serif, fontSize: 24, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{pr.title || 'Untitled priority'}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{personName(plan, pr.ownerId)}{pr.measure ? ` · ${pr.measure}` : ''}</div>
            </div>
          </div>

          {goals.map(g => (
            <div key={g.id} style={{ border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.teal}`, borderRadius: 10, padding: 16, marginBottom: 12, background: C.paper }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Label color={C.teal}>Quarterly goal</Label>
                  <div className="pl-grid2">
                    <input value={g.title} onChange={e => setGoal(g.id, 'title', e.target.value)} placeholder="e.g. Close 12 new mid-market clinics" />
                    <PersonSelect people={plan.people} value={g.ownerId} onChange={v => setGoal(g.id, 'ownerId', v)} />
                  </div>
                  <div className="pl-grid4" style={{ marginTop: 12 }}>
                    <div><Label>Measure</Label><input value={g.measure} onChange={e => setGoal(g.id, 'measure', e.target.value)} placeholder="New clinics" /></div>
                    <div><Label>Baseline</Label><input value={g.baseline} onChange={e => setGoal(g.id, 'baseline', e.target.value)} placeholder="0" /></div>
                    <div><Label>Target</Label><input value={g.target} onChange={e => setGoal(g.id, 'target', e.target.value)} placeholder="12" /></div>
                    <div><Label>Due</Label><input type="date" value={g.due} onChange={e => setGoal(g.id, 'due', e.target.value)} /></div>
                  </div>
                </div>
                <RemoveBtn label="Remove goal" onClick={() => removeGoal(g.id)} />
              </div>

              <div style={{ marginTop: 14, paddingLeft: 16, borderLeft: `1px dashed ${C.line}` }}>
                <Label>Team commitments</Label>
                {childrenOf(plan, g.id).map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                    <input style={{ flex: '2 1 220px' }} value={c.title} onChange={e => setGoal(c.id, 'title', e.target.value)} placeholder="e.g. Publish two case studies" />
                    <div style={{ flex: '1 1 140px' }}><PersonSelect people={plan.people} value={c.ownerId} onChange={v => setGoal(c.id, 'ownerId', v)} /></div>
                    <input style={{ flex: '1 1 140px' }} type="date" value={c.due} onChange={e => setGoal(c.id, 'due', e.target.value)} />
                    <RemoveBtn label="Remove commitment" onClick={() => removeGoal(c.id)} />
                  </div>
                ))}
                <Btn kind="ghost" small onClick={() => addGoal(pr.id, g.id)}>+ Add commitment</Btn>
              </div>
            </div>
          ))}

          {goals.length >= 3 && <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>Three goals is plenty for one quarter.</div>}
          <Btn kind="secondary" small onClick={() => addGoal(pr.id)}>+ Add quarterly goal</Btn>
        </Card>
      )
    })}

    </Guard>
    <NextBar onBack={() => go('organise')} onNext={() => go('track')} nextLabel="Track" />
  </>
}
