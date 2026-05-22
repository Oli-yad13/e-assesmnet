import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAdminClient } from '$lib/server/admin';
import { DIMENSIONS, averageScores, type AssessmentPayload } from '$lib/assessment';

export const load: PageServerLoad = async ({ params }) => {
	const admin = getAdminClient();

	const { data: org } = await admin
		.from('orgs')
		.select('id, name, created_at, created_by')
		.eq('id', params.orgId)
		.maybeSingle();
	if (!org) throw error(404, 'Org not found');

	const { data: members } = await admin
		.from('org_members')
		.select('user_id, role, joined_at')
		.eq('org_id', params.orgId);

	const { data: assessments } = await admin
		.from('assessments')
		.select('id, user_id, status, scores, diagnostics, notes, submitted_at, updated_at')
		.eq('org_id', params.orgId)
		.order('updated_at', { ascending: false });

	const allUserIds = new Set<string>([
		...(members ?? []).map((m: any) => m.user_id),
		...(assessments ?? []).map((a: any) => a.user_id)
	]);

	const userLookup: Record<string, { email: string; full_name: string }> = {};
	if (allUserIds.size > 0) {
		const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
		const { data: profiles } = await admin
			.from('profiles')
			.select('id, full_name')
			.in('id', Array.from(allUserIds));
		const nameById: Record<string, string> = {};
		for (const p of profiles ?? []) nameById[p.id] = p.full_name ?? '';
		for (const u of users?.users ?? []) {
			if (allUserIds.has(u.id)) {
				userLookup[u.id] = { email: u.email ?? '', full_name: nameById[u.id] ?? '' };
			}
		}
	}

	const submitted = (assessments ?? []).filter((a: any) => a.status === 'submitted');
	const payloads: AssessmentPayload[] = submitted.map((a: any) => ({
		scores: a.scores ?? {},
		diagnostics: a.diagnostics ?? {}
	}));
	const { per, total } = averageScores(payloads);

	return {
		viewOrg: org,
		members: (members ?? []).map((m: any) => ({
			...m,
			email: userLookup[m.user_id]?.email ?? '',
			full_name: userLookup[m.user_id]?.full_name ?? ''
		})),
		assessments: (assessments ?? []).map((a: any) => ({
			...a,
			email: userLookup[a.user_id]?.email ?? '',
			full_name: userLookup[a.user_id]?.full_name ?? ''
		})),
		perDimension: per,
		total,
		dimensions: DIMENSIONS
	};
};
