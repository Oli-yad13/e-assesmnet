import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

const adminEmails = (privateEnv.ADMIN_EMAILS ?? '')
	.split(',')
	.map((e) => e.trim().toLowerCase())
	.filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
	if (!email) return false;
	return adminEmails.includes(email.toLowerCase());
}

let _adminClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client authenticated with the service role key.
 * Bypasses RLS. NEVER expose this client to the browser.
 */
export function getAdminClient(): SupabaseClient {
	if (_adminClient) return _adminClient;
	const url = publicEnv.PUBLIC_SUPABASE_URL ?? '';
	const key = privateEnv.SUPABASE_SERVICE_ROLE_KEY ?? '';
	if (!url || !key) {
		throw new Error('Admin client not configured: set SUPABASE_SERVICE_ROLE_KEY (and PUBLIC_SUPABASE_URL).');
	}
	_adminClient = createClient(url, key, {
		auth: { persistSession: false, autoRefreshToken: false }
	});
	return _adminClient;
}
