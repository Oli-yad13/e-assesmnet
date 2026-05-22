/**
 * Server-side data layer that uses the Supabase service role key.
 * The user identity is enforced explicitly from the already-validated
 * `locals.user.id` in hooks.server.ts — we don't rely on RLS for the
 * app's own queries (it remains as defense-in-depth for direct API access).
 *
 * Pattern: every method takes a userId and applies the appropriate scope
 * (own resources, or org membership) manually.
 */
import { getAdminClient } from './admin';

export function admin() {
	return getAdminClient();
}

export async function isMember(orgId: string, userId: string): Promise<boolean> {
	const { data } = await getAdminClient()
		.from('org_members')
		.select('user_id')
		.eq('org_id', orgId)
		.eq('user_id', userId)
		.maybeSingle();
	return !!data;
}
