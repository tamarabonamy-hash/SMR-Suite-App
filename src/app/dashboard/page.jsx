import { createClient } from '@/lib/supabase/server'
import SMRSuiteClient from './SMRSuiteClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <SMRSuiteClient user={user} />
}
