<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import type { userState } from '$lib/types'
	import { Button } from '$src/components/ui/button'
	import { stateOutlineMap } from '$lib/utils'
	import { Canvas, extend } from '@threlte/core'
	import Scene from '$src/components/_3d/Scene.svelte'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
	import { Crown, Loader2 } from 'lucide-svelte'
	import { browser } from '$app/environment'
	import { loadedImages } from '$src/stores'

	extend({
		OrbitControls
	})

	export let state: userState = 'online'
	export let userid: number // TODO: fetch
	export let type: 'headshot' | 'avatar' = 'headshot'
	export let username: string = ''

	export let css: string = ''

	export let dimension: '3D' | '2D' = '2D'

	export let disable3d = false

	export let disableoutline = false

	$: outline = stateOutlineMap[state]

	if (browser && !disable3d) {
		dimension = localStorage.getItem('profileAvatarMode') === '3D' ? '3D' : '2D' // get preferred dimension
	}

	let attempt = 0

	export let trig = false

	$: trig, (attempt = 0)

	$: trig, refresh()

	let srcOveride: string

	function refresh() {
		const foundImage = $loadedImages.find(
			(img) => img.assetid === userid && img.asset === 'user' && img.type === type
		)
		if (foundImage) {
			$loadedImages = $loadedImages.filter((img) => img !== foundImage)
		}
	}

	async function fetchAvatar(d: boolean, userid: number) {
		if (attempt <= 3) {
			const foundImage = $loadedImages.find(
				(img) => img.assetid === userid && img.asset === 'user' && img.type === type
			)
			if (foundImage) {
				if (new Date().valueOf() - foundImage.time.valueOf() > 1 * 60 * 1000) {
					// 1 minute expiration

					$loadedImages = $loadedImages.filter((img) => img !== foundImage)
				} else {
					srcOveride = foundImage.url

					return foundImage.url
				}
			}

			const thumbnailResponse = await fetch('/api/avatarthumbnail', {
				method: 'POST',
				body: JSON.stringify({
					assetid: userid,
					type,
					asset: 'user'
				})
			})
			const thumbnail = await thumbnailResponse.json()

			if (thumbnail.success && thumbnail.data.url !== '') {
				$loadedImages.push({
					url: thumbnail.data.url,
					type,
					assetid: userid,
					asset: 'user',
					time: new Date()
				})

				// fixes bug where users can quickly change avatars and the old one tries to load

				srcOveride = thumbnail.data.url

				return thumbnail.data.url
			}

			if (thumbnail.success && thumbnail.data.url === '') {
				//generating still
				await new Promise((resolve) => setTimeout(resolve, 500))
				fetchAvatar(d, userid)
				attempt += 1
			}
		}
	}

	async function fetchAvatarObj(d: boolean, userid: number) {
		if (attempt <= 3) {
			const thumbnailResponse = await fetch('/api/avatarthumbnail', {
				method: 'POST',
				body: JSON.stringify({
					assetid: userid,
					type: 'obj',
					asset: 'user'
				})
			})
			const thumbnail = await thumbnailResponse.json()

			if (thumbnail.success) {
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
				fetchAvatarObj(d, userid)
				attempt += 1
			}
		}
	}
</script>

{#if type === 'headshot'}
	<div class="flex flex-col gap-y-1 relative">
		{#if state === 'winner'}
			<Crown
				class="absolute h-10 z-50 mx-auto w-full text-yellow-500 -top-5 fill-yellow-500 rotate-6 left-2"
			/>
		{/if}

		<Avatar.Root
			class="w-28 h-28 outline-offset-4 {css} {outline} {disableoutline === true
				? ''
				: 'outline-dashed'} rounded-full"
		>
			{#await fetchAvatar(trig, userid) then src}
				<Avatar.Image {src} alt={username} />
			{/await}
			<Avatar.Fallback />
		</Avatar.Root>
	</div>
{:else if type === 'avatar'}
	<div class="flex gap-x-1 relative">
		<div class="w-28 h-28 {css} mx-auto relative" id="int-target">
			{#if dimension === '2D'}
				{#await fetchAvatar(trig, userid)}
					<Loader2 class="w-full h-full animate-spin text-secondary" />
				{:then src}
					<Avatar.Root class="w-28 h-28 {css} mx-auto ">
						<Avatar.Image src={srcOveride ? srcOveride : src} alt={username} {...$$restProps} />
						<Avatar.Fallback />
					</Avatar.Root>
				{/await}
			{:else}
				{#await fetchAvatarObj(trig, userid)}
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
					localStorage.setItem('profileAvatarMode', dimension)
					attempt = 0
				}}>{dimension === '2D' ? '3D' : '2D'}</Button
			>{/if}
	</div>
{/if}
