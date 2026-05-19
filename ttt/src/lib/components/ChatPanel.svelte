<script lang="ts">
	import { game } from '$lib/stores/game.svelte';

	let input = $state('');
	let chatContainer: HTMLDivElement | undefined = $state();

	function send() {
		const text = input.trim();
		if (!text) return;
		game.sendChatMessage(text);
		input = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	$effect(() => {
		if (chatContainer && game.chatMessages.length > 0) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	});
</script>

<div class="card bg-base-200 w-full max-w-md p-3">
	<h3 class="mb-2 text-sm font-semibold text-base-content/70">Trash Talk</h3>

	<div
		bind:this={chatContainer}
		class="mb-2 flex max-h-40 flex-col gap-2 overflow-y-auto rounded bg-base-300/50 p-2"
	>
		{#if game.chatMessages.length === 0}
			<p class="py-4 text-center text-xs text-base-content/40">
				Trash talk your AI opponent...
			</p>
		{/if}
		{#each game.chatMessages as msg}
			<div
				class="max-w-[85%] rounded px-2.5 py-1.5 text-sm leading-snug
					{msg.role === 'human'
						? 'self-end bg-primary text-primary-content'
						: 'self-start bg-base-100 text-base-content'}"
			>
				{msg.text}
			</div>
		{/each}
	</div>

	<div class="flex gap-2">
		<input
			class="input input-bordered input-sm flex-1"
			placeholder="Say something..."
			bind:value={input}
			onkeydown={handleKeydown}
			disabled={game.loading}
		/>
		<button class="btn btn-primary btn-sm" onclick={send} disabled={!input.trim() || game.loading}>
			Send
		</button>
	</div>
</div>
