<script lang="ts">
	import Avatar from '$src/components/catalog/avatar.svelte'
	import { MoonStar } from 'lucide-svelte'
	import { formatCompactNumber, slugify } from '$lib/utils'
	import { Button } from '../ui/button'
	import { toast } from 'svelte-sonner'
	import { invalidateAll } from '$app/navigation'

	export let assetid: number
	export let assetname: string
	export let price: number
	export let own: unknown

	let purchasing = false

	async function purchase() {
		purchasing = true

		const response = await fetch(`/api/purchase`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				itemid: assetid
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
</script>

<div
	class="flex flex-col w-24 2xl:w-32 group hover:outline-dashed outline-muted-foreground/20 outline-offset-8 gap-y-4"
>
	<a href="/catalog/{assetid}/{slugify(assetname)}">
		<Avatar
			css="w-24 h-24 2xl:w-32 2xl:h-32 rounded-xl aspect-square"
			itemId={assetid}
			itemName={assetname}
			disable3d={true}
		></Avatar>
		<h1 class="line-clamp-2 tracking-tighter break-words 2xl:text-xl hover:underline">
			{assetname}
		</h1>
		<h1 class="tracking-tighter truncate text-sm flex flex-row">
			<MoonStar class="h-5" />{formatCompactNumber(price, false)}
		</h1>
	</a>
	{#if own}
		<Button variant="minimal" disabled={true}>Owned</Button>
	{:else}
		<Button disabled={purchasing} on:click={purchase}>Buy</Button>
	{/if}
</div>
