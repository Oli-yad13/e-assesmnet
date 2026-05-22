import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/dashboard';
	const oauthError = url.searchParams.get('error_description') ?? url.searchParams.get('error');

	if (oauthError) {
		throw redirect(303, `/signin?error=${encodeURIComponent(oauthError)}`);
	}

	if (!code) {
		throw redirect(303, '/signin?error=Missing+OAuth+code');
	}

	const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
	if (error) {
		throw redirect(303, `/signin?error=${encodeURIComponent(error.message)}`);
	}

	throw redirect(303, next);
};
