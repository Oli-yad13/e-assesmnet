<script lang="ts">
	import '../app.css';
	let { children, data } = $props();
</script>

<div class="min-h-full flex flex-col">
	<header class="bg-white border-b border-slate-200">
		<div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 font-semibold text-slate-900">
				<span class="inline-block w-2 h-2 rounded-full bg-brand-500"></span>
				<span>E-CIRA</span>
				<span class="text-xs font-normal text-slate-500">· EIH Innovation Readiness</span>
			</a>
			<nav class="flex items-center gap-4 text-sm">
				{#if data?.user}
					<a href="/dashboard" class="text-slate-700 hover:text-slate-900">Dashboard</a>
					{#if data.isAdmin}
						<a href="/admin" class="text-slate-700 hover:text-slate-900">Admin</a>
					{/if}
					<form action="/auth/signout" method="POST">
						<button class="text-slate-500 hover:text-slate-900">Sign out</button>
					</form>
				{:else}
					<a href="/signin" class="text-slate-700 hover:text-slate-900">Sign in</a>
					<a href="/signup" class="px-3 py-1.5 rounded-md bg-brand-600 text-white text-sm hover:bg-brand-700">Sign up</a>
				{/if}
			</nav>
		</div>
	</header>
	<main class="flex-1">
		{@render children()}
	</main>
	<footer class="border-t border-slate-200 bg-white">
		<div class="max-w-6xl mx-auto px-6 py-4 text-xs text-slate-500">
			Benchmarked against OECD, AIM, and Venture Client Model frameworks · EIH × ALX
		</div>
	</footer>
</div>
