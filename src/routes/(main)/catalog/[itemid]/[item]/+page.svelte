<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import { MoonStar, Box, Webhook, Star } from 'lucide-svelte'

	import { Button } from '$src/components/ui/button'
	import { Separator } from '$src/components/ui/separator'
	import * as Card from '$src/components/ui/card'
	import ReportButton from '$src/components/reportButton.svelte'

	import RelativeTime from '@yaireo/relative-time'

	const relativeTime = new RelativeTime()

	import type { PageData } from './$types'

	export let data: PageData

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
			<h1 class="text-sm text-muted-foreground">Gear Attributes:</h1>
			<!--TODO: do a better way to configure icons for these probably a json and associate htem with icons ez-->
			<!--Important to list these for gears only-->
			<h1 class="text-sm flex items-center gap-x-1">
				<Webhook />Social Item
			</h1>
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
					<Button class="w-full font-semibold text-lg">Buy with <MoonStar class="h-4 " /></Button>
					<Card.Description class="text-lg pt-4">({data.item.sales} Sold)</Card.Description>
				</Card.Content>
			</Card.Root>
			<h1 class="text-lg font-semibold flex align-middle mx-auto gap-x-1 text-yellow-400">
				<Star class="hover:fill-yellow-400" size={28} /> 0
			</h1>
		</div>
	</div>
</div>
