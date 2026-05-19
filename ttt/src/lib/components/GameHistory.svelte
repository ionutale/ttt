<script lang="ts">
	import { game, GRID_SIZE } from '$lib/stores/game.svelte';

	function formatDuration(ms: number | null): string {
		if (ms === null) return '--';
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(1)}s`;
	}

	function cellLabel(index: number): string {
		const row = Math.floor(index / GRID_SIZE) + 1;
		const col = (index % GRID_SIZE) + 1;
		return `(${row}, ${col})`;
	}
</script>

{#if game.history.length > 0}
	<div class="rounded-lg border border-base-300/20 bg-base-300/10 p-3 shadow-sm">
		<h3 class="mb-2 text-xs font-semibold uppercase tracking-widest text-base-content/50">
			Move History
		</h3>
		<div class="max-h-40 overflow-y-auto rounded bg-base-300/20">
			<table class="table table-xs">
				<thead>
					<tr class="text-base-content/40">
						<th>#</th>
						<th>P</th>
						<th>Pos</th>
						<th>Time</th>
					</tr>
				</thead>
				<tbody>
					{#each game.history as entry, i}
						<tr class="hover:bg-base-300/20">
							<td class="text-base-content/50">{i + 1}</td>
							<td class="font-bold {entry.player === 'X' ? 'text-cyan-400' : 'text-pink-400'}">
								{entry.player}
							</td>
							<td class="tabular-nums text-base-content/80">{cellLabel(entry.index)}</td>
							<td class="tabular-nums text-base-content/60 text-xs">{formatDuration(entry.durationMs)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
