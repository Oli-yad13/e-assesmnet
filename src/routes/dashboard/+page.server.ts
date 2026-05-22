import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: memberships, error } = await locals.supabase
		.from('org_members')
		.select('role, org:orgs ( id, name, created_at )')
		.order('joined_at', { ascending: false });

	if (error) {
		return { orgs: [], error: error.message };
	}

	const orgs = (memberships ?? [])
		.map((m: any) => ({ ...m.org, role: m.role }))
		.filter((o: any) => o && o.id);

	return { orgs };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/signin');
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		if (!name) return fail(400, { error: 'Organisation name is required.' });

		const { data: org, error: orgError } = await locals.supabase
			.from('orgs')
			.insert({ name, created_by: locals.user.id })
			.select('id')
			.single();

		if (orgError || !org) return fail(400, { error: orgError?.message ?? 'Failed to create org.' });

		const { error: memberError } = await locals.supabase
			.from('org_members')
			.insert({ org_id: org.id, user_id: locals.user.id, role: 'owner' });

		if (memberError) return fail(400, { error: memberError.message });

		throw redirect(303, `/org/${org.id}`);
	}
};
