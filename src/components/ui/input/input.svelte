<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import { cn } from "$lib/utils";
	import type { InputEvents } from ".";
	import type { Component } from "$lib/types";

	interface _HTMLInputAttributes extends HTMLInputAttributes {
		icon?: Component,
		direction?: "l" | "r",
		formPadding?: boolean
	}

	export let icon: Component = undefined
	export let direction: Component = "l"
	export let formPadding = false
	let padding = ""

	if (icon){
		if (direction === "l"){
			padding = "pl-10 pr-3"
		}else{
			padding = "pr-10 pl-3"
		}
	} else {
		padding = "px-3"
	}

	if (formPadding){
		padding = "pr-12 pl-3"
	}

	type $$Props = _HTMLInputAttributes;
	type $$Events = InputEvents;

	let className: $$Props["class"] = undefined;
	export let value: $$Props["value"] = undefined;
	export { className as class };
</script>
<div class="flex h-10 w-full flex-row relative ">
<input
	class={cn(
		"flex h-10 w-full rounded-xl border border-input bg-transparent py-2 text-sm ring-offset-background file:border-0  file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
		className,
		padding
	)}
	bind:value
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
	{...$$restProps}
/>
{#if icon}
{#if direction === "r"}
<svelte:component class="absolute mt-2 right-2 pl-2 w-8 pointer-events-none" this={icon} />
{:else}
<svelte:component class="absolute mt-2 left-2 pr-2 w-8 pointer-events-none" this={icon} />
{/if}

{/if}
</div>