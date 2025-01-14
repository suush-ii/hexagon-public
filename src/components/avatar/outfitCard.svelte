<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import { invalidateAll } from '$app/navigation'
	import { Button } from '$src/components/ui/button'
	import { toast } from 'svelte-sonner'
	import { Cog, ChevronDown } from 'lucide-svelte'
	import * as DropdownMenu from '$src/components/ui/dropdown-menu'

	const Key = 'thumbnails'

	import { s3Url } from '$src/stores'

	export let outfitName: string

	export let outfitId: number

	export let outfitUrl: string

	export let created: Date

	export let trig: boolean

	async function update(action: string) {
		const response = await fetch(`/api/avatar/outfit`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ outfitId, action })
		})

		const json = await response.json()

		if (json.success === false) {
			toast.error(json.message)
		} else {
			toast.success('Successfully updated avatar!')
			invalidateAll()
		}

		invalidateAll()

		if (action === 'wear') {
			trig = !trig
		}
	}
</script>

<div class="w-24 2xl:w-32 relative">
	<Avatar.Root class="w-24 2xl:w-32 2xl:h-32 rounded-xl aspect-square">
		<Avatar.Image src={`https://${s3Url}/${Key}/${outfitUrl}`} alt={outfitName} loading="lazy" />
		<Avatar.Fallback />
	</Avatar.Root>

	<h1 class="w-24 2xl:w-32 truncate font-bold text-left">
		{outfitName}
	</h1>

	<h5 class="text-left">Created:</h5>
	<h5 class="text-left">{created.toLocaleDateString('en-US')}</h5>

	<DropdownMenu.Root preventScroll={false}>
		<DropdownMenu.Trigger asChild let:builder>
			<Button
				builders={[builder]}
				variant="outline"
				class="text-lg absolute top-0 right-0"
				size="icon"
			>
				<div class="flex items-center gap-x-1">
					<Cog class="w-5" />
					<ChevronDown class="w-5" />
				</div>
			</Button>

			<DropdownMenu.Content align="start">
				<DropdownMenu.Item
					class="cursor-pointer"
					on:click={() => {
						update('wear')
					}}>Wear</DropdownMenu.Item
				>
				<DropdownMenu.Item
					class="cursor-pointer"
					on:click={() => {
						update('update')
					}}>Update</DropdownMenu.Item
				>
				<DropdownMenu.Item
					class="cursor-pointer"
					on:click={() => {
						update('delete')
					}}>Delete</DropdownMenu.Item
				>
			</DropdownMenu.Content>
		</DropdownMenu.Trigger>
	</DropdownMenu.Root>
</div>
