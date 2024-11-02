<script lang="ts">
	import { pageName } from '$src/stores'
	import Avatar from '$src/components/catalog/avatar.svelte'
	import * as ImageAvatar from '$src/components/ui/avatar'

	pageName.set('Admin')

	import type { PageData } from './$types'
	import { getImage } from '$lib/games/getImage'

	export let data: PageData

	$: summary = [
		{ friendlyName: 'Asset Name', value: data.asset.assetname },
		{ friendlyName: 'Asset Type', value: data.asset.assetType },
		{
			friendlyName: 'Moderation Status',
			value: data.asset.moderationstate === 'rejected' ? 'Moderated' : 'Ok'
		},
		{ friendlyName: 'AssetId', value: data.asset.assetid },
		{ friendlyName: 'Created', value: data.asset.created?.toLocaleDateString('en-US') }
	]
</script>

<div class="p-8 flex flex-col space-y-4 grow max-w-3xl h-full">
	<h1 class="text-lg">Asset Summary</h1>

	<div
		class="p-4 flex flex-col supports-backdrop-blur:bg-background/60 bg-muted-foreground/5 rounded-xl"
	>
		<table class="table-fixed text-lg">
			<tbody>
				{#each summary as key}
					<tr>
						<td class="px-8 py-1">{key.friendlyName}: </td>
						<td class="px-8 py-1">{key.value}</td>
					</tr>
				{/each}
				<tr>
					<td class="px-8 py-1">
						{#if data.asset.assetType === 'games'}
							<ImageAvatar.Root class="xl:h-96 h-fit w-full max-w-96 aspect-square">
								<ImageAvatar.Image
									src={getImage(
										data.asset.place.associatedgame.icon?.simpleasseturl,
										data.asset.place.associatedgame.icon?.moderationstate,
										'icon'
									)}
									alt={data.asset.assetname}
									loading="lazy"
								/>
								<ImageAvatar.Fallback />
							</ImageAvatar.Root>
						{:else}
							<Avatar
								css="xl:h-96 h-fit w-full max-w-96 aspect-square"
								itemName={data.asset.assetname}
								itemId={data.asset.assetid}
								disable3d={true}
							/>
						{/if}
					</td>
					<td class="px-8 py-1 flex flex-col mt-4">
						<a class="hover:underline" href="/catalog/{data.asset.assetid}">Asset Page</a>
						<a class="hover:underline" href="/users/{data.asset.creatoruserid}/profile"
							>Creator Page</a
						>
						<a class="hover:underline" href="/admin/catalog/moderateasset/{data.asset.assetid}"
							>Moderate Asset</a
						>
						{#if data.canEdit}
							<a
								class="hover:underline"
								href="/admin/catalog/upload/{data.asset.assetType}/{data.asset.assetid}/updateasset"
								>Update Asset</a
							>
						{/if}

						{#if data.asset.assetType === 'badges'}
							<a
								class="hover:underline"
								href="/admin/catalog/upload/{data.asset.assetType}/{data.asset.assetid}/eventitem"
								>Event Item</a
							>
						{/if}

						<form method="POST" action="?/render">
							<button class="hover:underline" type="submit">Redraw Render</button>
						</form>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
