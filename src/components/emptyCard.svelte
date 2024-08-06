<script lang="ts">
	import { CircleHelp } from 'lucide-svelte'

	export let hideDefault = false
	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	let loaded = false

	onMount(async () => {
		await new Promise((resolve) => setTimeout(resolve, 100))

		loaded = true
	})
</script>

<div class="mx-auto flex flex-col w-full gap-y-4 select-none" {...$$restProps}>
	<CircleHelp
		class="w-24 h-24 mx-auto transition-all duration-1000 ease-in-out {loaded
			? 'rotate-0 opacity-100 scale-100'
			: 'rotate-[-200deg] opacity-80 scale-90'}"
		strokeWidth={1.5}
	/>
	{#if !hideDefault}<h5 class="text-center mx-auto select-none">
			{$page.data.t('emptyCard.empty')}
		</h5>{/if}
	<slot class="text-center mx-auto select-none" />
</div>
