<script lang="ts">
	let { form } = $props();
</script>

<section class="max-w-md mx-auto px-6 py-12">
	<h1 class="text-2xl font-semibold mb-1">Create an account</h1>
	<p class="text-sm text-slate-600 mb-6">Used by leaders across your SOE to complete the E-CIRA.</p>

	<form method="POST" class="space-y-4 bg-white border border-slate-200 rounded-lg p-6">
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

		{#if form?.error}
			<p class="text-sm text-red-600">{form.error}</p>
		{/if}

		<button class="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-md px-3 py-2 text-sm font-medium">
			Create account
		</button>
		<p class="text-sm text-slate-600 text-center">
			Already have an account? <a href="/signin" class="text-brand-600 hover:underline">Sign in</a>
		</p>
	</form>
</section>
