<script lang="ts">
	import ChatPanel from '$lib/components/ChatPanel.svelte';
	import GameBoard from '$lib/components/GameBoard.svelte';
	import GameHistory from '$lib/components/GameHistory.svelte';
	import GameSetup from '$lib/components/GameSetup.svelte';
	import { game } from '$lib/stores/game.svelte';

	let statusMessage = $derived.by(() => {
		if (game.loading) return `${game.aiModel || 'AI'} is thinking...`;
		if (game.winner === 'draw') return "It's a draw!";
		if (game.winner) return `Player ${game.winner} wins!`;
		if (game.mode === 'ai') {
			const human = game.aiPlayer === 'X' ? 'O' : 'X';
			return game.currentPlayer === game.aiPlayer
				? "AI's turn..."
				: `Your turn (${human})`;
		}
		return `Player ${game.currentPlayer}'s turn`;
	});
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	{#if !game.gameActive}
		<GameSetup />
	{:else}
		<div class="flex flex-col items-center gap-3">
			<h1 class="text-2xl font-bold">Tic Tac Toe</h1>
			<p class="text-sm font-semibold">{statusMessage}</p>

			<div class="overflow-auto max-w-[95vw]">
				<GameBoard />
			</div>

			{#if game.mode === 'ai'}
				<ChatPanel />
			{/if}

			<GameHistory />

			{#if game.error}
				<div class="alert alert-error max-w-md text-sm">
					<span>{game.error}</span>
					<button class="btn btn-ghost btn-xs" onclick={() => game.retryAIMove()}>
						Retry
					</button>
				</div>
			{/if}

			<div class="flex gap-3">
				<button class="btn btn-primary btn-sm" onclick={() => game.startGame(game.mode, game.aiPlayer, game.aiModel)}>
					New Game
				</button>
				<button class="btn btn-ghost btn-sm" onclick={() => game.quitGame()}>
					Change Mode
				</button>
			</div>
		</div>
	{/if}
</div>
