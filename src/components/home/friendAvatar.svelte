<script lang="ts">
	import Avatar from '$src/components/users/avatar.svelte'
	import type { userState } from '$lib/types'

	export let username: string
	export let state: userState
	export let userid: number
</script>

<div class="flex flex-col gap-y-1">
	<Avatar css="w-24 h-24" {state} {userid} {username} />

	<p class="truncate w-24 text-center">{username}</p>
</div>
