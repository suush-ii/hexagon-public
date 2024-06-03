<script lang="ts">
	import Avatar from '$src/components/users/avatar.svelte'
	import { Button } from '$src/components/ui/button'
	import type { userState } from '$lib/types'
	import { friend as friendLib } from '$lib/friend'
	import { invalidateAll } from '$app/navigation'

	export let userid: number

	export let username: string

	export let state: userState

	async function friend(friend: boolean) {
		await friendLib(friend, userid)

		invalidateAll()
	}
</script>

<div
	class="flex flex-col gap-y-4 p-6 supports-backdrop-blur:bg-background/60 border-b bg-muted-foreground/5 shadow-sm backdrop-blur w-[26rem]"
>
	<div class="flex gap-x-4">
		<Avatar {state} {userid} {username} />

		<h1 class="text-xl truncate">{username}</h1>
	</div>

	<div class="flex gap-x-4 justify-around">
		<Button
			on:click={() => {
				friend(false)
			}}
			class="w-full"
			variant="outline">Ignore</Button
		>
		<Button
			on:click={() => {
				friend(true)
			}}
			class="w-full">Accept</Button
		>
	</div>
</div>
