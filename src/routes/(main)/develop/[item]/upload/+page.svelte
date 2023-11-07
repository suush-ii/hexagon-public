<script lang="ts">
	import type { PageData } from './$types'

	import FormPrimitive from '$src/components/develop/formPrimitive.svelte'
	import { formSchema as gameSchema } from '$lib/schemas/gameschema'
	import { formSchema as clothingSchema } from '$lib/schemas/clothingschema'
	import { formSchema as assetSchema } from '$lib/schemas/assetschema'

	export let data: PageData

	let form = data.form
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Upload {data.friendlyName}</h1>
	<!-- TODO: FORM-->

	{#if data.item === 'games'}
		<FormPrimitive
			fileTypes={data.fileTypes}
			{form}
			friendlyName={data.friendlyName}
			formSchema={gameSchema}
			item={data.item}
		/>
	{:else if data.item === 'shirts' || data.item === 'pants'}
		<FormPrimitive
			fileTypes={data.fileTypes}
			{form}
			friendlyName={data.friendlyName}
			formSchema={clothingSchema}
			item={data.item}
		/>
	{:else if data.item === 'audio' || data.item === 'decals'}
		<FormPrimitive
			fileTypes={data.fileTypes}
			{form}
			friendlyName={data.friendlyName}
			formSchema={assetSchema}
			item={data.item}
		/>
	{/if}

	<!-- TODO: Form fields don't support file uploads will have to figure out a way to hack this...-->
</div>
