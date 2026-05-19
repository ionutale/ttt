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
	class="btn btn-lg btn-outline h-24 w-24 text-4xl font-bold"
	{disabled}
	{onclick}
>
	{value}
</button>
