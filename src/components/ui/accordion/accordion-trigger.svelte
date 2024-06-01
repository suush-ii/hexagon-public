<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import { cn } from "$lib/utils.js";

	type $$Props = AccordionPrimitive.TriggerProps;
	type $$Events = AccordionPrimitive.TriggerEvents;

	let className: $$Props["class"] = undefined;
	export let level: AccordionPrimitive.HeaderProps["level"] = 3;
	export { className as class };
</script>

<AccordionPrimitive.Header {level} class="flex">
	<AccordionPrimitive.Trigger
		class={cn(
			"flex flex-1 gap-x-2 items-center py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-90 h-10",
			className
		)}
		{...$$restProps}
		on:click
	>
		<ChevronRight class="h-4 w-4 transition-transform duration-200" />
		<slot />
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
