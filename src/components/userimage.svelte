<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'

	export let type: 'skyscraper' | 'banner' | 'rectangle'

	$: src = ''

	$: useradid = 0

	$: assetid = 0

	$: title = ''

	async function fetchAds() {
		const res = await fetch('/api/userimages?type=' + type)

		const data = await res.json()

		src = data.url

		title = data.assetname

		if (data.useradid !== 0) {
			useradid = data.useradid

			assetid = data.assetid
		}
	}

	onMount(() => {
		fetchAds()
	})
</script>

<a target="_blank" href="/userads/{useradid}" {title}>
	{#if type === 'skyscraper'}
		<Avatar.Root class="h-[600px] w-[160px] rounded-xl aspect-auto sm:block hidden">
			<Avatar.Image {src} loading="lazy" />
			<Avatar.Fallback />
		</Avatar.Root>
	{:else if type === 'banner'}
		<Avatar.Root
			class="h-[90px] w-full max-w-[728px] rounded-xl mx-auto aspect-auto sm:block hidden"
		>
			<Avatar.Image {src} loading="lazy" />
			<Avatar.Fallback />
		</Avatar.Root>
	{:else if type === 'rectangle'}
		<Avatar.Root
			class="h-[250px] w-full max-w-[300px] rounded-xl mx-auto aspect-auto sm:block hidden"
		>
			<Avatar.Image {src} loading="lazy" />
			<Avatar.Fallback />
		</Avatar.Root>
	{/if}
</a>

{#if $page.data.user.role !== 'normal' && assetid !== 0}
	<a href="/admin/catalog/assetadmin/{assetid}" class="text-center text-xs text-destructive mt-2"
		>Moderate</a
	>
{/if}
