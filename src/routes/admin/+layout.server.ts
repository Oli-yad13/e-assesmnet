import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isAdminEmail } from '$lib/server/admin';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!isAdminEmail(locals.user?.email)) {
		throw error(403, 'Admin access only.');
	}
};
