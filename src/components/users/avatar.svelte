<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import type { userState } from '$lib/types'
	import { stateOutlineMap } from '$lib/utils'
	import { onMount } from 'svelte'

	export let state: userState
	export let userid: number // TODO: fetch
	export let type: 'headshot' | 'avatar' = 'headshot'
	export let username: string = ''

	export let css: string = ''

	let src = ''

	const outline = stateOutlineMap[state]

	let attempt = 0

	async function fetchAvatar() {
		if (attempt <= 3) {
			const thumbnailResponse = await fetch('/api/avatarthumbnail', {
				method: 'POST',
				body: JSON.stringify({ userid, type })
			})
			const thumbnail = await thumbnailResponse.json()

			if (thumbnail.success) {
				src = thumbnail.data.url
				src = src
			}

			if (thumbnail.success && thumbnail.data.url === '') {
				//generating still
				await new Promise((resolve) => setTimeout(resolve, 5000))
				fetchAvatar()
				attempt += 1
			}
		}
	}

	onMount(() => {
		fetchAvatar()
	})
</script>

{#if type === 'headshot'}
	<div class="flex flex-col gap-y-1">
		<Avatar.Root class="w-28 h-28 outline-offset-4 {css} {outline} outline-dashed rounded-full">
			<Avatar.Image {src} alt={username} />
			<Avatar.Fallback />
		</Avatar.Root>
	</div>
{:else if type === 'avatar'}
	<div class="flex flex-col gap-y-1">
		<Avatar.Root class="w-28 h-28 {css} mx-auto ">
			<Avatar.Image {src} alt={username} {...$$restProps} />
			<Avatar.Fallback />
		</Avatar.Root>
	</div>
{/if}
