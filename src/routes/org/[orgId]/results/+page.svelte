<script lang="ts">
	import { ZONES, zoneFor, LEVEL_LABELS } from '$lib/assessment';
	let { data } = $props();

	const zone = $derived(zoneFor(Math.round(data.total)));
</script>

<section class="max-w-5xl mx-auto px-6 py-10">
	<header class="mb-8 flex items-start justify-between gap-4">
		<div>
			<a href={`/org/${data.org.id}`} class="text-sm text-slate-500 hover:text-slate-700">← {data.org.name}</a>
			<h1 class="text-2xl font-semibold mt-2">Team results</h1>
			<p class="text-sm text-slate-600 mt-1">Averages across {data.submitted.length} submitted assessment(s).</p>
		</div>
		<a href={`/org/${data.org.id}/export.csv`} class="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm font-medium">Download CSV</a>
	</header>

	{#if data.submitted.length === 0}
		<div class="rounded-lg border border-dashed border-slate-300 p-8 text-center bg-white">
			<p class="text-slate-600">No submitted assessments yet. Once team members submit, their averaged scores will show here.</p>
		</div>
	{:else}
		<div class="rounded-lg border-2 p-6 mb-8" class:border-red-300={zone.code==='red'} class:bg-red-50={zone.code==='red'} class:border-amber-300={zone.code==='yellow'} class:bg-amber-50={zone.code==='yellow'} class:border-emerald-300={zone.code==='green'} class:bg-emerald-50={zone.code==='green'}>
			<div class="flex items-baseline justify-between mb-2">
				<div>
					<div class="text-sm font-medium" class:text-red-700={zone.code==='red'} class:text-amber-700={zone.code==='yellow'} class:text-emerald-700={zone.code==='green'}>{zone.label}</div>
					<div class="text-3xl font-semibold mt-1">{data.total.toFixed(1)} <span class="text-base text-slate-500 font-normal">/ 30</span></div>
				</div>
				<div class="text-xs uppercase tracking-wide text-slate-500">{zone.min}–{zone.max} range</div>
			</div>
			<p class="text-sm text-slate-700 mt-3">{zone.pathway}</p>
		</div>

		<div class="rounded-lg border border-slate-200 bg-white p-6 mb-8">
			<h2 class="font-semibold mb-4">Average per dimension</h2>
			<ul class="space-y-3">
				{#each data.dimensions as d (d.key)}
					{@const v = data.perDimension[d.key] ?? 0}
					<li>
						<div class="flex items-baseline justify-between text-sm mb-1">
							<span><span class="font-mono text-xs text-slate-400 mr-1">D{d.number}</span>{d.title}</span>
							<span class="font-medium">{v.toFixed(2)} / 5</span>
						</div>
						<div class="h-2 rounded bg-slate-100 overflow-hidden">
							<div class="h-full bg-brand-600" style="width: {(v / 5) * 100}%"></div>
						</div>
					</li>
				{/each}
			</ul>
		</div>

		<div class="rounded-lg border border-slate-200 bg-white p-6">
			<h2 class="font-semibold mb-3">Per respondent</h2>
			<table class="w-full text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-500">
					<tr>
						<th class="py-2 pr-4">Respondent</th>
						{#each data.dimensions as d (d.key)}
							<th class="py-2 px-2 text-center" title={d.title}>D{d.number}</th>
						{/each}
						<th class="py-2 pl-2 text-right">Total</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.submitted as a (a.id)}
						{@const t = data.dimensions.reduce((s, d) => s + (a.scores?.[d.key] ?? 0), 0)}
						<tr>
							<td class="py-2 pr-4">{a.full_name}</td>
							{#each data.dimensions as d (d.key)}
								<td class="py-2 px-2 text-center text-slate-700">{a.scores?.[d.key] ?? '—'}</td>
							{/each}
							<td class="py-2 pl-2 text-right font-medium">{t}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
