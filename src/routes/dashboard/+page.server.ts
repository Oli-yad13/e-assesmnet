import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { admin } from '$lib/server/userdb';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/signin');

	const { data: memberships, error } = await admin()
		.from('org_members')
		.select('role, joined_at, org:orgs ( id, name, created_at )')
		.eq('user_id', locals.user.id)
		.order('joined_at', { ascending: false });

	if (error) return { orgs: [], error: error.message };

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

		const sb = admin();

		const { data: org, error: orgError } = await sb
			.from('orgs')
			.insert({ name, created_by: locals.user.id })
			.select('id')
			.single();

		if (orgError || !org) return fail(400, { error: orgError?.message ?? 'Failed to create org.' });

		const { error: memberError } = await sb
			.from('org_members')
			.insert({ org_id: org.id, user_id: locals.user.id, role: 'owner' });

		if (memberError) return fail(400, { error: memberError.message });

		throw redirect(303, `/org/${org.id}`);
	}
};
