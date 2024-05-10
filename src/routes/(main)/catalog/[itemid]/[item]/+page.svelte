<script lang="ts">
	import Avatar from '$src/components/catalog/avatar.svelte'
	import UserAvatar from '$src/components/users/avatar.svelte'
	import { MoonStar, Webhook, Star } from 'lucide-svelte'

	import { Button } from '$src/components/ui/button'
	import { Separator } from '$src/components/ui/separator'
	import * as Card from '$src/components/ui/card'
	import ReportButton from '$src/components/reportButton.svelte'
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { depluralize, formatCompactNumber, slugify } from '$lib/utils'

	import { toast } from 'svelte-sonner'

	import RelativeTime from '@yaireo/relative-time'

	const relativeTime = new RelativeTime()

	import type { PageData } from './$types'
	import { invalidateAll } from '$app/navigation'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import Genre from '$src/components/catalog/genre.svelte'
	import GearAttributes from '$src/components/catalog/gearattributes.svelte'

	export let data: PageData

	let purchasing = false

	async function purchase() {
		purchasing = true

		const response = await fetch(`/api/purchase`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				itemid: data.item.assetid
			})
		})

		const json = await response.json()

		if (json.success === false) {
			toast.error(json.message)
		} else {
			toast.success('Item purchased successfully!')
			invalidateAll()
		}

		purchasing = false
	}

	$: itemName = data.item.assetType.charAt(0).toUpperCase() + data.item.assetType.slice(1)

	$: itemid = data.item.assetid
</script>

<div class="container p-8 flex flex-col gap-y-4">
	<div class="flex flex-col gap-y-4">
		<h1 class="text-5xl leading-none tracking-tight font-semibold break-words">
			{data.item.assetname}
		</h1>

		<h1 class="text-xl leading-none tracking-tight font-semibold">
			Hexagon {depluralize(itemName)}
		</h1>
	</div>

	<div class="flex flex-row gap-x-8 lg:flex-nowrap flex-wrap">
		<Avatar
			css="w-full lg:w-1/3 aspect-square h-fit rounded-xl"
			itemName={data.item.assetname}
			itemId={itemid}
			disable3d={data.item.moderationstate !== 'approved'
				? true
				: data.item.assetType === 'audio'
					? true
					: data.item.assetType === 'decals'
						? true
						: data.item.assetType === 'images'
							? true
							: data.item.assetType === 'faces'
								? true
								: false}
		/>

		<div class="flex flex-col gap-y-4 w-1/3">
			<div class="flex flex-row gap-x-4">
				<a href="/users/{data.item.creatoruserid}/profile">
					<UserAvatar
						css="w-20 h-20 rounded-xl"
						userid={data.item.creatoruserid}
						username={data.item.author.username}
						type="avatar"
						disable3d={true}
					/></a
				>

				<div class="flex flex-col gap-y-2">
					<h1 class="text-sm text-muted-foreground">
						Creator: <a href="/users/{data.item.creatoruserid}/profile"
							><span class="text-primary hover:underline">{data.item.author.username}</span></a
						>
					</h1>
					<h1 class="text-sm text-muted-foreground">
						Created: <span class="text-primary"
							>{data.item.created.toLocaleDateString('en-US')}</span
						>
					</h1>
					<h1 class="text-sm text-muted-foreground">
						Updated: <span class="text-primary">{relativeTime.from(data.item.updated)}</span>
					</h1>
				</div>
			</div>
			<h1 class="text-lg leading-relaxed tracking-tight max-h-96 overflow-y-auto">
				{data.item.description ?? ''}
			</h1>
			<ReportButton />
			<Separator />

			<h1 class="text-sm text-muted-foreground">Genres:</h1>
			{#each data.item.genres as genre}
				<Genre {genre} />
			{/each}
			{#if data.item.gearattributes}
				<h1 class="text-sm text-muted-foreground">Gear Attributes:</h1>
				{#each data.item.gearattributes as attribute}
					<GearAttributes {attribute} />
				{/each}
			{/if}
		</div>

		<div class="flex w-1/3 flex-col gap-y-4">
			<Card.Root
				class="text-center px-4 mx-4 rounded-xl supports-backdrop-blur:bg-background/60 bg-muted-foreground/5"
			>
				<Card.Header>
					<Card.Title class="flex mx-auto"
						>Price:
						<MoonStar class="h-4 " />
						{#if data.item.price === 0}
							Free
						{:else}
							{data.item.price}
						{/if}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<AlertDialog.Root closeOnOutsideClick={true}>
						<AlertDialog.Trigger asChild let:builder>
							{#if !data.alreadyOwned && data.user.coins >= (data.item.price ?? 0)}
								{#if data.item.price === 0}
									<Button builders={[builder]} class="w-full font-semibold text-lg">Free</Button>
								{:else}
									<Button builders={[builder]} class="w-full font-semibold text-lg"
										>Buy with <MoonStar class="h-4 " /></Button
									>
								{/if}
							{:else if data.alreadyOwned}
								<Button builders={[builder]} class="w-full font-semibold text-lg" disabled
									>Already Owned</Button
								>
							{:else if data.item.price ?? 0 > data.user.coins}
								<Button builders={[builder]} class="w-full font-semibold text-lg" disabled
									>Not Enough <MoonStar class="h-4 " /></Button
								>
							{/if}
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title class="text-xl font-semibold"
									>Buy Item
									<Separator />
								</AlertDialog.Title>
								<AlertDialog.Description class="text-lg flex flex-col gap-y-4">
									<div class="flex flex-row line-clamp-2 break-all">
										Would you like to buy the Asset "{data.item.assetname}" for
										<span class="text-primary flex flex-row align-middle"
											><MoonStar class="h-4 my-auto " />
											{data.item.price}</span
										>?
									</div>
									<img
										src={'/Images/iconplaceholder.png'}
										alt={data.item.assetname}
										class="mx-auto aspect-square w-40 rounded-xl"
									/>
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer class="mx-auto">
								<AlertDialog.Action disabled={purchasing} on:click={purchase}
									>Buy Now</AlertDialog.Action
								>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
					<Card.Description class="text-lg pt-4"
						>({formatCompactNumber(data.item.sales)} Sold)</Card.Description
					>
				</Card.Content>
			</Card.Root>
			<h1 class="text-lg font-semibold flex align-middle mx-auto gap-x-1 text-yellow-400">
				<Star class="hover:fill-yellow-400" size={28} /> 0
			</h1>
		</div>
	</div>

	<div class="flex flex-col gap-y-4">
		<h1 class="text-xl leading-none tracking-tight font-semibold">Recommendations</h1>
		<Separator />

		<div class="flex flex-row flex-wrap gap-8">
			{#if data.recommendations.length > 0}
				{#each data.recommendations as item}
					<div class="text-center text-lg w-40">
						<a href="/catalog/{item.assetid}/{slugify(item.assetname)}">
							<Avatar
								css="w-40 h-40 rounded-xl aspect-square"
								itemId={item.assetid}
								itemName={item.assetname}
								disable3d={true}
							/></a
						>
						<a href="/catalog/{item.assetid}/{slugify(item.assetname)}">
							<h1 class="line-clamp-2 tracking-tighter break-words text-xl hover:underline">
								{item.assetname}
							</h1></a
						>

						<h1 class="text-base text-muted-foreground mt-2 line-clamp-2">
							Creator: <a href="/users/{item.creatoruserid}/profile"
								><span class="text-primary hover:underline">{item.author.username}</span></a
							>
						</h1>
					</div>
				{/each}
			{:else}
				<EmptyCard />
			{/if}
		</div>
	</div>
</div>
