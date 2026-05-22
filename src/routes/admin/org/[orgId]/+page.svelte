<script lang="ts">
	import { totalScore, zoneFor } from '$lib/assessment';
	let { data } = $props();

	const zone = $derived(zoneFor(Math.round(data.total)));

	const answerLabel = (a: string) =>
		a === 'yes' ? 'Yes' : a === 'partially' ? 'Partial' : a === 'no' ? 'No' : '—';
	const answerClass = (a: string) =>
		a === 'yes'
			? 'bg-emerald-100 text-emerald-700'
			: a === 'partially'
			? 'bg-amber-100 text-amber-700'
			: a === 'no'
			? 'bg-red-100 text-red-700'
			: 'bg-slate-100 text-slate-500';
</script>

<section class="max-w-6xl mx-auto px-6 py-10">
	<header class="mb-8 flex items-start justify-between gap-4">
		<div>
			<a href="/admin" class="text-sm text-slate-500 hover:text-slate-700">← All organisations</a>
			<h1 class="text-2xl font-semibold mt-2">{data.viewOrg.name}</h1>
			<p class="text-sm text-slate-600 mt-1">
				{data.members.length} member(s) ·
				{data.assessments.filter((a) => a.status === 'submitted').length} submitted ·
				Avg total <span class="font-semibold">{data.total.toFixed(1)} / 30</span>
				{#if zone}
					<span class="ml-2 text-xs font-medium px-2 py-0.5 rounded"
						class:bg-red-100={zone.code==='red'} class:text-red-700={zone.code==='red'}
						class:bg-amber-100={zone.code==='yellow'} class:text-amber-700={zone.code==='yellow'}
						class:bg-emerald-100={zone.code==='green'} class:text-emerald-700={zone.code==='green'}>
						{zone.label}
					</span>
				{/if}
			</p>
		</div>
		<a href={`/admin/export.csv?org=${data.viewOrg.id}`} class="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm font-medium">
			Download CSV
		</a>
	</header>

	<div class="rounded-lg border border-slate-200 bg-white p-6 mb-8">
		<h2 class="font-semibold mb-3">Score matrix</h2>
		<table class="w-full text-sm">
			<thead class="text-left text-xs uppercase tracking-wide text-slate-500">
				<tr>
					<th class="py-2 pr-4">Respondent</th>
					<th class="py-2 pr-4">Status</th>
					{#each data.dimensions as d (d.key)}
						<th class="py-2 px-2 text-center" title={d.title}>D{d.number}</th>
					{/each}
					<th class="py-2 pl-2 text-right">Total</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each data.assessments as a (a.id)}
					{@const t = totalScore(a.scores ?? {})}
					<tr>
						<td class="py-2 pr-4">
							<div class="font-medium text-slate-900">{a.full_name || a.email || a.user_id}</div>
							{#if a.email}<div class="text-xs text-slate-500">{a.email}</div>{/if}
						</td>
						<td class="py-2 pr-4 text-xs">
							{#if a.status === 'submitted'}
								<span class="text-emerald-700">Submitted</span>
							{:else}
								<span class="text-amber-700">Draft</span>
							{/if}
						</td>
						{#each data.dimensions as d (d.key)}
							<td class="py-2 px-2 text-center text-slate-700">{a.scores?.[d.key] ?? '—'}</td>
						{/each}
						<td class="py-2 pl-2 text-right font-medium">{t}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<h2 class="font-semibold mb-3">Full answers</h2>
	<div class="space-y-6">
		{#each data.assessments as a (a.id)}
			<details class="rounded-lg border border-slate-200 bg-white overflow-hidden" open={a.status === 'submitted'}>
				<summary class="px-6 py-4 cursor-pointer flex items-center justify-between hover:bg-slate-50">
					<div>
						<div class="font-medium text-slate-900">{a.full_name || a.email || a.user_id}</div>
						<div class="text-xs text-slate-500">{a.email} · {a.status} · Total {totalScore(a.scores ?? {})}/30</div>
					</div>
				</summary>
				<div class="border-t border-slate-100 px-6 py-4 space-y-5">
					{#each data.dimensions as d (d.key)}
						{@const score = a.scores?.[d.key]}
						{@const diag = a.diagnostics?.[d.key] ?? []}
						<div>
							<div class="flex items-baseline gap-2 mb-2">
								<span class="text-xs font-mono text-slate-400">D{d.number}</span>
								<h3 class="font-medium text-slate-900">{d.title}</h3>
								<span class="ml-auto text-sm">
									Score: <span class="font-semibold">{score ?? '—'} / 5</span>
								</span>
							</div>
							<ol class="space-y-1.5">
								{#each d.diagnostics as q, qi}
									<li class="grid grid-cols-[1fr_auto] gap-3 items-center text-sm">
										<span class="text-slate-700"><span class="text-slate-400 mr-1">{qi + 1}.</span>{q}</span>
										<span class="text-xs font-medium px-2 py-0.5 rounded {answerClass(diag[qi])}">{answerLabel(diag[qi])}</span>
									</li>
								{/each}
							</ol>
						</div>
					{/each}
					{#if a.notes}
						<div class="pt-3 border-t border-slate-100">
							<div class="text-xs uppercase tracking-wide text-slate-500 mb-1">Notes</div>
							<p class="text-sm text-slate-700 whitespace-pre-wrap">{a.notes}</p>
						</div>
					{/if}
				</div>
			</details>
		{/each}
	</div>
</section>
