<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import type { userState } from '$lib/types'

	export let username: string
	export let state: userState
	export let userid: number // TODO: fetch

	let css: string

	if (state === 'online') {
		css = 'outline-blue-500'
	} else if (state === 'game') {
		css = 'outline-success'
	} else if (state === 'studio') {
		css = 'outline-orange-500'
	} else {
		css = 'outline-muted-foreground/70'
	}
</script>

<div class="flex flex-col gap-y-1">
	<Avatar.Root class="w-24 h-24 outline-offset-4 {css} outline-dashed rounded-full">
		<Avatar.Image
			src="https://avaatars.githubusercontent.com/u/54828677?v=4{userid}"
			alt="@sushidesigner"
		/>
		<Avatar.Fallback />
	</Avatar.Root>
	<p class="truncate w-24 text-center">{username}</p>
</div>
