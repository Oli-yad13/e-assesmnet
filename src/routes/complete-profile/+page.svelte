<script lang="ts">
	let { data, form } = $props();
</script>

<section class="max-w-md mx-auto px-6 py-12">
	<h1 class="text-2xl font-semibold mb-1">One last thing</h1>
	<p class="text-sm text-slate-600 mb-6">Tell us your name so colleagues know who's behind your responses.</p>

	<form method="POST" class="space-y-4 bg-white border border-slate-200 rounded-lg p-6">
		<div>
			<label for="full_name" class="block text-sm font-medium text-slate-700 mb-1">Full name</label>
			<input id="full_name" name="full_name" type="text" required value={data.suggested ?? ''}
				class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
		</div>

		{#if form?.error}
			<p class="text-sm text-red-600">{form.error}</p>
		{/if}

		<button class="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-md px-3 py-2 text-sm font-medium">
			Continue
		</button>
	</form>
</section>
