import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { admin } from '$lib/server/userdb';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		const next = encodeURIComponent(`/invite/${params.token}`);
		throw redirect(303, `/signup?next=${next}`);
	}

	const sb = admin();
	const { data: invite } = await sb
		.from('org_invites')
		.select('org_id, revoked_at')
		.eq('token', params.token)
		.maybeSingle();

	if (!invite) throw error(404, 'Invite not found.');
	if (invite.revoked_at) throw error(410, 'Invite was revoked.');

	const { error: addErr } = await sb
		.from('org_members')
		.upsert(
			{ org_id: invite.org_id, user_id: locals.user.id, role: 'member' },
			{ onConflict: 'org_id,user_id', ignoreDuplicates: true }
		);
	if (addErr) throw error(500, addErr.message);

	throw redirect(303, `/org/${invite.org_id}`);
};
