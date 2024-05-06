<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import { Loader2 } from 'lucide-svelte'
	import { browser } from '$app/environment'
	import { Canvas, extend } from '@threlte/core'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
	import Scene from '$src/components/_3d/Scene.svelte'
	import { Button } from '$src/components/ui/button'

	extend({
		OrbitControls
	})

	export let itemId: number // TODO: fetch
	export let itemName: string = ''

	export let css: string = ''

	let attempt = 0

	let dimension: '3D' | '2D' = '2D'

	export let disable3d = false

	if (browser && !disable3d) {
		dimension = localStorage.getItem('itemAvatarMode') === '3D' ? '3D' : '2D' // get preferred dimension
	}

	let src: string | undefined

	$: itemId, (src = undefined)

	async function fetchAvatar(itemId: number) {
		if (attempt <= 3) {
			const thumbnailResponse = await fetch('/api/avatarthumbnail', {
				method: 'POST',
				body: JSON.stringify({
					assetid: itemId,
					type: 'avatar',
					asset: 'item'
				})
			})
			const thumbnail = await thumbnailResponse.json()

			if (thumbnail.success && thumbnail.data.url !== '') {
				src = thumbnail.data.url
				return thumbnail.data.url
			}

			if (thumbnail.success && thumbnail.data.url === '') {
				//generating still
				await new Promise((resolve) => setTimeout(resolve, 5000))
				fetchAvatar(itemId)
				attempt += 1
			}
		}
	}

	async function fetchAvatarObj(itemId: number) {
		if (attempt <= 3) {
			const thumbnailResponse = await fetch('/api/avatarthumbnail', {
				method: 'POST',
				body: JSON.stringify({
					assetid: itemId,
					type: 'obj',
					asset: 'item'
				})
			})
			const thumbnail = await thumbnailResponse.json()

			console.log('meow')

			if (thumbnail.success) {
				console.log('meow2')
				const objResponse = await fetch(thumbnail.data.url, {
					headers: {
						Accept: 'application/json'
					}
				})
				const objJson = await objResponse.json()

				return objJson
			}

			if (thumbnail.success && thumbnail.data.url === '') {
				//generating still
				await new Promise((resolve) => setTimeout(resolve, 500))
				fetchAvatarObj(itemId)
				attempt += 1
			}
		}
	}
</script>

<div class="flex gap-x-1 relative {css}">
	<div class="h-full mx-auto relative" id="int-target">
		{#if dimension === '2D'}
			{#if src}
				<Avatar.Root class="w-full mx-auto aspect-square h-full rounded-xl">
					<Avatar.Image {src} alt={itemName} {...$$restProps} />
					<Avatar.Fallback />
				</Avatar.Root>
			{:else}
				{#await fetchAvatar(itemId)}
					<Loader2 class="w-full h-full animate-spin text-secondary " />
				{:then src}
					<Avatar.Root class="w-full mx-auto aspect-square h-full rounded-xl">
						<Avatar.Image {src} alt={itemName} {...$$restProps} />
						<Avatar.Fallback />
					</Avatar.Root>
				{/await}
			{/if}
		{:else}
			{#await fetchAvatarObj(itemId)}
				<Loader2 class="w-full h-full animate-spin text-secondary" />
			{:then objManifest}
				<Canvas renderMode={'always'}>
					<Scene {objManifest} />
				</Canvas>
			{/await}
		{/if}
	</div>
	{#if !disable3d}
		<Button
			class="absolute right-0"
			on:click={() => {
				dimension === '3D' ? (dimension = '2D') : (dimension = '3D')
				localStorage.setItem('itemAvatarMode', dimension)
				attempt = 0
			}}>{dimension === '2D' ? '3D' : '2D'}</Button
		>{/if}
</div>
