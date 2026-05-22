<script lang="ts">
	import { enhance } from '$app/forms';
	import { DIMENSIONS, totalScore, zoneFor, type DiagnosticAnswer } from '$lib/assessment';

	let { data, form } = $props();

	const locked = $derived(data.assessment.status === 'submitted');

	// reactive working copy of scores/diagnostics, so totals update live
	let scores = $state<Record<string, number | ''>>(
		Object.fromEntries(DIMENSIONS.map((d) => [d.key, data.assessment.scores?.[d.key] ?? ''])) as any
	);
	let diagnostics = $state<Record<string, DiagnosticAnswer[]>>(
		Object.fromEntries(
			DIMENSIONS.map((d) => [
				d.key,
				(data.assessment.diagnostics?.[d.key] ?? Array(d.diagnostics.length).fill('')) as DiagnosticAnswer[]
			])
		)
	);

	const liveTotal = $derived(
		Object.values(scores).reduce<number>((sum, v) => sum + (typeof v === 'number' ? v : 0), 0)
	);
	const liveZone = $derived(zoneFor(liveTotal));
</script>

<section class="max-w-4xl mx-auto px-6 py-10">
	<header class="mb-8">
		<a href={`/org/${data.org.id}`} class="text-sm text-slate-500 hover:text-slate-700">← {data.org.name}</a>
		<h1 class="text-2xl font-semibold mt-2">Your E-CIRA assessment</h1>
		<p class="text-sm text-slate-600 mt-1">
			For each dimension: pick the level that best describes your organisation <em>today</em>, then answer the 5 diagnostic questions. Use the evidence as a reality check — can you produce that artefact today?
		</p>
	</header>

	{#if locked}
		<div class="mb-6 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">
			Your assessment was submitted on {new Date(data.assessment.submitted_at).toLocaleString()}. It's read-only.
		</div>
	{/if}

	<div class="sticky top-0 z-10 bg-slate-50/90 backdrop-blur -mx-6 px-6 py-3 border-b border-slate-200 mb-6">
		<div class="flex items-center justify-between text-sm">
			<div>
				<span class="text-slate-500">Running total:</span>
				<span class="font-semibold">{liveTotal} / 30</span>
				<span class="ml-2" class:text-red-600={liveZone.code==='red'} class:text-amber-600={liveZone.code==='yellow'} class:text-emerald-600={liveZone.code==='green'}>
					{liveZone.label}
				</span>
			</div>
			<div class="text-slate-500">Status: {data.assessment.status}</div>
		</div>
	</div>

	<form method="POST" use:enhance class="space-y-8">
		{#each DIMENSIONS as d, i (d.key)}
			<section class="rounded-lg border border-slate-200 bg-white">
				<header class="px-6 py-4 border-b border-slate-100">
					<div class="flex items-baseline gap-2">
						<span class="text-xs font-mono text-slate-400">D{d.number}</span>
						<h2 class="text-lg font-semibold">{d.title}</h2>
					</div>
					<p class="text-sm text-slate-600 mt-1">{d.summary}</p>
				</header>

				<div class="px-6 py-5">
					<div class="text-xs uppercase tracking-wide text-slate-500 mb-2">Maturity level</div>
					<div class="space-y-2 mb-5">
						{#each d.levels as lv (lv.level)}
							<label class="flex gap-3 rounded-md border border-slate-200 p-3 cursor-pointer hover:border-brand-500 has-checked:border-brand-500 has-checked:bg-brand-50/60" class:opacity-60={locked}>
								<input type="radio" name={`score:${d.key}`} value={lv.level}
									bind:group={scores[d.key]} disabled={locked}
									class="mt-1 accent-brand-600" />
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<span class="font-mono text-xs text-slate-500">L{lv.level}</span>
										<span class="font-medium text-slate-900">{lv.label}</span>
									</div>
									<p class="text-sm text-slate-700 mt-0.5">{lv.description}</p>
									<p class="text-xs text-slate-500 mt-1"><span class="font-medium">Evidence:</span> {lv.evidence}</p>
								</div>
							</label>
						{/each}
					</div>

					<div class="text-xs uppercase tracking-wide text-slate-500 mb-2">Diagnostic questions</div>
					<ol class="space-y-3">
						{#each d.diagnostics as q, qi}
							<li class="grid md:grid-cols-[1fr_auto] gap-3 items-center">
								<div class="text-sm text-slate-800">
									<span class="text-slate-400 mr-1">{qi + 1}.</span>{q}
								</div>
								<div class="flex gap-1">
									{#each ['yes', 'partially', 'no'] as ans}
										<label class="px-3 py-1.5 rounded-md border text-xs font-medium cursor-pointer select-none border-slate-200 hover:border-brand-500 has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:text-brand-700" class:opacity-60={locked}>
											<input type="radio" name={`diag:${d.key}:${qi}`} value={ans}
												bind:group={diagnostics[d.key][qi]} disabled={locked}
												class="sr-only" />
											{ans === 'yes' ? 'Yes' : ans === 'partially' ? 'Partial' : 'No'}
										</label>
									{/each}
								</div>
							</li>
						{/each}
					</ol>
				</div>
			</section>
		{/each}

		<section class="rounded-lg border border-slate-200 bg-white p-6">
			<label for="notes" class="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
			<textarea id="notes" name="notes" rows="4" disabled={locked} value={data.assessment.notes ?? ''}
				class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"></textarea>
		</section>

		{#if form?.error}
			<div class="rounded-md border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">{form.error}</div>
		{:else if form?.saved}
			<div class="rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">Draft saved.</div>
		{/if}

		{#if !locked}
			<div class="flex items-center justify-between gap-2 pt-2">
				<button formaction="?/save" class="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm font-medium">
					Save draft
				</button>
				<button formaction="?/submit" class="px-5 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
					Submit assessment
				</button>
			</div>
			<p class="text-xs text-slate-500">Once submitted, your answers are locked. Make sure all 6 dimensions and 30 diagnostic questions are answered.</p>
		{/if}
	</form>
</section>
