<script lang="ts">
	import type { PageData } from './$types'

	import AssetFormPrimitive from '$src/components/develop/admin/assetFormPrimitive.svelte'

	import GearFormPrimitive from '$src/components/develop/gearFormPrimitive.svelte'

	import PackageFormPrimitive from '$src/components/develop/packageFormPrimitive.svelte'

	export let data: PageData
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Upload {data.friendlyName}</h1>

	{#if data.item === 'hats' || data.item === 'faces' || data.item === 'heads'}
		<AssetFormPrimitive
			fileTypes={data.fileTypes}
			data={data.assetForm}
			friendlyName={data.friendlyName}
		/>
	{:else if data.item === 'gears'}
		<GearFormPrimitive
			fileTypes={data.fileTypes}
			data={data.gearForm}
			friendlyName={data.friendlyName}
		/>
	{:else if data.item === 'packages'}
		<PackageFormPrimitive data={data.packageForm} />
	{/if}
</div>
