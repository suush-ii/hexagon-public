<script lang="ts">
	import { page } from '$app/stores'
	import Avatar from '$src/components/catalog/avatar.svelte'
	import { slugify } from '$lib/utils'

	export let assetid: number
	export let assetname: string
	export let creatoruserid: number
	export let username: string
	export let size = 40
</script>

<div class="text-center text-lg w-{size}">
	<a href="/catalog/{assetid}/{slugify(assetname)}">
		<Avatar
			css="w-{size} h-{size} rounded-xl aspect-square"
			itemId={assetid}
			itemName={assetname}
			disable3d={true}
		/></a
	>
	<a href="/catalog/{assetid}/{slugify(assetname)}">
		<h1 class="line-clamp-2 tracking-tighter break-words text-xl hover:underline">
			{assetname}
		</h1></a
	>

	<h1 class="text-base text-muted-foreground mt-2 line-clamp-2">
		{$page.data.t('catalog.creator')}:
		<a href="/users/{creatoruserid}/profile"
			><span class="text-primary hover:underline">{username}</span></a
		>
	</h1>
</div>
