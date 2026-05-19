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
	class="flex items-center justify-center border border-base-300/30 rounded-sm size-6 text-xs font-bold
		cursor-pointer transition-all duration-100 select-none
		hover:border-base-300/60 hover:bg-base-300/20
		disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-base-300/30 disabled:hover:bg-transparent
		{value === 'X' ? 'text-cyan-400' : value === 'O' ? 'text-pink-400' : 'text-base-content/40'}"
	{disabled}
	{onclick}
>
	{value}
</button>
