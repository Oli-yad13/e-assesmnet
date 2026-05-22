import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { admin, isMember } from '$lib/server/userdb';
import { DIMENSIONS, type DiagnosticAnswer, type DiagnosticsByDim, type ScoresByDim } from '$lib/assessment';

const ALLOWED_ANSWERS: DiagnosticAnswer[] = ['yes', 'partially', 'no'];

function parsePayload(form: FormData): { scores: ScoresByDim; diagnostics: DiagnosticsByDim; notes: string } {
	const scores: ScoresByDim = {};
	const diagnostics: DiagnosticsByDim = {};

	for (const d of DIMENSIONS) {
		const raw = form.get(`score:${d.key}`);
		if (raw !== null && raw !== '') {
			const n = Number(raw);
			if (n >= 1 && n <= 5) scores[d.key] = n;
		}
		const arr: DiagnosticAnswer[] = [];
		for (let i = 0; i < d.diagnostics.length; i++) {
			const a = form.get(`diag:${d.key}:${i}`);
			if (typeof a === 'string' && (ALLOWED_ANSWERS as string[]).includes(a)) {
				arr.push(a as DiagnosticAnswer);
			} else {
				arr.push('' as unknown as DiagnosticAnswer);
			}
		}
		diagnostics[d.key] = arr;
	}

	const notes = String(form.get('notes') ?? '').slice(0, 4000);
	return { scores, diagnostics, notes };
}

function isComplete(scores: ScoresByDim, diagnostics: DiagnosticsByDim): boolean {
	for (const d of DIMENSIONS) {
		const s = scores[d.key];
		if (!s || s < 1 || s > 5) return false;
		const arr = diagnostics[d.key] ?? [];
		if (arr.length !== d.diagnostics.length) return false;
		if (arr.some((a) => !ALLOWED_ANSWERS.includes(a))) return false;
	}
	return true;
}

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) throw redirect(303, '/signin');
	if (!(await isMember(params.orgId, locals.user.id))) throw error(404, 'Not a member.');

	const sb = admin();
	const { data: assessment, error: aErr } = await sb
		.from('assessments')
		.select('*')
		.eq('org_id', params.orgId)
		.eq('user_id', locals.user.id)
		.maybeSingle();

	if (aErr) throw error(500, aErr.message);

	if (!assessment) {
		const { data: created, error: cErr } = await sb
			.from('assessments')
			.insert({ org_id: params.orgId, user_id: locals.user.id, status: 'draft', scores: {}, diagnostics: {} })
			.select('*')
			.single();
		if (cErr) throw error(500, cErr.message);
		return { assessment: created };
	}

	return { assessment };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		if (!locals.user) throw redirect(303, '/signin');
		if (!(await isMember(params.orgId, locals.user.id))) throw error(403, 'Not a member.');
		const { scores, diagnostics, notes } = parsePayload(await request.formData());
		const { error: err } = await admin()
			.from('assessments')
			.update({ scores, diagnostics, notes })
			.eq('org_id', params.orgId)
			.eq('user_id', locals.user.id)
			.eq('status', 'draft');
		if (err) return fail(400, { error: err.message });
		return { saved: true };
	},
	submit: async ({ request, locals, params }) => {
		if (!locals.user) throw redirect(303, '/signin');
		if (!(await isMember(params.orgId, locals.user.id))) throw error(403, 'Not a member.');
		const { scores, diagnostics, notes } = parsePayload(await request.formData());
		if (!isComplete(scores, diagnostics)) {
			return fail(400, { error: 'All dimensions need a score and all diagnostic questions need an answer before you can submit.' });
		}
		const { error: err } = await admin()
			.from('assessments')
			.update({ scores, diagnostics, notes, status: 'submitted', submitted_at: new Date().toISOString() })
			.eq('org_id', params.orgId)
			.eq('user_id', locals.user.id)
			.eq('status', 'draft');
		if (err) return fail(400, { error: err.message });
		throw redirect(303, `/org/${params.orgId}/results`);
	}
};
