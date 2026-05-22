import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { admin, isMember } from '$lib/server/userdb';
import { DIMENSIONS, averageScores, zoneFor, type AssessmentPayload } from '$lib/assessment';

function esc(v: unknown): string {
	const s = v == null ? '' : String(v);
	if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
	return s;
}

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) throw redirect(303, '/signin');
	if (!(await isMember(params.orgId, locals.user.id))) throw error(404, 'Not a member.');

	const sb = admin();
	const { data: org } = await sb.from('orgs').select('name').eq('id', params.orgId).maybeSingle();
	if (!org) throw error(404, 'Not found');

	const { data: rows } = await sb
		.from('assessments')
		.select('id, user_id, status, scores, diagnostics, submitted_at, updated_at, notes')
		.eq('org_id', params.orgId);

	const submitted = (rows ?? []).filter((r: any) => r.status === 'submitted');

	const userIds = [...new Set((rows ?? []).map((r: any) => r.user_id))];
	const { data: profiles } = userIds.length
		? await sb.from('profiles').select('id, full_name').in('id', userIds)
		: { data: [] as { id: string; full_name: string | null }[] };
	const nameById: Record<string, string> = {};
	for (const p of profiles ?? []) nameById[p.id] = p.full_name ?? '';

	const headers = [
		'respondent',
		'status',
		'submitted_at',
		...DIMENSIONS.flatMap((d) => [`D${d.number}_score`, ...d.diagnostics.map((_, i) => `D${d.number}_q${i + 1}`)]),
		'total',
		'zone',
		'notes'
	];

	const lines: string[] = [headers.join(',')];

	for (const r of rows ?? []) {
		const scores = (r.scores ?? {}) as Record<string, number>;
		const diags = (r.diagnostics ?? {}) as Record<string, string[]>;
		const total = DIMENSIONS.reduce((s, d) => s + (Number(scores[d.key]) || 0), 0);
		const zone = zoneFor(total);
		const cells: string[] = [
			esc(nameById[r.user_id] ?? r.user_id),
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

	const payloads: AssessmentPayload[] = submitted.map((a: any) => ({
		scores: a.scores ?? {},
		diagnostics: a.diagnostics ?? {}
	}));
	const { per, total: avgTotal } = averageScores(payloads);
	const avgZone = zoneFor(Math.round(avgTotal));
	const avgRow: string[] = [
		esc(`AVERAGE (${submitted.length} submitted)`),
		'',
		'',
		...DIMENSIONS.flatMap((d) => [esc((per[d.key] ?? 0).toFixed(2)), ...d.diagnostics.map(() => '')]),
		esc(avgTotal.toFixed(2)),
		esc(avgZone.label),
		''
	];
	lines.push(avgRow.join(','));

	const csv = lines.join('\n');
	const filename = `ecira_${org.name.replace(/\W+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
