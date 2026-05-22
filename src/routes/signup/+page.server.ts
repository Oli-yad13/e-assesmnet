import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(303, '/dashboard');
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const fullName = String(form.get('full_name') ?? '').trim();

		if (!email || !password) return fail(400, { error: 'Email and password are required.', email });
		if (password.length < 8) return fail(400, { error: 'Password must be at least 8 characters.', email });

		const { error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: { data: { full_name: fullName } }
		});
		if (error) return fail(400, { error: error.message, email });

		const next = url.searchParams.get('next') ?? '/dashboard';
		throw redirect(303, next);
	}
};
