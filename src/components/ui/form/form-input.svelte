<script lang="ts">
	import { getFormField } from "formsnap";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { Input, type InputEvents } from "$src/components/ui/input";

	type $$Props = HTMLInputAttributes;
	type $$Events = InputEvents;

	const { attrStore, value } = getFormField();
</script>

<Input
	class="data-invalidInput:outline-dashed data-invalidInput:outline-2 data-invalidInput:outline-destructive/70 focus:data-invalidInput:outline-destructive"
	{...$attrStore}
	bind:value={$value}
	{...$$restProps}
	on:blur
	on:change
	on:click
	on:focus
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:paste
	on:input
/>
