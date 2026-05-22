import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { admin, isMember } from '$lib/server/userdb';
import { averageScores, DIMENSIONS, type AssessmentPayload } from '$lib/assessment';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) throw redirect(303, '/signin');
	if (!(await isMember(params.orgId, locals.user.id))) throw error(404, 'Not a member.');

	const sb = admin();
	const { data: assessments } = await sb
		.from('assessments')
		.select('id, user_id, status, scores, diagnostics, submitted_at')
		.eq('org_id', params.orgId)
		.eq('status', 'submitted');

	const submitted = (assessments ?? []) as any[];

	const userIds = [...new Set(submitted.map((a) => a.user_id))];
	const { data: profiles } = userIds.length
		? await sb.from('profiles').select('id, full_name').in('id', userIds)
		: { data: [] as { id: string; full_name: string | null }[] };

	const nameById: Record<string, string> = {};
	for (const p of profiles ?? []) nameById[p.id] = p.full_name ?? 'Unnamed';

	const withNames = submitted.map((a) => ({ ...a, full_name: nameById[a.user_id] ?? 'Unnamed' }));

	const payloads: AssessmentPayload[] = submitted.map((a) => ({
		scores: a.scores ?? {},
		diagnostics: a.diagnostics ?? {}
	}));
	const { per, total } = averageScores(payloads);

	return {
		submitted: withNames,
		perDimension: per,
		total,
		dimensions: DIMENSIONS.map((d) => ({ key: d.key, number: d.number, title: d.title }))
	};
};
