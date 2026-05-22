import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { admin, isMember } from '$lib/server/userdb';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	if (!locals.user) throw redirect(303, '/signin');

	if (!(await isMember(params.orgId, locals.user.id))) {
		throw error(404, 'Organisation not found or you are not a member.');
	}

	const { data: org, error: orgError } = await admin()
		.from('orgs')
		.select('id, name, created_by, created_at')
		.eq('id', params.orgId)
		.maybeSingle();

	if (orgError) throw error(500, orgError.message);
	if (!org) throw error(404, 'Organisation not found.');

	return { org };
};
