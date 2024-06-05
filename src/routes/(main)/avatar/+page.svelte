<script lang="ts">
	import { pageName } from '$src/stores'
	import { colorArray, categoriesArray } from '.'
	import Avatar from '$src/components/users/avatar.svelte'
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import * as Tabs from '$src/components/ui/tabs'
	import { Button } from '$src/components/ui/button'
	import { Separator } from '$src/components/ui/separator'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import AvatarCard from '$src/components/avatar/avatarCard.svelte'

	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	import { page } from '$app/stores'

	$: categoryParams = $page.url.searchParams.get('category') ?? 'hats'

	pageName.set('Avatar')

	import type { PageData } from './$types'
	let open = false
	let redrawing = false

	let bodypart: string

	let bodyparts = {
		Head: 'headColor',
		'Right Arm': 'rightArmColor',
		Torso: 'torsoColor',
		'Left Arm': 'leftArmColor',
		'Right Leg': 'rightLegColor',
		'Left Leg': 'leftLegColor'
	}

	let trig = false

	function changeColor(part: string) {
		bodypart = part
		open = true
	}

	async function saveColor(color: number) {
		open = false

		data.colors[bodyparts[bodypart]] = color

		await fetch(`/api/avatar/setbodycolors`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ colors: data.colors })
		})

		trig = !trig
	}

	async function redraw() {
		if (redrawing === false) {
			redrawing = true

			await fetch(`/api/avatar/redraw`, {
				method: 'POST'
			})

			trig = !trig
			redrawing = false
		}
	}

	function brickColorToBg(color: number | undefined) {
		return colorArray.find((x) => x.number === color)?.color
	}

	export let data: PageData
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Character Customizer</h1>

	<div class="flex flex-row w-full">
		<div class="flex flex-col gap-y-10">
			<h1 class="text-2xl leading-none tracking-tight font-semibold">Avatar</h1>
			<Avatar
				userid={data.user.userid}
				username={data.user.username}
				css={'xl:h-80 h-fit w-full max-w-80 aspect-square'}
				type="avatar"
				bind:trig
				disable3d={true}
			/>
			<div>
				<h2>Something wrong with your avatar?</h2>
				<Button size="lg" variant="minimal" class="!px-0 hover:underline" on:click={redraw}
					>Click here to re-draw it!</Button
				>
			</div>

			<h1 class="text-2xl leading-none tracking-tight font-semibold">Avatar Colors</h1>

			<div>
				<h1 class="text-center">Click a body part to change its color:</h1>

				<div class="relative m-12">
					<button
						on:click={() => {
							changeColor('Head')
						}}
						class="absolute left-[72px] top-0 cursor-pointer w-[44px] h-[44px]"
						style="background-color: {brickColorToBg(data.colors.headColor)};"
					/>

					<button
						on:click={() => {
							changeColor('Right Arm')
						}}
						class="absolute left-0 top-[52px] cursor-pointer w-10 h-[88px]"
						style="background-color: {brickColorToBg(data.colors.rightArmColor)};"
					/>
					<button
						on:click={() => {
							changeColor('Torso')
						}}
						class="absolute left-[48px] top-[52px] cursor-pointer w-[88px] h-[88px]"
						style="background-color: {brickColorToBg(data.colors.torsoColor)};"
					/>
					<button
						on:click={() => {
							changeColor('Left Arm')
						}}
						class="absolute left-[144px] top-[52px] cursor-pointer w-10 h-[88px]"
						style="background-color: {brickColorToBg(data.colors.leftArmColor)};"
					/>
					<button
						on:click={() => {
							changeColor('Right Leg')
						}}
						class="absolute left-[48px] top-[146px] cursor-pointer w-10 h-[88px]"
						style="background-color: {brickColorToBg(data.colors.rightLegColor)};"
					/>
					<button
						on:click={() => {
							changeColor('Left Leg')
						}}
						class="absolute left-[96px] top-[146px] cursor-pointer w-10 h-[88px]"
						style="background-color: {brickColorToBg(data.colors.leftLegColor)};"
					/>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-y-10 p-8 grow h-full">
			<Tabs.Root value="wardrobe" class="w-full h-full">
				<Tabs.List>
					<Tabs.Trigger value="wardrobe">Wardrobe</Tabs.Trigger>
					<Tabs.Trigger value="outfits">Outfits</Tabs.Trigger>
				</Tabs.List>
				<Separator />
				<Tabs.Content
					value="wardrobe"
					class="mx-auto text-center px-32 mt-8 flex flex-col gap-y-8 h-full "
				>
					<div>
						{#each categoriesArray as category}
							<Button
								size="lg"
								variant="minimal"
								class="!px-4 {category.toLowerCase() === categoryParams?.toLowerCase()
									? 'font-bold'
									: ''}"><a href="?category={category.toLowerCase()}">{category}</a></Button
							>
							<span>|</span>
						{/each}
					</div>

					{#if data?.inventory?.length === 0}
						<EmptyCard>
							<h5>
								Maybe buy some items at the <a href="/catalog" class="hover:underline font-semibold"
									>catalog</a
								>?
							</h5>
						</EmptyCard>
					{/if}

					<div class="flex flex-wrap gap-4">
						{#each data?.inventory ?? [] as item}
							<AvatarCard
								itemId={item.itemid}
								itemName={item.asset.assetname}
								wearing={item.wearing}
								bind:trig
							/>
						{/each}
					</div>

					<PaginationWrapper count={data.count} size={8} url={$page.url} />

					<Separator />

					<h1 class="text-2xl leading-none tracking-tight font-semibold text-left">
						Currently Wearing
					</h1>

					<div class="flex flex-wrap gap-4">
						{#each data?.inventoryWearing ?? [] as item}
							<AvatarCard
								itemId={item.itemid}
								itemName={item.asset.assetname}
								wearing={item.wearing}
								bind:trig
							/>
						{/each}
					</div>

					<PaginationWrapper
						count={data.countWearing}
						size={8}
						url={$page.url}
						queryName={'pagewearing'}
					/>
				</Tabs.Content>
				<Tabs.Content value="outfits"></Tabs.Content>
			</Tabs.Root>
		</div>
	</div>
</div>

<AlertDialog.Root closeOnOutsideClick={true} bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<div class="relative">
				<AlertDialog.Title class="text-xl font-semibold text-center grow"
					>Choose a {bodypart} Color</AlertDialog.Title
				>
				<AlertDialog.Cancel class="absolute right-0 top-0">X</AlertDialog.Cancel>
			</div>
		</AlertDialog.Header>
		<AlertDialog.Description>
			<div class="flex flex-col gap-y-2 p-4">
				{#each Array(Math.ceil(colorArray.length / 8)) as _, i}
					<div class="flex flex-wrap gap-2 mx-auto">
						{#each colorArray.slice(i * 8, i * 8 + 8) as color}
							<button
								class="h-10 w-10 rounded-xl hover:shadow-sm hover:shadow-white"
								on:click={() => {
									saveColor(color.number)
								}}
								style="background-color: {color.color};"
							/>
						{/each}
					</div>
				{/each}
			</div>
		</AlertDialog.Description>
	</AlertDialog.Content>
</AlertDialog.Root>
