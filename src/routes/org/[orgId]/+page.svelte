<script lang="ts">
	import { page } from '$app/state';
	import { DIMENSIONS, totalScore, zoneFor } from '$lib/assessment';

	let { data, form } = $props();

	const inviteUrl = $derived(
		data.activeInvite ? `${page.url.origin}/invite/${data.activeInvite.token}` : ''
	);

	const submittedCount = $derived(data.assessments.filter((a: any) => a.status === 'submitted').length);
	const myStatus = $derived(data.myAssessment?.status ?? null);

	let copied = $state(false);
	function copyInvite() {
		if (!inviteUrl) return;
		navigator.clipboard.writeText(inviteUrl).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 1500);
		});
	}
</script>

<section class="max-w-5xl mx-auto px-6 py-10">
	<header class="mb-8">
		<a href="/dashboard" class="text-sm text-slate-500 hover:text-slate-700">← All organisations</a>
		<h1 class="text-2xl font-semibold mt-2">{data.org.name}</h1>
		<p class="text-sm text-slate-600 mt-1">{data.members.length} member(s) · {submittedCount} submitted assessment(s)</p>
	</header>

	<div class="grid md:grid-cols-3 gap-4 mb-10">
		<div class="md:col-span-2 rounded-lg border border-slate-200 bg-white p-6">
			<h2 class="font-semibold mb-3">Your assessment</h2>
			{#if !data.myAssessment}
				<p class="text-sm text-slate-600 mb-3">You haven't started yet. Each leader fills in independently — averages happen across the team automatically.</p>
				<form method="POST" action="?/startAssessment">
					<button class="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Start my assessment</button>
				</form>
			{:else}
				{@const myScore = totalScore(data.myAssessment.scores ?? {})}
				{@const myZone = zoneFor(myScore)}
				<div class="flex items-center justify-between">
					<div>
						<div class="text-sm text-slate-500">Status</div>
						<div class="font-medium">
							{#if myStatus === 'submitted'}
								<span class="text-emerald-700">Submitted</span>
							{:else}
								<span class="text-amber-700">Draft</span>
							{/if}
						</div>
					</div>
					<div>
						<div class="text-sm text-slate-500">Score so far</div>
						<div class="font-medium">{myScore} / 30 — <span class:text-red-600={myZone.code==='red'} class:text-amber-600={myZone.code==='yellow'} class:text-emerald-600={myZone.code==='green'}>{myZone.label}</span></div>
					</div>
					<a href={`/org/${data.org.id}/assessment`} class="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm font-medium">
						{myStatus === 'submitted' ? 'View' : 'Continue'}
					</a>
				</div>
			{/if}
		</div>

		<div class="rounded-lg border border-slate-200 bg-white p-6">
			<h2 class="font-semibold mb-3">Team results</h2>
			<p class="text-sm text-slate-600 mb-4">Average across all submitted assessments.</p>
			<a href={`/org/${data.org.id}/results`} class="inline-block px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm font-medium">
				View results
			</a>
			<a href={`/org/${data.org.id}/export.csv`} class="inline-block ml-2 px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm font-medium">
				Download CSV
			</a>
		</div>
	</div>

	<div class="rounded-lg border border-slate-200 bg-white p-6 mb-10">
		<h2 class="font-semibold mb-3">Invite colleagues</h2>
		<p class="text-sm text-slate-600 mb-4">Share this link with the 2–3 senior leaders who should complete the assessment. They'll sign up and be added automatically.</p>
		{#if data.activeInvite}
			<div class="flex items-center gap-2">
				<input readonly value={inviteUrl} class="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm bg-slate-50" />
				<button type="button" onclick={copyInvite} class="px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm">
					{copied ? 'Copied' : 'Copy'}
				</button>
				<form method="POST" action="?/revokeInvite">
					<input type="hidden" name="token" value={data.activeInvite.token} />
					<button class="px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm text-slate-600">Revoke</button>
				</form>
			</div>
		{:else}
			<form method="POST" action="?/createInvite">
				<button class="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Generate invite link</button>
			</form>
		{/if}
		{#if form?.error}
			<p class="mt-2 text-sm text-red-600">{form.error}</p>
		{/if}
	</div>

	<div class="rounded-lg border border-slate-200 bg-white p-6">
		<h2 class="font-semibold mb-3">Members</h2>
		<ul class="divide-y divide-slate-100">
			{#each data.members as m (m.user_id)}
				{@const theirA = data.assessments.find((a: any) => a.user_id === m.user_id)}
				<li class="py-3 flex items-center justify-between text-sm">
					<div>
						<div class="font-medium text-slate-900">{m.full_name}</div>
						<div class="text-xs text-slate-500">{m.role}</div>
					</div>
					<div class="text-slate-600">
						{#if theirA?.status === 'submitted'}
							<span class="text-emerald-700">Submitted · {totalScore(theirA.scores ?? {})}/30</span>
						{:else if theirA?.status === 'draft'}
							<span class="text-amber-700">In progress</span>
						{:else}
							<span class="text-slate-400">Not started</span>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	</div>
</section>
