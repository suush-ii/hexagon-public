<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import { cn } from "$lib/utils";
	import type { InputEvents } from ".";
	import type { Component } from "$lib/types";
	import { defaultClass } from "."

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
			padding = "pl-12 pr-3"
		}else{
			padding = "pr-12 pl-3"
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
		"data-invalidInput:outline-dashed data-invalidInput:outline-2 data-invalidInput:outline-destructive/70 focus:data-invalidInput:outline-destructive peer",
		defaultClass,
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
<div class="h-6 bg-transparent mt-2 border-muted-foreground/20 peer-data-invalidInput:border-destructive/70 peer-focus:peer-data-invalidInput:border-destructive border-dashed border-x absolute right-10 pointer-events-none"/> 
<svelte:component class="absolute mt-2 right-2 w-8 pointer-events-none peer-data-invalidInput:stroke-destructive/70 peer-focus:peer-data-invalidInput:stroke-destructive" this={icon} />
{:else}
<div class="h-6 bg-transparent mt-2 border-muted-foreground/20 peer-data-invalidInput:border-destructive/70 peer-focus:peer-data-invalidInput:border-destructive border-dashed border-x absolute left-10 pointer-events-none"/> 
<svelte:component class="absolute mt-2 left-2 w-8 pointer-events-none peer-data-invalidInput:stroke-destructive/70 peer-focus:peer-data-invalidInput:stroke-destructive" this={icon} />
{/if}

{/if}
</div>