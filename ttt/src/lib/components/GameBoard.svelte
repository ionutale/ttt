<script lang="ts">
	import Cell from './Cell.svelte';
	import { game } from '$lib/stores/game.svelte';
</script>

<div class="grid grid-cols-3 gap-2">
	{#each game.board as cell, i}
		<Cell
			value={cell}
			disabled={cell !== null || game.winner !== null}
			onclick={() => game.makeMove(i)}
		/>
	{/each}
</div>
