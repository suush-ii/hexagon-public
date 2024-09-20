<script lang="ts">
	import { depluralize } from '$lib/utils'
	import UpdateAssetFormPrimitive from '$src/components/develop/edit/updateAssetFormPrimitive.svelte'
	import type { PageData } from './$types'

	export let data: PageData

	$: itemName = data.item.charAt(0).toUpperCase() + data.item.slice(1)
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">
		Configure {depluralize(itemName)}
	</h1>

	<UpdateAssetFormPrimitive
		data={data.updateAssetForm}
		friendlyName={data.friendlyName}
		fileTypes={data.fileTypes}
	/>
</div>
