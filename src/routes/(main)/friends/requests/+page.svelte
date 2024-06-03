<script lang="ts">
	import type { PageData } from './$types'

	import FriendCard from '$src/components/friends/friendCard.svelte'

	export let data: PageData
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">
		Friend Requests ({data.requestCount})
	</h1>

	<div class="flex gap-4 flex-wrap w-full">
		{#each data.requests as request}
			<FriendCard
				state={request.status}
				userid={request.sender.userid}
				username={request.sender.username}
			/>
		{/each}
	</div>
</div>
