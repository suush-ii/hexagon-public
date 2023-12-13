<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import type { userState } from '$lib/types'

	export let state: userState
	export let userid: number // TODO: fetch
	export let size = 28
	export let type: 'headshot' | 'avatar' = 'headshot'
	export let username: string = ''

	let css: string

	if (state === 'online') {
		css = 'outline-blue-500'
	} else if (state === 'game') {
		css = 'outline-success'
	} else if (state === 'studio') {
		css = 'outline-orange'
	} else {
		css = 'outline-muted-foreground/70'
	}
</script>

{#if type === 'headshot'}
	<div class="flex flex-col gap-y-1">
		<Avatar.Root
			class="{size === 28
				? 'w-28 h-28'
				: `w-${size} h-${size}`} outline-offset-4 {css} outline-dashed rounded-full"
		>
			<Avatar.Image
				src="https://avaatars.githubusercontent.com/u/54828677?v=4{userid}"
				alt={username}
			/>
			<Avatar.Fallback />
		</Avatar.Root>
	</div>
{:else if type === 'avatar'}
	<div class="flex flex-col gap-y-1">
		<Avatar.Root class="{size === 28 ? 'w-28 h-28' : `w-${size} h-${size}`} mx-auto">
			<Avatar.Image
				src="https://avaatars.githubusercontent.com/u/54828677?v=4{userid}"
				alt={username}
			/>
			<Avatar.Fallback />
		</Avatar.Root>
	</div>
{/if}
