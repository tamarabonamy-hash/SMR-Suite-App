'use client'

import { useCallback, useEffect, useState } from 'react'
import { mono } from '@/lib/brand'
import { Btn, C, Card, Label, SectionTitle } from './ui'

const ROLES = [
  { id: 'member', label: 'Member', desc: 'Sees the plan; updates their own goals and actions' },
  { id: 'admin', label: 'Admin', desc: 'Edits the plan and invites people' },
  { id: 'owner', label: 'Owner', desc: 'Everything, including roles and removing people' },
]

// Who can sign in to this company's plan. Invited people sign up (or sign in)
// with the invited email and are added automatically.
export function TeamAccess({ api, org, role, plan }) {
  const isOwner = role === 'owner'
  const [team, setTeam] = useState([])
  const [invites, setInvites] = useState([])
  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    try {
      const [t, i] = await Promise.all([api.team(org.id), api.invitations(org.id)])
      setTeam(t); setInvites(i)
    } catch (e) { setError(e.message) }
  }, [api, org.id])
  useEffect(() => { load() }, [load])

  const run = fn => async () => { setError(''); try { await fn(); await load() } catch (e) { setError(e.message) } }
  const known = new Set([...team.map(t => t.email.toLowerCase()), ...invites.map(i => i.email)])
  const suggestions = plan.people.filter(p => p.email && !known.has(p.email.trim().toLowerCase()))
  const signInLink = typeof window !== 'undefined' ? `${window.location.origin}/dashboard/plan` : ''

  const invite = addr => run(async () => {
    const clean = addr.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(clean)) throw new Error('Enter a valid email address')
    await api.invite(org.id, clean, inviteRole)
    setEmail('')
  })

  return (
    <Card>
      <SectionTitle title="Team & access" sub="Who can sign in to this plan. Invite people with the email they'll sign in with; they join automatically when they sign up or next sign in." />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <input style={{ flex: '2 1 240px' }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" onKeyDown={e => e.key === 'Enter' && invite(email)()} />
        <select style={{ flex: '1 1 140px' }} value={inviteRole} onChange={e => setInviteRole(e.target.value)} aria-label="Role">
          {ROLES.filter(r => isOwner || r.id !== 'owner').map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <Btn onClick={invite(email)} disabled={!email.trim()}>Invite</Btn>
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>{ROLES.find(r => r.id === inviteRole).desc}</div>

      {suggestions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Label>In your leadership team but not invited yet</Label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {suggestions.map(p => <Btn key={p.id} kind="secondary" small onClick={invite(p.email)}>+ {p.name || p.email}</Btn>)}
          </div>
        </div>
      )}

      {error && <div style={{ fontSize: 13, color: C.error, marginBottom: 12 }}>{error}</div>}

      <Label>Members</Label>
      {team.length === 0 && <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Nobody has joined yet.</div>}
      {team.map(t => (
        <div key={t.user_id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${C.line}`, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', fontSize: 14, color: C.ink }}>{t.email}</div>
          {isOwner ? (
            <select style={{ width: 130 }} value={t.role} onChange={e => run(() => api.setRole(org.id, t.user_id, e.target.value))()} aria-label={`Role for ${t.email}`}>
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          ) : <span style={{ ...mono, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.role}</span>}
          {isOwner && <Btn kind="ghost" small onClick={() => window.confirm(`Remove ${t.email} from ${org.name}?`) && run(() => api.removeMember(org.id, t.user_id))()}>Remove</Btn>}
        </div>
      ))}

      {invites.length > 0 && <>
        <Label style={{ marginTop: 16 }}>Invited, not joined yet</Label>
        {invites.map(i => (
          <div key={i.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${C.line}`, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', fontSize: 14, color: C.body }}>{i.email}</div>
            <span style={{ ...mono, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{i.role}</span>
            <Btn kind="ghost" small onClick={run(() => api.cancelInvitation(i.id))}>Cancel</Btn>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: C.muted }}>Send them the sign-in link and ask them to use the invited email:</div>
          <Btn kind="secondary" small onClick={async () => { try { await navigator.clipboard.writeText(signInLink); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {} }}>
            {copied ? 'Copied' : 'Copy sign-in link'}
          </Btn>
        </div>
      </>}
    </Card>
  )
}
