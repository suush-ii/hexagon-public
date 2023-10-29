<script lang="ts">
	import { getFormField } from "formsnap";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { Input, type InputEvents } from "$src/components/ui/input";
	import type { Component } from "$lib/types";

	type $$Props = HTMLInputAttributes;
	type $$Events = InputEvents;

	export let icon: Component = undefined

	const { attrStore, value } = getFormField();
</script>

<div class="flex flex-row relative">
<Input
	class="data-invalidInput:outline-dashed data-invalidInput:outline-2 data-invalidInput:outline-destructive/70 focus:data-invalidInput:outline-destructive peer"
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
{#if icon}
<div class="h-6 bg-transparent mt-2 border-muted-foreground/60 peer-data-invalidInput:border-destructive/70 peer-focus:peer-data-invalidInput:border-destructive border-dashed border-x-[1.2px] absolute right-10 pointer-events-none"/> 
<!--HACK!: using divide styles in tailwind is impossible on parent
 because we want to style the divider based on the input being valid
 so we have to use peer here.-->

<svelte:component class="absolute mt-2 right-2 pl-2 w-8 pointer-events-none peer-data-invalidInput:stroke-destructive/70 peer-focus:peer-data-invalidInput:stroke-destructive" this={icon} />

{/if}
</div>