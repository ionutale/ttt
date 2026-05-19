<script lang="ts">
	import { game } from '$lib/stores/game.svelte';

	let mode = $state<'pvp' | 'ai'>('pvp');
	let aiPiece = $state<'X' | 'O'>('O');
	let models = $state<string[]>([]);
	let selectedModel = $state('');
	let loadingModels = $state(true);

	$effect(() => {
		if (mode === 'ai' && models.length === 0) {
			loadingModels = true;
			fetch('/api/models')
				.then((r) => r.json())
				.then((data) => {
					models = data.models || [];
					if (models.length > 0) selectedModel = models[0];
				})
				.catch(() => {
					models = [];
				})
				.finally(() => {
					loadingModels = false;
				});
		}
	});

	function start() {
		game.startGame(mode, mode === 'ai' ? aiPiece : undefined, mode === 'ai' ? selectedModel : undefined);
	}
</script>

<div class="rounded-lg border border-base-300/20 bg-base-300/10 p-8 shadow-lg w-full max-w-sm">
	<h1 class="mb-2 text-center text-3xl font-bold tracking-wider">
		<span class="text-cyan-400">TIC</span>
		<span class="text-base-content">-</span>
		<span class="text-pink-400">TAC</span>
		<span class="text-base-content">-</span>
		<span class="text-cyan-400">TOE</span>
	</h1>
	<p class="mb-8 text-center text-xs uppercase tracking-widest text-base-content/40">
		20×20 · 4 in a row
	</p>

	<div class="mb-6">
		<p class="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-base-content/50">
			Game Mode
		</p>
		<div class="flex justify-center gap-2">
			<button
				class="btn btn-sm {mode === 'pvp' ? 'btn-primary' : 'btn-ghost'}"
				onclick={() => mode = 'pvp'}
			>
				vs Player
			</button>
			<button
				class="btn btn-sm {mode === 'ai' ? 'btn-primary' : 'btn-ghost'}"
				onclick={() => mode = 'ai'}
			>
				vs AI
			</button>
		</div>
	</div>

	{#if mode === 'ai'}
		<div class="mb-4">
			<p class="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-base-content/50">
				AI plays as
			</p>
			<div class="flex justify-center gap-2">
				<button
					class="btn btn-sm {aiPiece === 'X' ? 'btn-secondary' : 'btn-ghost'}"
					onclick={() => aiPiece = 'X'}
				>
					<span class="text-cyan-400">X</span> (first)
				</button>
				<button
					class="btn btn-sm {aiPiece === 'O' ? 'btn-secondary' : 'btn-ghost'}"
					onclick={() => aiPiece = 'O'}
				>
					<span class="text-pink-400">O</span> (second)
				</button>
			</div>
		</div>

		<div class="mb-6">
			<p class="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-base-content/50">
				Model
			</p>
			<div class="flex justify-center">
				{#if loadingModels}
					<span class="loading loading-spinner loading-sm text-primary"></span>
				{:else if models.length === 0}
					<p class="text-xs text-error/70 italic">Could not fetch models. Is Ollama running?</p>
				{:else}
					<select class="select select-sm select-bordered w-full max-w-xs bg-base-300/20 border-base-300/30" bind:value={selectedModel}>
						{#each models as m}
							<option value={m}>{m}</option>
						{/each}
					</select>
				{/if}
			</div>
		</div>
	{/if}

	<div class="flex justify-center">
		<button class="btn btn-primary btn-wide" onclick={start}>
			Start Game
		</button>
	</div>
</div>
