<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import type { userState } from '$lib/types'

	export let state: userState
	export let userid: number // TODO: fetch
	export let type: 'headshot' | 'avatar' = 'headshot'
	export let username: string = ''

	export let css: string = ''

	let outline: string

	if (state === 'online') {
		outline = 'outline-blue-500'
	} else if (state === 'game') {
		outline = 'outline-success'
	} else if (state === 'studio') {
		outline = 'outline-orange'
	} else {
		outline = 'outline-muted-foreground/70'
	}
</script>

{#if type === 'headshot'}
	<div class="flex flex-col gap-y-1">
		<Avatar.Root class="w-28 h-28 outline-offset-4 {css} {outline} outline-dashed rounded-full">
			<Avatar.Image
				src="https://avaatars.githubusercontent.com/u/54828677?v=4{userid}"
				alt={username}
			/>
			<Avatar.Fallback />
		</Avatar.Root>
	</div>
{:else if type === 'avatar'}
	<div class="flex flex-col gap-y-1">
		<Avatar.Root class="w-28 h-28 {css} mx-auto">
			<Avatar.Image
				src="https://avaatars.githubusercontent.com/u/54828677?v=4{userid}"
				alt={username}
				{...$$restProps}
			/>
			<Avatar.Fallback />
		</Avatar.Root>
	</div>
{/if}
