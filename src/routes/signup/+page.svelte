<script lang="ts">
	let { form, data } = $props();
	const googleHref = $derived(`/auth/google?next=${encodeURIComponent(data.next)}`);
</script>

<section class="max-w-md mx-auto px-6 py-12">
	<h1 class="text-2xl font-semibold mb-1">Create an account</h1>
	<p class="text-sm text-slate-600 mb-6">Used by leaders across your SOE to complete the E-CIRA.</p>

	<div class="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
		<a href={googleHref}
			class="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50 text-sm font-medium text-slate-700">
			<svg viewBox="0 0 24 24" class="w-4 h-4" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.93c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.09-1.93 3.21-4.77 3.21-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.85 0-5.27-1.92-6.13-4.5H2.18v2.83C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.87 14.15a6.6 6.6 0 010-4.3V7.02H2.18a11 11 0 000 9.96l3.69-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.02l3.69 2.83C6.73 7.3 9.15 5.38 12 5.38z"/></svg>
			Continue with Google
		</a>

		<div class="flex items-center gap-3 text-xs text-slate-400">
			<div class="flex-1 h-px bg-slate-200"></div>
			<span>or</span>
			<div class="flex-1 h-px bg-slate-200"></div>
		</div>

		<form method="POST" class="space-y-4">
		<div>
			<label for="full_name" class="block text-sm font-medium text-slate-700 mb-1">Full name</label>
			<input id="full_name" name="full_name" type="text" required
				class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
		</div>
		<div>
			<label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
			<input id="email" name="email" type="email" required value={form?.email ?? ''}
				class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
		</div>
		<div>
			<label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
			<input id="password" name="password" type="password" minlength="8" required
				class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
			<p class="text-xs text-slate-500 mt-1">Minimum 8 characters.</p>
		</div>

		{#if form?.error || data.error}
			<p class="text-sm text-red-600">{form?.error ?? data.error}</p>
		{/if}

		<button class="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-md px-3 py-2 text-sm font-medium">
			Create account
		</button>
		<p class="text-sm text-slate-600 text-center">
			Already have an account? <a href="/signin" class="text-brand-600 hover:underline">Sign in</a>
		</p>
		</form>
	</div>
</section>
