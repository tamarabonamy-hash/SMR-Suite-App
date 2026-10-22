import PlanRoot from '@/components/plan/PlanRoot'

export const metadata = { title: 'Operating Plan · Strategy Made Real' }

// Sign-in is enforced by the dashboard layout; data access by Supabase RLS.
export default function PlanPage() {
  return <PlanRoot />
}
