<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import { onMount } from 'svelte'

	export let type: 'skyscraper' | 'banner' | 'rectangle'

	$: src = ''

	$: useradid = 0

	async function fetchAds() {
		const res = await fetch('/api/userimages?type=' + type)

		const data = await res.json()

		src = data.url

		if (data.useradid !== 0) {
			useradid = data.useradid
		}
	}

	onMount(() => {
		fetchAds()
	})
</script>

<a target="_blank" href="/userads/{useradid}">
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
