'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SMRSuite from '@/components/SMRSuite'

export default function SMRSuiteClient({ user }) {
  const router   = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return <SMRSuite user={user} onSignOut={handleSignOut} />
}
