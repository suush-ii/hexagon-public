<script lang="ts">
	import { HeartCrack } from 'lucide-svelte'
</script>

<div class="mx-auto flex flex-col w-full gap-y-4 select-none" {...$$restProps}>
	<HeartCrack class="w-24 h-24 mx-auto" strokeWidth={1.2} />
	<h5 class="text-center mx-auto select-none">There seems to be no one here... 😕</h5>
</div>
