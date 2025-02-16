<script lang="ts">
	import Avatar from '$src/components/catalog/avatar.svelte'
	import UserAvatar from '$src/components/users/avatar.svelte'
	import SaleCard from '$src/components/catalog/saleCard.svelte'
	import { MoonStar, X } from 'lucide-svelte'
	import { Button } from '$src/components/ui/button'
	import { Separator } from '$src/components/ui/separator'
	import * as Card from '$src/components/ui/card'
	import ReportButton from '$src/components/reportButton.svelte'
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { depluralize, formatCompactNumber, slugify } from '$lib/utils'
	import { page } from '$app/stores'
	import Configure from '$src/components/develop/edit/configure.svelte'
	import Favorite from '$src/components/favorite.svelte'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'
	import UserImage from '$src/components/userimage.svelte'

	import { toast } from 'svelte-sonner'
	import { interpolate } from '$lib/poly-i18n/interpolate'

	import RelativeTime from '@yaireo/relative-time'

	const relativeTime = new RelativeTime()

	import type { PageData } from './$types'
	import { invalidateAll } from '$app/navigation'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import Genre from '$src/components/catalog/genre.svelte'
	import GearAttributes from '$src/components/catalog/gearattributes.svelte'
	import Chart from '$src/components/catalog/chart.svelte'
	import VolumeChart from '$src/components/catalog/volumeChart.svelte'
	import GameImage from '$src/components/games/gameImage.svelte'

	export let data: PageData

	let purchasing = false

	let open = false

	async function purchase() {
		purchasing = true

		const response = await fetch(`/api/purchase`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				itemid: data.item.assetid
			})
		})

		const json = await response.json()

		if (json.success === false) {
			toast.error(json.message)
		} else {
			toast.success('Item purchased successfully!')
			invalidateAll()
		}

		purchasing = false
	}

	$: itemName = data.item.assetType.charAt(0).toUpperCase() + data.item.assetType.slice(1)

	$: itemid = data.item.assetid

	$: limitedmode = data.limitedmode

	$: canSell = data.alreadyOwned && limitedmode
</script>

