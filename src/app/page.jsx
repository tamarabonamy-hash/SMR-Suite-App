'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const G     = "#2C4A3E"
const GOLD  = "#D4A847"
const S1    = "#F7F4EF"
const S2    = "#EEE9E1"
const T1    = "#1C2B25"
const T3    = "#3D5A4F"
const T4    = "#5A7A6E"
const BDR   = "rgba(44,74,62,0.15)"
const RED   = "#B94040"
const CREAM = "#F7F4EF"
const mono  = { fontFamily: "'DM Mono',monospace" }
const serif = { fontFamily: "'Playfair Display',Georgia,serif" }

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#F7F4EF;font-family:'DM Sans',sans-serif;}
input{background:#EEE9E1;border:1px solid rgba(44,74,62,0.2);color:#1C2B25;font-family:'DM Sans',sans-serif;font-size:14px;padding:12px 16px;outline:none;width:100%;border-radius:0;}
input:focus{border-color:#D4A847;box-shadow:0 0 0 2px rgba(212,168,71,0.15);}
`

export default function LoginPage() {
  const [mode, setMode]       = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [message, setMessage] = useState('')
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true); setError(''); setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleSignup() {
    setLoading(true); setError(''); setMessage('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setMessage('Check your email to confirm your account.')
    setLoading(false)
  }

  async function handleReset() {
    setLoading(true); setError(''); setMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`
    })
    if (error) { setError(error.message); setLoading(false); return }
    setMessage('Password reset email sent. Check your inbox.')
    setLoading(false)
  }

  function handleSubmit() {
    if (mode === 'login')  handleLogin()
    if (mode === 'signup') handleSignup()
    if (mode === 'reset')  handleReset()
  }

  function switchMode(m) { setMode(m); setError(''); setMessage('') }

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:'100vh', background:S1, display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <header style={{ background:G, padding:'0 32px', display:'flex', alignItems:'center', gap:14, height:64, borderBottom:`3px solid ${GOLD}` }}>
          <svg width="34" height="34" viewBox="0 0 512 512" fill="none">
            <ellipse cx="280" cy="256" rx="200" ry="220" stroke="rgba(247,244,239,0.3)" strokeWidth="8" fill="none"/>
            <ellipse cx="310" cy="256" rx="135" ry="220" stroke="rgba(247,244,239,0.3)" strokeWidth="8" fill="none"/>
            <ellipse cx="270" cy="256" rx="75"  ry="85"  stroke="rgba(247,244,239,0.3)" strokeWidth="8" fill="none"/>
            <circle cx="320" cy="256" r="42" fill={GOLD}/>
            <circle cx="320" cy="256" r="20" fill="rgba(44,74,62,0.5)"/>
            <line x1="160" y1="120" x2="185" y2="385" stroke="rgba(247,244,239,0.25)" strokeWidth="7"/>
          </svg>
          <div>
            <div style={{ ...serif, fontSize:15, fontWeight:700, color:CREAM, lineHeight:1.1 }}>
              STRATEGY <em style={{ fontWeight:400, color:GOLD }}>Made Real</em>
            </div>
            <div style={{ ...mono, fontSize:8, color:'rgba(247,244,239,0.4)', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:2 }}>
              Where strategy becomes owned, measurable, and executed.
            </div>
          </div>
        </header>

        {/* Card */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ width:'100%', maxWidth:420 }}>

            <div style={{ marginBottom:32, textAlign:'center' }}>
              <div style={{ ...serif, fontSize:28, fontWeight:700, color:T1, marginBottom:8 }}>
                {mode==='login' ? 'Sign in' : mode==='signup' ? 'Create account' : 'Reset password'}
              </div>
              <div style={{ fontSize:13, color:T4 }}>
                {mode==='login' ? 'Access your Strategy Execution Suite' : mode==='signup' ? 'Get started with SMR' : 'We\'ll send you a reset link'}
              </div>
            </div>

            <div style={{ background:S2, border:`1px solid ${BDR}`, padding:32 }}>
              <div style={{ marginBottom:16 }}>
                <label style={{ ...mono, fontSize:9, color:T4, letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
              </div>

              {mode !== 'reset' && (
                <div style={{ marginBottom:24 }}>
                  <label style={{ ...mono, fontSize:9, color:T4, letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Password</label>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
                </div>
              )}

              {error && (
                <div style={{ background:'rgba(185,64,64,0.08)', border:'1px solid rgba(185,64,64,0.25)', padding:'10px 14px', marginBottom:16, fontSize:12, color:RED }}>
                  {error}
                </div>
              )}

              {message && (
                <div style={{ background:'rgba(44,74,62,0.08)', border:`1px solid ${BDR}`, padding:'10px 14px', marginBottom:16, fontSize:12, color:T3 }}>
                  {message}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !email || (mode!=='reset' && !password)}
                style={{ width:'100%', background:(loading||!email)?'rgba(212,168,71,0.3)':GOLD, color:G, border:'none', padding:'13px 0', ...mono, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', cursor:loading?'not-allowed':'pointer', fontWeight:700 }}
              >
                {loading ? 'Please wait...' : mode==='login' ? 'Sign In →' : mode==='signup' ? 'Create Account →' : 'Send Reset Link →'}
              </button>
            </div>

            <div style={{ marginTop:20, textAlign:'center', display:'flex', justifyContent:'center', gap:24 }}>
              {mode!=='login'  && <button onClick={()=>switchMode('login')}  style={{ background:'none', border:'none', ...mono, fontSize:10, color:T4, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', textDecoration:'underline' }}>Sign In</button>}
              {mode!=='signup' && <button onClick={()=>switchMode('signup')} style={{ background:'none', border:'none', ...mono, fontSize:10, color:T4, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', textDecoration:'underline' }}>Create Account</button>}
              {mode!=='reset'  && <button onClick={()=>switchMode('reset')}  style={{ background:'none', border:'none', ...mono, fontSize:10, color:T4, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', textDecoration:'underline' }}>Forgot Password</button>}
            </div>

          </div>
        </div>

        <div style={{ textAlign:'center', padding:'16px 0', ...mono, fontSize:8, color:T4, letterSpacing:'0.08em', textTransform:'uppercase' }}>
          Strategy Made Real · Eight Tools · One Suite
        </div>
      </div>
    </>
  )
}
