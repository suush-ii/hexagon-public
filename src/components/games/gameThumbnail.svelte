<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import CatalogAvatar from '$src/components/catalog/avatar.svelte'

	export let thumbnailid: number | null
	export let gamename: string

	export let size = 'xl:h-[360px] h-fit w-full max-w-[640px]'
</script>

{#if thumbnailid}
	<CatalogAvatar
		css="{size} rounded-xl aspect-video"
		itemId={thumbnailid}
		itemName={gamename}
		disable3d={true}
	/>
{:else}
	<Avatar.Root class="{size} rounded-xl aspect-video">
		<Avatar.Image src={'/Images/thumbnailplaceholder.png'} alt={gamename} loading="lazy" />
		<Avatar.Fallback />
	</Avatar.Root>
{/if}
