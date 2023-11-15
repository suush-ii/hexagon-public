<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import UserImage from '$src/components/userimage.svelte'

	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<UserImage type="banner" />

	<div class="flex flex-row mx-auto gap-x-4 w-full overflow-hidden">
		<div
			class="flex flex-row flex-wrap gap-x-4 p-4 w-full supports-backdrop-blur:bg-background/60 bg-muted-foreground/5"
		>
			<Avatar.Root class="h-[360px] w-full max-w-[640px] rounded-xl aspect-video">
				<Avatar.Image
					src={data.game.thumbnailurl ? data.game.thumbnailurl : '/Images/thumbnailplaceholder.png'}
					alt={data.game.gamename}
					loading="lazy"
				/>
				<Avatar.Fallback />
			</Avatar.Root>

			<div>
				<h1 class="text-5xl leading-none tracking-tight font-semibold">{data.game.gamename}</h1>

				<h1 class="text-2xl text-muted-foreground">By ...</h1>
			</div>
		</div>

		<UserImage type="skyscraper" />
	</div>
</div>
