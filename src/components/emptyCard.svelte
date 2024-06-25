<script lang="ts">
	import { HeartCrack } from 'lucide-svelte'

	export let hideDefault = false
	import { page } from '$app/stores'
</script>

<div class="mx-auto flex flex-col w-full gap-y-4 select-none" {...$$restProps}>
	<HeartCrack class="w-24 h-24 mx-auto" strokeWidth={1.2} />
	{#if !hideDefault}<h5 class="text-center mx-auto select-none">
			{$page.data.t('emptyCard.empty')}
		</h5>{/if}
	<slot class="text-center mx-auto select-none" />
</div>
