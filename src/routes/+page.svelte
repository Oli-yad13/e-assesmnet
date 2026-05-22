<script lang="ts">
	import { DIMENSIONS, ZONES } from '$lib/assessment';
	let { data } = $props();
</script>

<section class="max-w-6xl mx-auto px-6 py-12 md:py-20">
	<div class="max-w-3xl">
		<p class="text-sm font-medium text-brand-600 mb-3">EIH Corporate Innovation Readiness Assessment</p>
		<h1 class="text-4xl md:text-5xl font-semibold text-slate-900 leading-tight mb-4">
			Measure your SOE's readiness for open innovation partnerships.
		</h1>
		<p class="text-lg text-slate-600 mb-8">
			E-CIRA benchmarks your organisation across {DIMENSIONS.length} critical dimensions, calibrated against the
			OECD Innovation Capacity Framework, AIM, and the Venture Client Model. Replace the spreadsheet — invite
			colleagues, fill independently, see the consensus.
		</p>
		<div class="flex flex-wrap gap-3">
			{#if data?.user}
				<a href="/dashboard" class="px-5 py-2.5 rounded-md bg-brand-600 text-white hover:bg-brand-700 font-medium text-sm">
					Go to dashboard
				</a>
			{:else}
				<a href="/signup" class="px-5 py-2.5 rounded-md bg-brand-600 text-white hover:bg-brand-700 font-medium text-sm">
					Start assessment
				</a>
				<a href="/signin" class="px-5 py-2.5 rounded-md border border-slate-300 text-slate-700 hover:bg-white font-medium text-sm">
					Sign in
				</a>
			{/if}
		</div>
	</div>

	<div class="mt-16 grid md:grid-cols-3 gap-4">
		{#each ZONES as zone (zone.code)}
			<div class="rounded-lg border p-5 bg-white border-slate-200">
				<div class="flex items-center gap-2 mb-2">
					<span class="w-2.5 h-2.5 rounded-full" class:bg-red-500={zone.code === 'red'} class:bg-amber-400={zone.code === 'yellow'} class:bg-emerald-500={zone.code === 'green'}></span>
					<span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{zone.min}–{zone.max}</span>
				</div>
				<h3 class="font-semibold text-slate-900 mb-1">{zone.label}</h3>
				<p class="text-sm text-slate-600">{zone.pathway}</p>
			</div>
		{/each}
	</div>

	<div class="mt-16">
		<h2 class="text-xl font-semibold mb-4">The {DIMENSIONS.length} dimensions</h2>
		<div class="grid sm:grid-cols-2 gap-3">
			{#each DIMENSIONS as d (d.key)}
				<div class="rounded-md border border-slate-200 bg-white p-4">
					<div class="flex items-baseline gap-2">
						<span class="text-xs font-mono text-slate-400">D{d.number}</span>
						<h3 class="font-medium text-slate-900">{d.title}</h3>
					</div>
					<p class="text-sm text-slate-600 mt-1">{d.summary}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
