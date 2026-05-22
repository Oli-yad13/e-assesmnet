import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { admin } from '$lib/server/userdb';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const next = encodeURIComponent('/complete-profile' + url.search);
		throw redirect(303, `/signin?next=${next}`);
	}

	const { data: profile } = await admin()
		.from('profiles')
		.select('full_name')
		.eq('id', locals.user.id)
		.maybeSingle();

	const next = url.searchParams.get('next') ?? '/dashboard';
	const current = profile?.full_name?.trim() ?? '';

	if (current) throw redirect(303, next);

	const suggested =
		(locals.user.user_metadata?.full_name as string | undefined) ??
		(locals.user.user_metadata?.name as string | undefined) ??
		'';

	return { suggested, next };
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		if (!locals.user) throw redirect(303, '/signin');
		const form = await request.formData();
		const fullName = String(form.get('full_name') ?? '').trim();
		if (!fullName) return fail(400, { error: 'Please enter your name.' });

		const { error } = await admin()
			.from('profiles')
			.upsert(
				{ id: locals.user.id, full_name: fullName },
				{ onConflict: 'id' }
			);
		if (error) return fail(400, { error: error.message });

		const next = url.searchParams.get('next') ?? '/dashboard';
		throw redirect(303, next);
	}
};
