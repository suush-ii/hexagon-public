<script lang="ts">
	import { Heart } from 'lucide-svelte'
	import { Separator } from '$src/components/ui/separator'

	let pages = [
		{ pageUrl: '/legal/privacy', friendlyName: 'Privacy' },
		{ pageUrl: '/legal/terms', friendlyName: 'Terms' }
	]
</script>

<footer
	class="supports-backdrop-blur:bg-background/60 w-full h-40 border-b bg-muted-foreground/5 shadow-sm flex p-16 items-center mt-4"
>
	<div class="mx-auto flex flex-col gap-y-4 w-full">
		<div class="mx-auto flex gap-x-24 text-muted-foreground">
			{#each pages as page}
				<a href={page.pageUrl}
					><h1 class="text-2xl font-semibold hover:text-white transition-colors ease-in-out">
						{page.friendlyName}
					</h1></a
				>
			{/each}
		</div>

		<Separator />

		<div class="mx-auto flex gap-x-4">
			<img alt="H" class="w-12 h-12" src={'/hexagon512.png'} />
			<Heart
				class="w-6 h-6 my-auto text-muted-foreground hover:text-white transition-colors ease-in-out"
			/>
		</div>
	</div>
</footer>
