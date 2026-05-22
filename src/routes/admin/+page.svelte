<script lang="ts">
	let { data } = $props();
</script>

<section class="max-w-6xl mx-auto px-6 py-10">
	<header class="mb-8 flex items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold">Admin</h1>
			<p class="text-sm text-slate-600 mt-1">
				{data.orgs.length} organisation(s) · {data.userCount} user(s)
			</p>
		</div>
		<a href="/admin/export.csv" class="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm font-medium">
			Download all responses (CSV)
		</a>
	</header>

	{#if data.orgs.length === 0}
		<div class="rounded-lg border border-dashed border-slate-300 p-8 text-center bg-white">
			<p class="text-slate-600">No organisations yet.</p>
		</div>
	{:else}
		<div class="rounded-lg border border-slate-200 bg-white overflow-hidden">
			<table class="w-full text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-500 bg-slate-50">
					<tr>
						<th class="py-3 px-4">Organisation</th>
						<th class="py-3 px-4 text-center">Members</th>
						<th class="py-3 px-4 text-center">Submitted</th>
						<th class="py-3 px-4 text-center">Drafts</th>
						<th class="py-3 px-4 text-right">Avg total</th>
						<th class="py-3 px-4">Zone</th>
						<th class="py-3 px-4"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.orgs as o (o.id)}
						<tr>
							<td class="py-3 px-4">
								<div class="font-medium text-slate-900">{o.name}</div>
								<div class="text-xs text-slate-500">Created {new Date(o.created_at).toLocaleDateString()}</div>
							</td>
							<td class="py-3 px-4 text-center text-slate-700">{o.memberCount}</td>
							<td class="py-3 px-4 text-center text-slate-700">{o.submittedCount}</td>
							<td class="py-3 px-4 text-center text-slate-700">{o.draftCount}</td>
							<td class="py-3 px-4 text-right font-medium">{o.submittedCount ? o.avgTotal.toFixed(1) : '—'}</td>
							<td class="py-3 px-4">
								{#if o.zone}
									<span class="text-xs font-medium px-2 py-0.5 rounded"
										class:bg-red-100={o.zone.code==='red'} class:text-red-700={o.zone.code==='red'}
										class:bg-amber-100={o.zone.code==='yellow'} class:text-amber-700={o.zone.code==='yellow'}
										class:bg-emerald-100={o.zone.code==='green'} class:text-emerald-700={o.zone.code==='green'}>
										{o.zone.label}
									</span>
								{:else}
									<span class="text-xs text-slate-400">—</span>
								{/if}
							</td>
							<td class="py-3 px-4 text-right">
								<a href={`/admin/org/${o.id}`} class="text-sm text-brand-600 hover:underline">View →</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
