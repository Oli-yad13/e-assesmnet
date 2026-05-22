import type { PageServerLoad } from './$types';
import { getAdminClient } from '$lib/server/admin';
import { DIMENSIONS, totalScore, zoneFor } from '$lib/assessment';

export const load: PageServerLoad = async () => {
	const admin = getAdminClient();

	const [{ data: orgs }, { data: members }, { data: assessments }, { data: users }] = await Promise.all([
		admin.from('orgs').select('id, name, created_at').order('created_at', { ascending: false }),
		admin.from('org_members').select('org_id, user_id'),
		admin.from('assessments').select('id, org_id, user_id, status, scores, submitted_at'),
		admin.auth.admin.listUsers({ perPage: 1000 })
	]);

	const userById: Record<string, { email: string }> = {};
	for (const u of users?.users ?? []) {
		userById[u.id] = { email: u.email ?? '' };
	}

	const memberCountByOrg: Record<string, number> = {};
	for (const m of members ?? []) {
		memberCountByOrg[m.org_id] = (memberCountByOrg[m.org_id] ?? 0) + 1;
	}

	const orgRows = (orgs ?? []).map((o: any) => {
		const orgAssessments = (assessments ?? []).filter((a: any) => a.org_id === o.id);
		const submitted = orgAssessments.filter((a: any) => a.status === 'submitted');
		const totals = submitted.map((a: any) => totalScore(a.scores ?? {}));
		const avg = totals.length ? totals.reduce((s, n) => s + n, 0) / totals.length : 0;
		return {
			id: o.id,
			name: o.name,
			created_at: o.created_at,
			memberCount: memberCountByOrg[o.id] ?? 0,
			submittedCount: submitted.length,
			draftCount: orgAssessments.length - submitted.length,
			avgTotal: avg,
			zone: submitted.length ? zoneFor(Math.round(avg)) : null
		};
	});

	return {
		orgs: orgRows,
		userCount: Object.keys(userById).length,
		dimensions: DIMENSIONS.map((d) => ({ key: d.key, number: d.number, title: d.title }))
	};
};
