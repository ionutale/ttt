<script lang="ts">
	import ChatPanel from '$lib/components/ChatPanel.svelte';
	import GameBoard from '$lib/components/GameBoard.svelte';
	import GameHistory from '$lib/components/GameHistory.svelte';
	import GameSetup from '$lib/components/GameSetup.svelte';
	import { game } from '$lib/stores/game.svelte';

	let statusMessage = $derived.by(() => {
		if (game.loading) return `${game.aiModel || 'AI'} thinking...`;
		if (game.winner === 'draw') return "It's a draw!";
		if (game.winner) return `${game.winner} wins!`;
		if (game.mode === 'ai') {
			const human = game.aiPlayer === 'X' ? 'O' : 'X';
			return game.currentPlayer === game.aiPlayer
				? "AI's turn..."
				: `Your turn (${human})`;
		}
		return `${game.currentPlayer}'s turn`;
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#12121f] p-4">
	{#if !game.gameActive}
		<div class="flex min-h-[90vh] items-center justify-center">
			<GameSetup />
		</div>
	{:else}
		<div class="mx-auto max-w-5xl">
			<div class="navbar mb-4 rounded-lg border border-base-300/20 bg-base-300/10 px-4 py-2 shadow-sm backdrop-blur-md">
				<div class="flex-1">
					<span class="text-lg font-bold tracking-widest">
						<span class="text-cyan-400">TIC</span>
						<span class="text-base-content">-</span>
						<span class="text-pink-400">TAC</span>
						<span class="text-base-content">-</span>
						<span class="text-cyan-400">TOE</span>
					</span>
				</div>
				<div class="flex items-center gap-4">
					<span class="hidden text-xs font-semibold tracking-wide text-base-content/60 sm:inline">
						{statusMessage}
					</span>
					<button
						class="btn btn-primary btn-sm"
						onclick={() => game.startGame(game.mode, game.aiPlayer, game.aiModel)}
					>
						New Game
					</button>
					<button class="btn btn-ghost btn-sm" onclick={() => game.quitGame()}>
						Quit
					</button>
				</div>
			</div>

			<div class="flex flex-col gap-4 lg:flex-row">
				<div class="flex flex-1 justify-center">
					<GameBoard />
				</div>

				<div class="flex w-full flex-col gap-3 lg:w-72">
					{#if game.mode === 'ai'}
						<ChatPanel />
					{/if}
					<GameHistory />

					{#if game.error}
						<div class="rounded-lg border border-error/30 bg-error/10 p-3 text-sm">
							<p class="text-error/80">{game.error}</p>
							<button class="btn btn-ghost btn-xs mt-1 text-error/70" onclick={() => game.retryAIMove()}>
								Retry
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
