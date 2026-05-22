import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	if (!locals.user) {
		const next = encodeURIComponent(`/invite/${params.token}`);
		throw redirect(303, `/signup?next=${next}`);
	}

	const { data, error: rpcError } = await locals.supabase.rpc('redeem_invite', { p_token: params.token });
	if (rpcError) throw error(400, rpcError.message);

	throw redirect(303, `/org/${data}`);
};
