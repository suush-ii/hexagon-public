<script lang="ts">
	import Avatar from '$src/components/users/avatar.svelte'

	import * as Avatar2 from '$src/components/ui/avatar'

	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="container p-4 flex flex-col gap-y-4 pt-8">
	<div
		class="flex flex-row gap-x-4 bg-muted-foreground/5 p-6 rounded-xl outline-dashed outline-muted-foreground/20"
	>
		<Avatar state={data.status} userid={data.userid} username={data.username} />
		<h1 class="font-semibold text-5xl">{data.username}</h1>
	</div>

	<div class="flex flex-row flex-wrap">
		<h1 class="text-3xl font-semibold tracking-tight w-1/2">About {data.username}</h1>

		<h1 class="text-3xl font-semibold tracking-tight w-1/2">Active Places</h1>
	</div>

	<div class="flex flex-row gap-x-4">
		<div class="w-1/2 flex flex-col gap-y-4">
			<div
				class="bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl p-6 gap-y-4 flex flex-col"
			>
				<h1 class="text-lg text-blue-500 mx-auto">[ Online: Website ]</h1>
				<!--<Avatar2.Root class="w-80 h-80 mx-auto">
				<Avatar2.Image
					src="https://tr.rbxcdn.com/30DAY-Avatar-1AA774E499A132625B5A5CCA287E57BB-Png/352/352/Avatar/Png/noFilter"
					alt={data.username}
				/>
			</Avatar2.Root>-->

				<Avatar
					state={data.status}
					userid={data.userid}
					username={data.username}
					size={80}
					type="avatar"
				/>

				<p class="mx-auto line-clamp-6 break-words">Hi!</p>

				<div class="w-full flex flex-row flex-wrap justify-around text-center">
					<div>
						<p class="font-bold text-muted-foreground">Join Date</p>
						<p>{data.joindate.toLocaleDateString('en-US')}</p>
					</div>

					<div>
						<p class="font-bold text-muted-foreground">Last Online</p>
						<p>{data.lastactivetime.toLocaleString('en-US')}</p>
					</div>
				</div>
			</div>

			<h1 class="text-3xl font-semibold tracking-tight w-1/2">Hexagon Badges!</h1>

			<div />
		</div>

		<div class="w-1/2 flex flex-col gap-y-4">
			<div
				class="h-full bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl"
			/>

			<h1 class="text-3xl font-semibold tracking-tight w-1/2">{data.username}'s Friends!</h1>

			<div
				class="h-full bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl"
			/>
		</div>
	</div>
</div>
