<script lang="ts">
	import { game } from '$lib/stores/game.svelte';

	let input = $state('');
	let chatContainer: HTMLDivElement | undefined = $state();
	let lastHandled = $state<string | null>(null);

	let currentTrashTalk = $derived(game.lastTrashTalk);

	$effect(() => {
		const talk = currentTrashTalk;
		if (talk && talk !== lastHandled) {
			lastHandled = talk;
			game.addTrashTalk(talk);
		}
	});

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

<div class="rounded-lg border border-base-300/20 bg-base-300/10 p-3 shadow-sm">
	<h3 class="mb-2 text-xs font-semibold uppercase tracking-widest text-base-content/50">
		Trash Talk
	</h3>

	<div
		bind:this={chatContainer}
		class="mb-2 flex max-h-36 flex-col gap-1.5 overflow-y-auto rounded bg-base-300/20 p-2"
	>
		{#if game.chatMessages.length === 0}
			<p class="py-3 text-center text-xs text-base-content/30 italic">
				Say something clever...
			</p>
		{/if}
		{#each game.chatMessages as msg}
			<div
				class="max-w-[88%] rounded-lg px-2.5 py-1.5 text-xs leading-relaxed
					{msg.role === 'human'
						? 'self-end bg-primary text-primary-content'
						: 'self-start bg-base-200 text-base-content'}"
			>
				{msg.text}
			</div>
		{/each}
	</div>

	<div class="flex gap-1.5">
		<input
			class="input input-xs flex-1 bg-base-300/30 border-base-300/30"
			placeholder="Trash talk..."
			bind:value={input}
			onkeydown={handleKeydown}
			disabled={game.loading}
		/>
		<button
			class="btn btn-primary btn-xs"
			onclick={send}
			disabled={!input.trim() || game.loading}
		>
			Send
		</button>
	</div>
</div>
