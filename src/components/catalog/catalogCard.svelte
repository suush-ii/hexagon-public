<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import { MoonStar } from 'lucide-svelte'

	import { slugify } from '$lib/utils'

	export let itemName: string

	export let itemId: number

	export let cost: number
</script>

<a href="/catalog/{itemId}/{slugify(itemName)}"
	><div
		class="flex flex-col w-32 group hover:outline-dashed outline-muted-foreground/20 outline-offset-8"
	>
		<Avatar.Root class="w-32 h-32 rounded-xl">
			<Avatar.Image src={'/Images/iconplaceholder.png'} alt={itemName} loading="lazy" />
			<Avatar.Fallback />
		</Avatar.Root>
		<h1 class="line-clamp-2 tracking-tighter break-words text-xl hover:underline">{itemName}</h1>
		<h1 class="tracking-tighter truncate text-sm flex flex-row">
			<MoonStar class="h-5" />{cost}
		</h1>
		<div class="hidden group-hover:flex text-xs pt-2 flex-col gap-y-1">
			<h5>
				Creator: <a href="/users/1/profile">Sushi</a>
			</h5>
			<h5>Updated: 2 days ago</h5>
			<h5>Sales: 0</h5>
			<h5>Favorited: 1 time</h5>
		</div>
	</div></a
>
