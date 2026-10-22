import { createClient } from '@/lib/supabase/server'
import PlanApp from '@/components/plan/PlanApp'

export const metadata = { title: 'Operating Plan · Strategy Made Real' }

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <PlanApp user={user ? { id: user.id, email: user.email } : null} />
}
