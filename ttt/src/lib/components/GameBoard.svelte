<script lang="ts">
	import Cell from './Cell.svelte';
	import { game, GRID_SIZE } from '$lib/stores/game.svelte';
</script>

<div class="relative inline-block rounded-lg border border-base-300/20 bg-base-300/10 p-1 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
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
				rounded-lg bg-neutral/80 backdrop-blur-sm"
		>
			<span class="loading loading-infinity loading-lg text-primary"></span>
			<p class="text-sm font-semibold tracking-wide">{game.aiModel || 'AI'} is thinking...</p>
		</div>
	{/if}
</div>
