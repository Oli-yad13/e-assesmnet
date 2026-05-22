import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	const next = url.searchParams.get('next') ?? '/dashboard';
	const callback = `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`;

	const { data, error: oauthError } = await locals.supabase.auth.signInWithOAuth({
		provider: 'google',
		options: { redirectTo: callback }
	});

	if (oauthError || !data?.url) {
		throw error(500, oauthError?.message ?? 'Could not start Google sign-in.');
	}

	throw redirect(303, data.url);
};
