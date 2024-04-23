<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'
	import type { userState } from '$lib/types'
	import { Button } from '$src/components/ui/button'
	import { stateOutlineMap } from '$lib/utils'
	import { Canvas, extend } from '@threlte/core'
	import Scene from './Scene.svelte'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
	import { Loader2 } from 'lucide-svelte'
	import { browser } from '$app/environment'

	extend({
		OrbitControls
	})

	export let state: userState
	export let userid: number // TODO: fetch
	export let type: 'headshot' | 'avatar' | 'obj' = 'headshot'
	export let username: string = ''

	export let css: string = ''

	let dimension: '3D' | '2D' = '2D'

	const outline = stateOutlineMap[state]

	if (browser) {
		dimension = localStorage.getItem('profileAvatarMode') === '3D' ? '3D' : '2D' // get preferred dimension
	}

	let attempt = 0

	async function fetchAvatar() {
		if (attempt <= 3) {
			const thumbnailResponse = await fetch('/api/avatarthumbnail', {
				method: 'POST',
				body: JSON.stringify({
					userid,
					type
				})
			})
			const thumbnail = await thumbnailResponse.json()

			if (thumbnail.success) {
				return thumbnail.data.url
			}

			if (thumbnail.success && thumbnail.data.url === '') {
				//generating still
				await new Promise((resolve) => setTimeout(resolve, 5000))
				fetchAvatar()
				attempt += 1
			}
		}
	}

	async function fetchAvatarObj() {
		if (attempt <= 3) {
			const thumbnailResponse = await fetch('/api/avatarthumbnail', {
				method: 'POST',
				body: JSON.stringify({
					userid,
					type: 'obj'
				})
			})
			const thumbnail = await thumbnailResponse.json()

			console.log('meow')

			console.log(thumbnail.data.url)

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
				await new Promise((resolve) => setTimeout(resolve, 5000))
				fetchAvatar()
				attempt += 1
			}
		}
	}
</script>

{#if type === 'headshot'}
	<div class="flex flex-col gap-y-1">
		<Avatar.Root class="w-28 h-28 outline-offset-4 {css} {outline} outline-dashed rounded-full">
			{#await fetchAvatar() then src}
				<Avatar.Image {src} alt={username} />
			{/await}
			<Avatar.Fallback />
		</Avatar.Root>
	</div>
{:else if type === 'avatar'}
	<div class="flex gap-x-1 relative">
		<div class="w-28 h-28 {css} mx-auto relative" id="int-target">
			{#if dimension === '2D'}
				{#await fetchAvatar()}
					<Loader2 class="w-full h-full animate-spin text-secondary" />
				{:then src}
					<Avatar.Root class="w-28 h-28 {css} mx-auto ">
						<Avatar.Image {src} alt={username} {...$$restProps} />
						<Avatar.Fallback />
					</Avatar.Root>
				{/await}
			{:else}
				{#await fetchAvatarObj()}
					<Loader2 class="w-full h-full animate-spin text-secondary" />
				{:then objManifest}
					<Canvas renderMode={'always'}>
						<Scene {objManifest} />
					</Canvas>
				{/await}
			{/if}
		</div>
		<Button
			class="absolute right-0"
			on:click={() => {
				dimension === '3D' ? (dimension = '2D') : (dimension = '3D')
				localStorage.setItem('profileAvatarMode', dimension)
			}}>{dimension === '2D' ? '3D' : '2D'}</Button
		>
	</div>
{/if}