<div class="flex mx-auto">
	<div class="container p-8 flex flex-col gap-y-4">
		<div class="flex flex-col gap-y-4">
			<div class="flex">
				<h1 class="text-5xl leading-none tracking-tight font-semibold break-words mr-auto">
					{data.item.assetname}
				</h1>

				{#if data.canEdit || data.canModerate || canSell}
					<Configure
						adminAsset={data.adminAsset}
						assetType={data.item.assetType}
						canModerate={data.canModerate}
						{itemid}
						{itemName}
						{canSell}
						sellFormLimited={data.sellFormLimited}
						sellFormLimitedU={data.sellFormLimitedU}
						serials={data.owned}
						sold={data.item.sales}
						limited={data.item.limited}
					/>
				{/if}
			</div>

			<h1 class="text-xl leading-none tracking-tight font-semibold">
				Hexagon {depluralize(itemName)}
			</h1>
		</div>

		<div class="flex flex-row gap-x-8 lg:flex-nowrap flex-wrap">
			<Avatar
				css="w-full lg:w-1/3 aspect-square h-fit rounded-xl"
				itemName={data.item.assetname}
				itemId={itemid}
				disable3d={data.item.moderationstate !== 'approved'
					? true
					: data.item.assetType === 'audio' ||
						  data.item.assetType === 'decals' ||
						  data.item.assetType === 'images' ||
						  data.item.assetType === 'faces' ||
						  data.item.assetType === 't-shirts' ||
						  data.item.assetType === 'gamepasses' ||
						  data.item.assetType === 'badges' ||
						  data.item.assetType === 'models'
						? true
						: false}
			>
				{#if data.item.limited}
					<div class="h-14 absolute left-0 bottom-0">
						<img
							class="w-full h-full"
							src="/Images/{data.item.limited}.svg"
							alt={data.item.limited}
						/>
					</div>{/if}</Avatar
			>

			<div class="flex flex-col gap-y-4 w-1/3">
				<div class="flex flex-row gap-x-4">
					<a href="/users/{data.item.creatoruserid}/profile">
						<UserAvatar
							css="w-20 h-20 rounded-xl"
							userid={data.item.creatoruserid}
							username={data.item.author.username}
							type="avatar"
							disable3d={true}
						/></a
					>

					<div class="flex flex-col gap-y-2">
						<h1 class="text-sm text-muted-foreground">
							{data.t('catalog.creator')}:
							<a href="/users/{data.item.creatoruserid}/profile"
								><span class="text-primary hover:underline">{data.item.author.username}</span></a
							>
						</h1>
						<h1 class="text-sm text-muted-foreground">
							{data.t('assetGeneric.created')}:
							<span class="text-primary">{data.item.created.toLocaleDateString('en-US')}</span>
						</h1>
						<h1 class="text-sm text-muted-foreground">
							{data.t('assetGeneric.updated')}:
							<span class="text-primary">{relativeTime.from(data.item.updated)}</span>
						</h1>
					</div>
				</div>
				<h1 class="text-lg leading-relaxed tracking-tight max-h-96 overflow-y-auto">
					{data.item.description ?? ''}
				</h1>
				{#if data.item.associatedgameid && data.associatedgame}
					<h1>
						{#if data.item.assetType === 'gamepasses'}
							Buy this gamepass in:
						{:else}
							Get this badge in:
						{/if}
						<a
							href="/games/{data.associatedgame.place.placeid}/{slugify(
								data.associatedgame.place.placename
							)}"
							><span class="font-semibold hover:underline line-clamp-2 break-words"
								>{data.associatedgame.place.placename}</span
							></a
						>
					</h1>

					<GameImage
						gameId={data.associatedgame.place.placeid}
						gameName={data.associatedgame.place.placename}
						assetUrl={data.associatedgame.icon?.simpleasseturl}
						moderationState={data.associatedgame.icon?.moderationstate}
					/>
				{/if}

				<ReportButton />
				<Separator />

				<h1 class="text-sm text-muted-foreground">{data.t('catalog.genres')}:</h1>
				{#each data.item.genres as genre}
					<Genre {genre} />
				{/each}
				{#if data.item.gearattributes}
					<h1 class="text-sm text-muted-foreground">{data.t('catalog.gearAttributes')}:</h1>
					{#each data.item.gearattributes as attribute}
						<GearAttributes {attribute} />
					{/each}
				{/if}
			</div>

			<div class="flex w-1/3 flex-col gap-y-4">
				<Card.Root
					class="text-center px-4 mx-4 rounded-xl supports-backdrop-blur:bg-background/60 bg-muted-foreground/5"
				>
					<Card.Header>
						<Card.Title class="flex flex-col mx-auto items-center gap-y-4">
							{#if data.item.stock && data.item.stock > 0}<h5 class="text-destructive">
									{data.item.stock} Remaining
								</h5>{/if}
							<h5 class="flex mx-auto items-center">
								{data.t('catalog.price')}:
								<MoonStar class="h-4 " />
								{#if data.item.price === 0}
									Free
								{:else}
									{data.item.price}
								{/if}
							</h5>
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<AlertDialog.Root closeOnOutsideClick={true} bind:open>
							<AlertDialog.Trigger asChild let:builder>
								{#if (!data.alreadyOwned || data.item.limited === 'limitedu') && data.user.coins >= (data.item.price ?? 0)}
									{#if data.item.onsale === false && data.canModerate === false}
										<Button
											builders={[builder]}
											class="w-full font-semibold text-lg select-none"
											disabled>{data.t('catalog.offsale')}</Button
										>
									{:else if (data.item.limited === 'limitedu' && data.item.stock === 0) || data.item.limited === 'limited'}
										<Button
											builders={[builder]}
											class="w-full font-semibold text-lg select-none"
											disabled>Out of Stock</Button
										>
									{:else if data.item.price === 0}
										<Button builders={[builder]} class="w-full font-semibold text-lg select-none"
											>{data.t('catalog.free')}</Button
										>
									{:else}
										<Button builders={[builder]} class="w-full font-semibold text-lg select-none"
											>{data.t('catalog.buyWith')} <MoonStar class="h-4 " /></Button
										>
									{/if}
								{:else if data.alreadyOwned && data.item.limited !== 'limitedu'}
									<Button
										builders={[builder]}
										class="w-full font-semibold text-lg select-none"
										disabled>{data.t('catalog.alreadyOwned')}</Button
									>
								{:else if data.item.price ?? 0 > data.user.coins}
									<Button
										builders={[builder]}
										class="w-full font-semibold text-lg select-none"
										disabled>{data.t('catalog.notEnough')} <MoonStar class="h-4 " /></Button
									>
								{/if}
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title class="text-xl font-semibold">
										<div class="flex justify-between">
											Buy Item

											<button
												on:click={() => {
													open = false
												}}><X /></button
											>
										</div>

										<Separator />
									</AlertDialog.Title>
									<AlertDialog.Description class="text-lg flex flex-col gap-y-4">
										<div class="flex flex-row flex-wrap line-clamp-2 break-all">
											Would you like to buy the Asset "{data.item.assetname}" for
											<span class="text-primary flex flex-row align-middle"
												><MoonStar class="h-4 my-auto " />
												{data.item.price}</span
											>?
										</div>
										<Avatar
											css="mx-auto aspect-square w-40 rounded-xl"
											itemId={data.item.assetid}
											itemName={data.item.assetname}
											disable3d={true}
										/>
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer class="mx-auto">
									<AlertDialog.Action disabled={purchasing} on:click={purchase}
										>Buy Now</AlertDialog.Action
									>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
						<Card.Description class="text-lg pt-4">
							{#if limitedmode}
								<h5 class="text-foreground hover:underline underline-offset-2 hover:cursor-pointer">
									See all private sellers ({data.privateSellersCount})
								</h5>

								{#if data.alreadyOwned}
									<h5>( {data.ownedCount} Owned )</h5>
								{/if}
							{/if}

							{#if data.item.onsale === false && data.canModerate}
								<h5>( Offsale for members )</h5>
							{/if}

							{interpolate(data.t('catalog.sold'), {
								count: formatCompactNumber(data.item.sales, false)
							})}</Card.Description
						>
					</Card.Content>
				</Card.Root>

				<Favorite
					alreadyFavorited={data.alreadyFavorited}
					assetid={itemid}
					favorites={data.item.favorites}
					game={false}
				/>
			</div>
		</div>

		{#if limitedmode}
			<div class="flex flex-col gap-y-8">
				<Separator />

				<h1 class="text-3xl leading-none tracking-tight font-semibold">Private Sales</h1>

				<div class="flex gap-x-4 w-full">
					<div class="flex flex-col w-full">
						{#if data.privateSellers && data.privateSellers.length > 0}
							{#each data.privateSellers as seller}
								<SaleCard
									price={seller.price}
									sold={data.item.sales}
									serial={Number(seller.item.serialid)}
									inventoryid={seller.item.inventoryid}
									userid={seller.userid}
									currentid={data.userid}
									username={seller.user.username}
									data={data.inventoryId}
									assetname={data.item.assetname}
									assetid={data.item.assetid}
									limited={data.item.limited}
								/>
							{/each}
							<div class="mt-auto">
								<PaginationWrapper
									count={data.privateSellersCount}
									size={5}
									url={$page.url}
									queryName={'salesPage'}
								/>
							</div>
						{:else}
							<EmptyCard />
						{/if}
					</div>

					<Separator orientation="vertical" />

					<div class="flex flex-col w-full">
						<h5 class="text-lg flex items-center">
							Recent Average Price: <MoonStar class="h-5" />
							{#if !data.item.recentaverageprice || data.item.recentaverageprice === 0}
								N/A
							{:else}
								{formatCompactNumber(data.item.recentaverageprice, false)}
							{/if}
						</h5>

						{#key data.saleshistory}
							<Chart salesHistory={data.saleshistory} />
						{/key}

						{#key data.volumehistory}
							<VolumeChart volumehistory={data.volumehistory} />
						{/key}
					</div>
				</div>
			</div>
		{/if}

		<div class="flex flex-col gap-y-4">
			<h1 class="text-xl leading-none tracking-tight font-semibold">
				{data.t('generic.recommendations')}
			</h1>
			<Separator />

			<div class="flex flex-row flex-wrap gap-8">
				{#if data.recommendations.length > 0}
					{#each data.recommendations as item}
						<div class="text-center text-lg w-40">
							<a href="/catalog/{item.assetid}/{slugify(item.assetname)}">
								<Avatar
									css="w-40 h-40 rounded-xl aspect-square"
									itemId={item.assetid}
									itemName={item.assetname}
									disable3d={true}
								/></a
							>
							<a href="/catalog/{item.assetid}/{slugify(item.assetname)}">
								<h1 class="line-clamp-2 tracking-tighter break-words text-xl hover:underline">
									{item.assetname}
								</h1></a
							>

							<h1 class="text-base text-muted-foreground mt-2 line-clamp-2">
								{data.t('catalog.creator')}:
								<a href="/users/{item.creatoruserid}/profile"
									><span class="text-primary hover:underline">{item.author.username}</span></a
								>
							</h1>
						</div>
					{/each}
				{:else}
					<EmptyCard />
				{/if}
			</div>
		</div>
	</div>
	<div class="w-full h-[600px] max-w-[160px] xl:block hidden shrink-0 my-12">
		<UserImage type="skyscraper" />
	</div>
</div>
