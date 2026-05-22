import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const { data: org, error: orgError } = await locals.supabase
		.from('orgs')
		.select('id, name, created_by, created_at')
		.eq('id', params.orgId)
		.maybeSingle();

	if (orgError) throw error(500, orgError.message);
	if (!org) throw error(404, 'Organisation not found or you are not a member.');

	return { org };
};
