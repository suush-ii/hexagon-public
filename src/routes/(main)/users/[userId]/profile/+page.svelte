<script lang="ts">
	import Avatar from '$src/components/users/avatar.svelte'

	import { page } from '$app/stores'

	import { stateTextMap } from '$lib/utils'

	import { Separator } from '$src/components/ui/separator'

	import RelativeTime from '@yaireo/relative-time'

	const relativeTime = new RelativeTime()

	import type { PageData } from './$types'

	export let data: PageData

	$: status = data.status

	$: userid = data.userid

	$: username = data.username

	$: textColor = stateTextMap[status]

	import { pageName } from '$src/stores'

	pageName.set(username)
</script>

<div class="container p-4 flex flex-col gap-y-4 pt-8">
	<div
		class="flex flex-row gap-x-4 bg-muted-foreground/5 p-6 rounded-xl outline-dashed outline-muted-foreground/20"
	>
		<Avatar state={status} {userid} {username} />

		<h1 class="font-semibold text-5xl">{username}</h1>
	</div>

	<div class="flex flex-row h-full">
		<div class="w-1/2 flex flex-col gap-y-4 h-full">
			<Separator class="w-full" />
			<h1 class="text-3xl font-semibold tracking-tight w-1/2">About {username}</h1>
			<div
				class="bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl p-6 gap-y-4 flex flex-col"
			>
				<div class="mx-auto flex flex-col">
					{#if status == 'online'}
						<h1 class="text-lg {textColor} mx-auto">[ Online: Website ]</h1>
					{:else if status == 'offline'}
						<h1 class="text-lg {textColor} mx-auto">[ Offline ]</h1>
					{:else if status == 'game'}
						<h1 class="text-lg {textColor} mx-auto hover:underline">
							[ Online: <a href="/games/1">sdf</a> ]
						</h1>
					{:else if status == 'studio'}
						<h1 class="text-lg {textColor} mx-auto">[ Online: Studio ]</h1>
					{/if}
					<h1 class="text-lg {textColor} mx-auto hover:underline">
						<a href={$page.url.toString()}>{$page.url}</a>
					</h1>
				</div>
				<!--<Avatar2.Root class="w-80 h-80 mx-auto">
				<Avatar2.Image
					src="https://tr.rbxcdn.com/30DAY-Avatar-1AA774E499A132625B5A5CCA287E57BB-Png/352/352/Avatar/Png/noFilter"
					alt={data.username}
				/>
			</Avatar2.Root>-->

				<Avatar
					state={status}
					{userid}
					{username}
					css={'xl:h-80 h-fit w-full max-w-80 aspect-square'}
					type="avatar"
				/>

				<p class="mx-auto line-clamp-6 break-words">Hi!</p>

				<Separator class="mt-2" />

				<div class="w-full flex flex-row flex-wrap justify-around text-center">
					<div>
						<p class="font-bold text-muted-foreground">Join Date</p>
						<p>{data.joindate.toLocaleDateString('en-US')}</p>
					</div>

					<div>
						<p class="font-bold text-muted-foreground">Last Online</p>
						<p>{relativeTime.from(data.lastactivetime)}</p>
					</div>
				</div>

				<Separator class="mt-2" />
			</div>

			<Separator class="w-full" />
			<div />
		</div>

		<Separator orientation="vertical" class="h-full mx-4" />

		<div class="w-1/2 flex flex-col gap-y-4 h-full">
			<Separator class="w-full" />
			<h1 class="text-3xl font-semibold tracking-tight w-1/2">Active Places</h1>
			<div
				class="h-full bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl"
			/>

			<h1 class="text-3xl font-semibold tracking-tight w-1/2">{username}'s Friends!</h1>

			<div
				class="h-full bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl"
			/>

			<Separator class="w-full" />
		</div>
	</div>
</div>
