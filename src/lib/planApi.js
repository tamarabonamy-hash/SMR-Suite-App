// ─── OPERATING PLAN API ───────────────────────────────────────────────────────
// Thin wrapper over the Supabase tables and functions in
// supabase/migrations/20261022000000_operating_plan.sql.
// Every call throws on error; a stale save throws with `conflict: true`.

import { createClient } from '@/lib/supabase/client'

export function createPlanApi(supabase = createClient()) {
  const check = ({ data, error }) => {
    if (error) {
      const e = new Error(error.message)
      e.conflict = error.code === '40001'
      throw e
    }
    return data
  }
  const rpc = (fn, args) => supabase.rpc(fn, args).then(check)
  const userId = async () => (await supabase.auth.getUser()).data.user?.id

  return {
    async whoami() {
      const { data: { user } } = await supabase.auth.getUser()
      const admin = check(await supabase.from('platform_admins').select('user_id').maybeSingle())
      return { id: user?.id, email: user?.email?.toLowerCase() || '', isPlatformAdmin: !!admin }
    },
    acceptInvitations: () => rpc('accept_invitations'),
    workspaces: () => rpc('my_workspaces'),
    createOrganisation: name => rpc('create_organisation', { p_name: name }),

    loadPlan: async orgId => check(await supabase.from('plans').select('data, version').eq('org_id', orgId).single()),
    savePlan: (orgId, data, version) => rpc('save_plan', { p_org: orgId, p_data: data, p_expected_version: version }),
    updateItem: async (orgId, op, payload) => (await rpc('update_plan_item', { p_org: orgId, p_op: op, p_payload: payload }))[0],

    team: orgId => rpc('org_team', { p_org: orgId }),
    invitations: async orgId => check(await supabase.from('invitations').select('id, email, role, created_at')
      .eq('org_id', orgId).is('accepted_at', null).order('created_at')),
    invite: async (orgId, email, role) => check(await supabase.from('invitations')
      .insert({ org_id: orgId, email: email.trim().toLowerCase(), role, invited_by: await userId() })),
    cancelInvitation: async id => check(await supabase.from('invitations').delete().eq('id', id)),
    setRole: async (orgId, memberId, role) => check(await supabase.from('memberships').update({ role }).eq('org_id', orgId).eq('user_id', memberId)),
    removeMember: async (orgId, memberId) => check(await supabase.from('memberships').delete().eq('org_id', orgId).eq('user_id', memberId)),
  }
}
