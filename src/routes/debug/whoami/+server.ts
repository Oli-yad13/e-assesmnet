import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, cookies, url }) => {
	const { data: getUserResult } = await locals.supabase.auth.getUser();
	const { data: getSessionResult } = await locals.supabase.auth.getSession();
	const cookieNames = cookies.getAll().map((c) => c.name);

	// Try a quick query that should succeed for any authed user (returns nothing if RLS isn't authed).
	const { data: rls, error: rlsError } = await locals.supabase
		.from('orgs')
		.select('id', { count: 'exact', head: true });

	return new Response(
		JSON.stringify(
			{
				host: url.host,
				localsUser: locals.user ? { id: locals.user.id, email: locals.user.email } : null,
				getUser: getUserResult.user
					? { id: getUserResult.user.id, email: getUserResult.user.email }
					: null,
				hasSession: !!getSessionResult.session,
				accessTokenPrefix: getSessionResult.session?.access_token?.slice(0, 20) ?? null,
				supabaseCookies: cookieNames.filter((n) => n.startsWith('sb-')),
				cookieCount: cookieNames.length,
				rlsProbe: { ok: !rlsError, error: rlsError?.message ?? null }
			},
			null,
			2
		),
		{ headers: { 'Content-Type': 'application/json' } }
	);
};
