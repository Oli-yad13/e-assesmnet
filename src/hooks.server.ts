import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

const PROTECTED = ['/dashboard', '/org'];

const SUPABASE_URL = env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = env.PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.warn('[E-CIRA] Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY env vars.');
}

export const handle: Handle = async ({ event, resolve }) => {
	const cookies: CookieMethodsServer = {
		getAll: () => event.cookies.getAll(),
		setAll: (toSet) => {
			toSet.forEach(({ name, value, options }) => {
				event.cookies.set(name, value, { ...options, path: '/' });
			});
		}
	};

	event.locals.supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, { cookies });

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) return { session: null, user: null };

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) return { session: null, user: null };

		return { session, user };
	};

	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	if (!user && PROTECTED.some((p) => event.url.pathname.startsWith(p))) {
		const next = encodeURIComponent(event.url.pathname + event.url.search);
		throw redirect(303, `/signin?next=${next}`);
	}

	return resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version'
	});
};
