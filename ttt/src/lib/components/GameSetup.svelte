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

<div class="card bg-base-200 p-8 shadow-xl w-full max-w-sm">
	<h1 class="mb-6 text-center text-3xl font-bold">Tic Tac Toe</h1>

	<div class="mb-6">
		<p class="mb-2 text-center text-sm font-semibold text-base-content/70">Game Mode</p>
		<div class="flex justify-center gap-3">
			<button
				class="btn {mode === 'pvp' ? 'btn-primary' : 'btn-ghost'}"
				onclick={() => mode = 'pvp'}
			>
				vs Player
			</button>
			<button
				class="btn {mode === 'ai' ? 'btn-primary' : 'btn-ghost'}"
				onclick={() => mode = 'ai'}
			>
				vs AI
			</button>
		</div>
	</div>

	{#if mode === 'ai'}
		<div class="mb-4">
			<p class="mb-2 text-center text-sm font-semibold text-base-content/70">
				AI plays as
			</p>
			<div class="flex justify-center gap-3">
				<button
					class="btn {aiPiece === 'X' ? 'btn-secondary' : 'btn-ghost'}"
					onclick={() => aiPiece = 'X'}
				>
					X (goes first)
				</button>
				<button
					class="btn {aiPiece === 'O' ? 'btn-secondary' : 'btn-ghost'}"
					onclick={() => aiPiece = 'O'}
				>
					O (goes second)
				</button>
			</div>
		</div>

		<div class="mb-6">
			<p class="mb-2 text-center text-sm font-semibold text-base-content/70">
				Ollama Model
			</p>
			<div class="flex justify-center">
				{#if loadingModels}
					<span class="loading loading-spinner loading-sm text-primary"></span>
				{:else if models.length === 0}
					<p class="text-xs text-error">Could not fetch models. Is Ollama running?</p>
				{:else}
					<select
						class="select select-bordered w-full max-w-xs"
						bind:value={selectedModel}
					>
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
