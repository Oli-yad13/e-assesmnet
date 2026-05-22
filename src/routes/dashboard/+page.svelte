<script lang="ts">
	let { data, form } = $props();
</script>

<section class="max-w-4xl mx-auto px-6 py-10">
	<header class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-2xl font-semibold">Your organisations</h1>
			<p class="text-sm text-slate-600 mt-1">Create one per SOE, invite 2–3 senior leaders, then complete the assessment.</p>
		</div>
	</header>

	{#if data.orgs.length === 0}
		<div class="rounded-lg border border-dashed border-slate-300 p-8 text-center bg-white">
			<p class="text-slate-600 mb-4">You're not part of any organisation yet.</p>
		</div>
	{:else}
		<ul class="space-y-2 mb-10">
			{#each data.orgs as org (org.id)}
				<li>
					<a href={`/org/${org.id}`} class="block rounded-md border border-slate-200 bg-white px-4 py-3 hover:border-brand-500 hover:bg-brand-50/40 transition">
						<div class="flex items-center justify-between">
							<div>
								<div class="font-medium text-slate-900">{org.name}</div>
								<div class="text-xs text-slate-500">Role: {org.role}</div>
							</div>
							<span class="text-slate-400">→</span>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="rounded-lg border border-slate-200 bg-white p-6">
		<h2 class="font-semibold text-slate-900 mb-3">Create an organisation</h2>
		<form method="POST" action="?/create" class="flex gap-2">
			<input name="name" type="text" required placeholder="e.g. Ethiopian Electric Power"
				class="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
			<button class="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
				Create
			</button>
		</form>
		{#if form?.error}
			<p class="mt-2 text-sm text-red-600">{form.error}</p>
		{/if}
	</div>
</section>
