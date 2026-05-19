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
	<div class="w-full max-w-md">
		<h3 class="mb-1 text-sm font-semibold text-base-content/70">Move History</h3>
		<div class="max-h-48 overflow-y-auto rounded border border-base-300">
			<table class="table table-xs">
				<thead>
					<tr>
						<th>#</th>
						<th>Player</th>
						<th>Position</th>
						<th>Time</th>
					</tr>
				</thead>
				<tbody>
					{#each game.history as entry, i}
						<tr>
							<td>{i + 1}</td>
							<td class="font-bold {entry.player === 'X' ? 'text-primary' : 'text-secondary'}">
								{entry.player}
							</td>
							<td>{cellLabel(entry.index)}</td>
							<td class="tabular-nums">{formatDuration(entry.durationMs)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
