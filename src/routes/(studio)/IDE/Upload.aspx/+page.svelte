<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData

	import { Button } from '$src/components/ui/button'
</script>

{@html data.page}

<svelte:head>
	<script>
		//window.external.SaveUrl('https://hex.cirroskais.xyz/cum')
	</script>
</svelte:head>
