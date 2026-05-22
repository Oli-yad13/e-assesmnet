import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAdminClient, isAdminEmail } from '$lib/server/admin';
import { DIMENSIONS, totalScore, zoneFor } from '$lib/assessment';

function esc(v: unknown): string {
	const s = v == null ? '' : String(v);
	if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
	return s;
}

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!isAdminEmail(locals.user?.email)) throw error(403, 'Admin only');

	const admin = getAdminClient();
	const orgFilter = url.searchParams.get('org');

	const orgsQ = admin.from('orgs').select('id, name');
	const assessmentsQ = admin
		.from('assessments')
		.select('id, org_id, user_id, status, scores, diagnostics, submitted_at, updated_at, notes');

	const [{ data: orgs }, { data: assessments }, { data: users }] = await Promise.all([
		orgFilter ? orgsQ.eq('id', orgFilter) : orgsQ,
		orgFilter ? assessmentsQ.eq('org_id', orgFilter) : assessmentsQ,
		admin.auth.admin.listUsers({ perPage: 1000 })
	]);

	const orgNameById: Record<string, string> = {};
	for (const o of orgs ?? []) orgNameById[o.id] = o.name;

	const emailById: Record<string, string> = {};
	for (const u of users?.users ?? []) emailById[u.id] = u.email ?? '';

	const profileIds = [...new Set((assessments ?? []).map((a: any) => a.user_id))];
	const { data: profiles } = profileIds.length
		? await admin.from('profiles').select('id, full_name').in('id', profileIds)
		: { data: [] as { id: string; full_name: string | null }[] };
	const nameById: Record<string, string> = {};
	for (const p of profiles ?? []) nameById[p.id] = p.full_name ?? '';

	const headers = [
		'org',
		'respondent',
		'email',
		'status',
		'submitted_at',
		...DIMENSIONS.flatMap((d) => [`D${d.number}_score`, ...d.diagnostics.map((_, i) => `D${d.number}_q${i + 1}`)]),
		'total',
		'zone',
		'notes'
	];

	const lines: string[] = [headers.join(',')];

	for (const r of assessments ?? []) {
		const scores = (r.scores ?? {}) as Record<string, number>;
		const diags = (r.diagnostics ?? {}) as Record<string, string[]>;
		const total = totalScore(scores);
		const zone = zoneFor(total);
		const cells: string[] = [
			esc(orgNameById[r.org_id] ?? r.org_id),
			esc(nameById[r.user_id] ?? ''),
			esc(emailById[r.user_id] ?? ''),
			esc(r.status),
			esc(r.submitted_at ?? ''),
			...DIMENSIONS.flatMap((d) => {
				const s = scores[d.key] ?? '';
				const ds = diags[d.key] ?? [];
				const padded = Array.from({ length: d.diagnostics.length }, (_, i) => ds[i] ?? '');
				return [esc(s), ...padded.map(esc)];
			}),
			esc(total),
			esc(zone.label),
			esc(r.notes ?? '')
		];
		lines.push(cells.join(','));
	}

	const csv = lines.join('\n');
	const stamp = new Date().toISOString().slice(0, 10);
	const filename = orgFilter
		? `ecira_${(orgNameById[orgFilter] ?? 'org').replace(/\W+/g, '_')}_${stamp}.csv`
		: `ecira_all_orgs_${stamp}.csv`;

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
