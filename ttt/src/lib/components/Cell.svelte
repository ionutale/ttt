<script lang="ts">
	let {
		value = $bindable(null as 'X' | 'O' | null),
		disabled = false,
		onclick
	}: {
		value?: 'X' | 'O' | null;
		disabled?: boolean;
		onclick?: () => void;
	} = $props();
</script>

<button
	class="flex items-center justify-center border border-base-300 rounded-sm size-6 text-xs font-bold
		hover:bg-base-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
		transition-colors select-none"
	{disabled}
	{onclick}
>
	{value}
</button>
