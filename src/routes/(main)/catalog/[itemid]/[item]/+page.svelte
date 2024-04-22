<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import { MoonStar, Box, Webhook, Star } from 'lucide-svelte'

	import { Button } from '$src/components/ui/button'
	import { Separator } from '$src/components/ui/separator'
	import * as Card from '$src/components/ui/card'
	import ReportButton from '$src/components/reportButton.svelte'
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { formatCompactNumber } from '$lib/utils'

	import { toast } from 'svelte-sonner'

	import RelativeTime from '@yaireo/relative-time'

	const relativeTime = new RelativeTime()

	import type { PageData } from './$types'
	import { invalidateAll } from '$app/navigation'

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

	const itemName = data.item.assetType.charAt(0).toUpperCase() + data.item.assetType.slice(1)
</script>

<div class="container p-8 flex flex-col gap-y-4">
	<div class="flex flex-col gap-y-4">
		<h1 class="text-5xl leading-none tracking-tight font-semibold break-words">
			{data.item.assetname}
		</h1>

		<h1 class="text-xl leading-none tracking-tight font-semibold">
			Hexagon {itemName === 'Shirts' ? 'Shirt' : itemName}
		</h1>
	</div>

	<div class="flex flex-row gap-x-8 lg:flex-nowrap flex-wrap">
		<Avatar.Root class="w-full lg:w-1/3 aspect-square h-fit rounded-xl">
			<Avatar.Image src={'/Images/iconplaceholder.png'} />
			<Avatar.Fallback />
		</Avatar.Root>

		<div class="flex flex-col gap-y-4 w-1/3">
			<div class="flex flex-row gap-x-4">
				<Avatar.Root class="w-20 h-20 rounded-xl">
					<Avatar.Image src={'/Images/iconplaceholder.png'} />
					<Avatar.Fallback />
				</Avatar.Root>

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
			<h1 class="text-sm flex items-center gap-x-1">
				<Box />All
			</h1>
			{#if data.item.assetType === 'gears'}
				<h1 class="text-sm text-muted-foreground">Gear Attributes:</h1>
				<!--TODO: do a better way to configure icons for these probably a json and associate htem with icons ez-->
				<!--Important to list these for gears only-->
				<h1 class="text-sm flex items-center gap-x-1">
					<Webhook />Social Item
				</h1>
			{/if}
		</div>

		<div class="flex w-1/3 flex-col gap-y-4">
			<Card.Root
				class="text-center px-4 mx-4 rounded-xl supports-backdrop-blur:bg-background/60 bg-muted-foreground/5"
			>
				<Card.Header>
					<Card.Title class="flex mx-auto"
						>Price: <MoonStar class="h-4 " /> {data.item.price}</Card.Title
					>
				</Card.Header>
				<Card.Content>
					<AlertDialog.Root closeOnOutsideClick={true}>
						<AlertDialog.Trigger asChild let:builder>
							{#if !data.alreadyOwned && data.user.coins >= (data.item.price ?? 0)}
								<Button builders={[builder]} class="w-full font-semibold text-lg"
									>Buy with <MoonStar class="h-4 " /></Button
								>
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
</div>
