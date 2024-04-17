<script lang="ts">
	import * as Card from '$src/components/ui/card'
	import * as Avatar from '$src/components/ui/avatar'
	import { Button } from '$src/components/ui/button'
	import { Slider } from '$src/components/ui/slider'
	import { Check, Play, X, Pause } from 'lucide-svelte'
	import { s3Url } from '$src/stores'

	import type { assetStates } from '$lib/types'

	export let assetType: string
	export let assetId: number
	export let assetName: string
	export let assetUrl: string | null
	export let creatorUserId: number

	let imageFilter = ''

	export let moderationState: assetStates

	let audioElement: HTMLAudioElement

	let paused = true

	let currentTime = 0

	let duration: number

	$: grah = [currentTime]

	$: vol = [1]

	function movePosition() {
		//time = grah[0]

		//console.log(grah[0] + 'grah')

		//console.log(audioElement.currentTime + 'time')

		if (grah[0] - audioElement.currentTime > 0.05 || grah[0] - audioElement.currentTime < -0.05) {
			audioElement.currentTime = grah[0]
		}
	}

	function changeVolume() {
		audioElement.volume = vol[0]
	}

	export const format = (seconds: number) => {
		const minutes = Math.floor(seconds / 60)
		let newSeconds: number | string = Number(String(Math.floor(seconds % 60)).padStart(2, '0')) // get the last 2 digits and round
		if (newSeconds < 10) newSeconds = `0${newSeconds}`

		return `${minutes}:${newSeconds}`
	}
</script>

<Card.Root class="w-[350px] flex flex-col">
	{#if assetType === 'decals' || assetType === 'images'}
		<Card.Content class="flex flex-row flex-wrap-reverse">
			<Button
				on:click={() => {
					imageFilter === '' ? (imageFilter = 'opacity-0') : (imageFilter = '')
				}}
				variant="outline"
				size="sm"
				class="w-1/3">Hide</Button
			>
			<Button variant="outline" size="sm" class="w-1/3 peer/invert">Invert</Button>
			<Button variant="outline" size="sm" class="w-1/3 peer/brightness">Brightness</Button>
			<!--The css fuckery here is awesome-->
			<Avatar.Root
				class="w-80 h-80 rounded-xl peer-active/invert:invert  peer-active/brightness:brightness-200 {imageFilter}"
			>
				<Avatar.Image src={`https://${s3Url}/${assetType}/${assetUrl}`} loading="lazy" />
			</Avatar.Root>
			<h1 class="text-md mx-auto line-clamp-1 tracking-tighter break-words">{assetName}</h1>
		</Card.Content>
	{:else if assetType === 'audio'}
		<Card.Content class="flex flex-col gap-y-4">
			<h1>Temporary cuz custom is buggy</h1>
			<audio
				controls
				bind:this={audioElement}
				bind:paused
				bind:currentTime
				bind:duration
				bind:volume={vol[0]}
			>
				<source src={`https://${s3Url}/${assetType}/${assetUrl}`} type="audio/mp3" />
				Your browser does not support the audio element.
			</audio>

			<div class="flex flex-row justify-between">
				<span>{format(currentTime)}</span>
				<span>{format(duration)}</span>
			</div>
			<div
				on:pointerdown={() => {
					if (paused === false) {
						audioElement.pause()
					}
				}}
				on:pointerup={() => {
					if (paused === true) {
						audioElement.play()
					}
				}}
			>
				<Slider
					bind:value={grah}
					on:click={() => {
						console.log('test')
					}}
					max={duration}
					step={0.01}
					onValueChange={movePosition}
					class="w-full"
				/>
			</div>

			<Button
				variant="outline"
				on:click={() => {
					paused ? audioElement.play() : audioElement.pause()
				}}
				size="icon"
				class="w-full"
				>{#if paused}<Play class="w-full h-10 fill-white" />{:else}<Pause
						class="w-full h-10 fill-white"
					/>{/if}</Button
			>
			<Slider bind:value={vol} max={1} step={0.1} onValueChange={changeVolume} />
		</Card.Content>
	{/if}

	<Card.Footer class="flex justify-between gap-x-2 mt-auto">
		<a href="/admin/users/moderateuser?id={creatorUserId}&itemId={assetId}" target="_blank"
			><Button
				variant="outline"
				on:click={() => (moderationState = 'rejected')}
				class="bg-destructive w-full">Punish</Button
			></a
		>
		<Button
			variant="outline"
			on:click={() => {
				moderationState = 'rejected'
			}}
			class="w-full"
			>{#if moderationState === 'rejected'}<X />{:else}Deny{/if}</Button
		>
		<Button
			variant="outline"
			on:click={() => {
				moderationState = 'approved'
			}}
			class="bg-success w-full"
			>{#if moderationState === 'approved'}<Check />{:else}Approve{/if}</Button
		>
	</Card.Footer>
</Card.Root>
