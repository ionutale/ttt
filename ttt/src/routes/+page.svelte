<script lang="ts">
	import GameBoard from '$lib/components/GameBoard.svelte';
	import { game } from '$lib/stores/game.svelte';

	let statusMessage = $derived.by(() => {
		if (game.winner === 'draw') return "It's a draw!";
		if (game.winner) return `Player ${game.winner} wins!`;
		return `Player ${game.currentPlayer}'s turn`;
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="card bg-base-200 p-8 shadow-xl">
		<h1 class="mb-2 text-center text-3xl font-bold">Tic Tac Toe</h1>
		<p class="mb-6 text-center text-lg font-semibold">{statusMessage}</p>
		<div class="flex justify-center">
			<GameBoard />
		</div>
		<div class="mt-6 flex justify-center">
			<button class="btn btn-primary" onclick={() => game.reset()}>New Game</button>
		</div>
	</div>
</div>
