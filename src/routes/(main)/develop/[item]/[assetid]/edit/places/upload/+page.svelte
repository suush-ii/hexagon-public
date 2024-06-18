<script lang="ts">
	import type { PageData } from './$types'

	import PlaceFormPrimitive from '$src/components/develop/placeFormPrimitive.svelte'

	export let data: PageData
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Upload Place</h1>

	<PlaceFormPrimitive fileTypes={data.fileTypes} data={data.placeForm} friendlyName={'Place'} />
</div>
