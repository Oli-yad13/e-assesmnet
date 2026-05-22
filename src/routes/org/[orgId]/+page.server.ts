import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { admin, isMember } from '$lib/server/userdb';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) throw redirect(303, '/signin');
	if (!(await isMember(params.orgId, locals.user.id))) throw error(404, 'Not a member.');

	const sb = admin();
	const orgId = params.orgId;

	const [{ data: rawMembers }, { data: assessments }, { data: invites }] = await Promise.all([
		sb.from('org_members').select('user_id, role, joined_at').eq('org_id', orgId),
		sb.from('assessments').select('id, user_id, status, scores, submitted_at, updated_at').eq('org_id', orgId),
		sb
			.from('org_invites')
			.select('token, created_at, revoked_at')
			.eq('org_id', orgId)
			.is('revoked_at', null)
			.order('created_at', { ascending: false })
			.limit(1)
	]);

	const userIds = (rawMembers ?? []).map((m: any) => m.user_id);
	const { data: profiles } = userIds.length
		? await sb.from('profiles').select('id, full_name').in('id', userIds)
		: { data: [] as { id: string; full_name: string | null }[] };
	const nameById: Record<string, string> = {};
	for (const p of profiles ?? []) nameById[p.id] = p.full_name ?? 'Unnamed user';

	const members = (rawMembers ?? []).map((m: any) => ({
		user_id: m.user_id,
		role: m.role,
		joined_at: m.joined_at,
		full_name: nameById[m.user_id] ?? 'Unnamed user'
	}));

	const myAssessment = assessments?.find((a: any) => a.user_id === locals.user!.id) ?? null;

	return {
		members,
		assessments: assessments ?? [],
		myAssessment,
		activeInvite: invites?.[0] ?? null
	};
};

export const actions: Actions = {
	createInvite: async ({ locals, params }) => {
		if (!locals.user) throw redirect(303, '/signin');
		if (!(await isMember(params.orgId, locals.user.id))) throw error(403, 'Not a member.');
		const { error: err } = await admin()
			.from('org_invites')
			.insert({ org_id: params.orgId, created_by: locals.user.id });
		if (err) return fail(400, { error: err.message });
		return { success: true };
	},
	revokeInvite: async ({ locals, params, request }) => {
		if (!locals.user) throw redirect(303, '/signin');
		if (!(await isMember(params.orgId, locals.user.id))) throw error(403, 'Not a member.');
		const form = await request.formData();
		const token = String(form.get('token') ?? '');
		const { error: err } = await admin()
			.from('org_invites')
			.update({ revoked_at: new Date().toISOString() })
			.eq('token', token)
			.eq('org_id', params.orgId);
		if (err) return fail(400, { error: err.message });
		return { success: true };
	},
	startAssessment: async ({ locals, params }) => {
		if (!locals.user) throw redirect(303, '/signin');
		if (!(await isMember(params.orgId, locals.user.id))) throw error(403, 'Not a member.');
		const sb = admin();
		const { data: existing } = await sb
			.from('assessments')
			.select('id')
			.eq('org_id', params.orgId)
			.eq('user_id', locals.user.id)
			.maybeSingle();
		if (existing) throw redirect(303, `/org/${params.orgId}/assessment`);
		const { error: err } = await sb.from('assessments').insert({
			org_id: params.orgId,
			user_id: locals.user.id,
			status: 'draft',
			scores: {},
			diagnostics: {}
		});
		if (err) return fail(400, { error: err.message });
		throw redirect(303, `/org/${params.orgId}/assessment`);
	}
};
