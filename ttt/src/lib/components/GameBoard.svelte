<script lang="ts">
	import Cell from './Cell.svelte';
	import { game, GRID_SIZE } from '$lib/stores/game.svelte';
</script>

<div class="relative">
	<div
		class="grid gap-px"
		style="grid-template-columns: repeat({GRID_SIZE}, minmax(0, 1fr))"
	>
		{#each game.board as cell, i}
			<Cell
				value={cell}
				disabled={cell !== null || game.winner !== null || game.loading}
				onclick={() => game.makeMove(i)}
			/>
		{/each}
	</div>

	{#if game.loading}
		<div
			class="absolute inset-0 flex flex-col items-center justify-center gap-3
				rounded bg-base-200/70 backdrop-blur-sm"
		>
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<p class="text-sm font-semibold">{game.aiModel || 'AI'} is thinking...</p>
		</div>
	{/if}
</div>
