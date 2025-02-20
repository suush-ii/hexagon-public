<script lang="ts">
	import { pageName } from '$src/stores'
	import { colorArray, categoriesArray } from '.'
	import Avatar from '$src/components/users/avatar.svelte'
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import * as Tabs from '$src/components/ui/tabs'
	import { Button } from '$src/components/ui/button'
	import { Separator } from '$src/components/ui/separator'
	import { Search } from 'lucide-svelte'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import AvatarCard from '$src/components/avatar/avatarCard.svelte'
	import CreateOutfitModal from '$src/components/avatar/createOutfitModal.svelte'
	import OutfitCard from '$src/components/avatar/outfitCard.svelte'

	let createOutfitModal: CreateOutfitModal

	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	import { page } from '$app/stores'

	import type { PageData } from './$types'
	import { Input } from '$src/components/ui/input'
	import { goto } from '$app/navigation'

	$: categoryParams = $page.url.searchParams.get('category') ?? 'hats'

	export let data: PageData

	pageName.set(data.t('generic.customize'))

	let open = false
	let redrawing = false

	type BodyPart = 'Head' | 'Right Arm' | 'Torso' | 'Left Arm' | 'Right Leg' | 'Left Leg'
	type ColorKey =
		| 'headColor'
		| 'rightArmColor'
		| 'torsoColor'
		| 'leftArmColor'
		| 'rightLegColor'
		| 'leftLegColor'

	let bodypart: BodyPart

	let bodyparts: Record<BodyPart, ColorKey> = {
		Head: 'headColor',
		'Right Arm': 'rightArmColor',
		Torso: 'torsoColor',
		'Left Arm': 'leftArmColor',
		'Right Leg': 'rightLegColor',
		'Left Leg': 'leftLegColor'
	}

	let trig = false

	function changeColor(part: BodyPart) {
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

	let searchQuery = $page.url.searchParams.get('search')

	function search() {
		let query = new URLSearchParams($page.url.searchParams.toString())

		query.delete('search')
		if (searchQuery) {
			query.set('search', searchQuery)
		}

		goto(`?${query.toString()}`)
	}
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
			<Tabs.Root
				value={$page.url.searchParams.get('tab') === 'outfits' ? 'outfits' : 'wardrobe'}
				class="w-full h-full"
			>
				<div class="flex gap-x-20">
					<Tabs.List class="!rounded-b-none rounded-t-xl">
						<a href="?tab=wardrobe"
							><Tabs.Trigger
								class="pointer-events-none !rounded-b-none rounded-t-xl"
								value="wardrobe">Wardrobe</Tabs.Trigger
							></a
						>
						<a href="?tab=outfits"
							><Tabs.Trigger
								class="pointer-events-none !rounded-b-none rounded-t-xl"
								value="outfits">Outfits</Tabs.Trigger
							></a
						>
					</Tabs.List>

					<Input
						bind:value={searchQuery}
						on:keyup={(event) => {
							if (event.key === 'Enter') {
								search()
							}
						}}
						type="text"
						maxlength={128}
						class="w-fit ml-auto"
						direction="r"
						icon={Search}
					/>
				</div>

				<Separator />
				{#if $page.url.searchParams.get('tab') === 'wardrobe' || !$page.url.searchParams.get('tab')}
					<Tabs.Content
						value="wardrobe"
						class="mx-auto text-center px-32 mt-8 flex flex-col gap-y-8 h-full"
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
									Maybe buy some items at the <a
										href="/catalog"
										class="hover:underline font-semibold">catalog</a
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
									limited={item.asset.limited}
									bind:trig
								/>
							{/each}
						</div>

						<PaginationWrapper count={data.count} size={10} url={$page.url} />

						<Separator />

						<h1 class="text-2xl leading-none tracking-tight font-semibold text-left">
							Currently Wearing
						</h1>

						{#if data?.inventoryWearing?.length === 0}
							<EmptyCard>
								<h5>You're not wearing anything! Why not put something on?</h5>
							</EmptyCard>
						{/if}

						<div class="flex flex-wrap gap-4">
							{#each data?.inventoryWearing ?? [] as item}
								<AvatarCard
									itemId={item.itemid}
									itemName={item.asset.assetname}
									wearing={item.wearing}
									limited={item.asset.limited}
									bind:trig
								/>
							{/each}
						</div>

						<PaginationWrapper
							count={data.countWearing}
							size={10}
							url={$page.url}
							queryName={'pagewearing'}
						/>
					</Tabs.Content>
				{/if}
				{#if $page.url.searchParams.get('tab') === 'outfits'}
					<Tabs.Content
						value="outfits"
						class="mx-auto text-center px-32 mt-8 flex flex-col gap-y-8 h-full"
					>
						<Button
							variant="outline"
							size="sm"
							class="ml-auto"
							on:click={() => {
								createOutfitModal.open()
							}}>Create New Outfit</Button
						>
						{#if data?.outfits?.length === 0}
							<EmptyCard>
								<h5>You don't have any outfits yet! Why not create one?</h5>
							</EmptyCard>
						{/if}

						<div class="flex flex-wrap gap-4">
							{#if data.outfits}
								{#each data.outfits as outfit}
									<OutfitCard
										outfitId={outfit.outfitid}
										outfitName={outfit.outfitname ?? ''}
										outfitUrl={outfit.avatarbody ?? ''}
										created={outfit.created}
										bind:trig
									/>
								{/each}
							{/if}
						</div>

						<div class="mt-auto">
							<PaginationWrapper
								count={data.outfitCount ?? 0}
								size={10}
								url={$page.url}
								queryName={'pageoutfits'}
							/>
						</div>
					</Tabs.Content>
				{/if}
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

{#if CreateOutfitModal}
	<CreateOutfitModal bind:this={createOutfitModal} createOutfitForm={data.form} />
{/if}
