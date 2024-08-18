<script lang="ts">
	import { Download, Loader2 } from 'lucide-svelte'
	import type { Writable } from 'svelte/store'

	export let loading: Writable<boolean>
</script>

{#if $loading}<Loader2 class="animate-spin" />{:else}<Download />{/if}
