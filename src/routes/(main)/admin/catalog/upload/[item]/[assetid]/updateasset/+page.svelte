<script lang="ts">
	import UpdateAssetFormPrimitive from '$src/components/develop/edit/updateAssetFormPrimitive.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">
		Configure {data.friendlyName}
	</h1>

	<UpdateAssetFormPrimitive
		data={data.updateAssetForm}
		friendlyName={data.friendlyName}
		fileTypes={data.fileTypes}
	/>
</div>
