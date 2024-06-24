<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { formatCompactNumber } from '$lib/utils'
	import { Star } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'

	let favoriting = false

	async function favorite() {
		if (!favoriting) {
			favoriting = true

			const response = await fetch(`/api/favorite`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					assetid
				})
			})

			const json = await response.json()

			if (json.success === false) {
				toast.error(json.message)
			} else {
				toast.success(json.message)
				invalidateAll()
			}

			favoriting = false
		}
	}

	export let favorites: number

	export let alreadyFavorited: boolean

	export let assetid: number

	export let game: boolean
</script>

<button
	disabled={favoriting}
	on:click={favorite}
	class="text-lg font-semibold flex align-middle {game
		? 'my-auto'
		: 'mx-auto'} gap-x-1 text-yellow-400 select-none group {favoriting ? 'opacity-40' : ''}"
>
	<Star
		class="group-hover:fill-yellow-400 {alreadyFavorited ? 'fill-yellow-400' : ''} "
		size={28}
	/>
	{formatCompactNumber(favorites, false)}
</button>
