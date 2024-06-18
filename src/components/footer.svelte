<script lang="ts">
	import { Heart, Globe } from 'lucide-svelte'
	import { Separator } from '$src/components/ui/separator'
	import * as Select from '$src/components/ui/select'

	let pages = [
		{ pageUrl: '/legal/privacy', friendlyName: 'Privacy' },
		{ pageUrl: '/legal/terms', friendlyName: 'Terms' }
	]

	$: selected = {
		label: 'English',
		value: 'en'
	}

	let languages = [
		{ value: 'en', label: 'English' },
		{ value: 'es', label: 'Español' }
	]
</script>

<footer
	class="supports-backdrop-blur:bg-background/60 w-full h-40 border-b bg-muted-foreground/5 shadow-sm flex p-16 items-center mt-4"
>
	<div class="mx-auto flex flex-col gap-y-4 w-full">
		<div class="mx-auto flex gap-x-24 text-muted-foreground">
			{#each pages as page}
				<a href={page.pageUrl}
					><h1 class="text-xl font-semibold hover:text-white transition-colors ease-in-out">
						{page.friendlyName}
					</h1></a
				>
			{/each}
		</div>

		<Separator />

		<div class="mx-auto flex gap-x-4 items-center">
			<Select.Root bind:selected disabled>
				<Select.Trigger class="w-[120px] gap-x-2 justify-end">
					<Globe class="w-4 h-4" />
					<Select.Value />
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each languages as language}
							<Select.Item value={language.value} label={language.label}
								>{language.label}</Select.Item
							>
						{/each}
					</Select.Group>
				</Select.Content>
				<Select.Input name="genre" />
			</Select.Root>
			<div class="flex gap-x-4 mx-auto">
				<img alt="H" class="w-12 h-12" src={'/hexagon512.png'} />

				<Separator orientation="vertical" class="h-12" />
				<Heart
					class="w-6 h-6 my-auto text-muted-foreground hover:text-white transition-colors ease-in-out"
				/>
			</div>
			<div class="w-[150px]"></div>
		</div>
	</div>
</footer>
