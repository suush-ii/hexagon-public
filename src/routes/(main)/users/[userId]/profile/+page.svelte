<script lang="ts">
	import Avatar from '$src/components/users/avatar.svelte'

	import * as ImageAvatar from '$src/components/ui/avatar'

	import FriendAvatar from '$src/components/home/friendAvatar.svelte'

	import GameThumbnail from '$src/components/games/gameThumbnail.svelte'

	import Dropdown from '$src/components/users/dropdown.svelte'

	import { friend as friendLib } from '$lib/friend'

	import * as Accordion from '$src/components/ui/accordion'

	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	import { Button } from '$src/components/ui/button'

	import { page } from '$app/stores'

	import { formatCompactNumber, slugify, stateTextMap } from '$lib/utils'

	import { Separator } from '$src/components/ui/separator'

	import RelativeTime from '@yaireo/relative-time'

	import { interpolate } from '$lib/poly-i18n/interpolate'

	import { badgeImages, friendlyBadgeNames } from '$lib'

	import CatalogAvatar from '$src/components/catalog/avatar.svelte'

	import { clanImages } from '$lib'

	const relativeTime = new RelativeTime()

	import type { PageData } from './$types'

	export let data: PageData

	$: status = data.status

	$: userid = data.userid

	$: username = data.username

	$: textColor = stateTextMap[status]

	import { pageName } from '$src/stores'
	import { invalidateAll } from '$app/navigation'
	import { getImage } from '$lib/games/getImage'

	$: pageName.set(username)

	async function friend(friend: boolean) {
		await friendLib(friend, userid)

		invalidateAll()
	}
</script>

<div class="container p-4 flex flex-col gap-y-4 pt-8">
	<div
		class="flex flex-row gap-x-4 bg-muted-foreground/5 p-6 rounded-xl outline-dashed outline-muted-foreground/20"
	>
		<Avatar state={status} {userid} {username} />

		<div class="flex flex-col min-w-52 gap-y-4 w-full">
			<div class="flex items-center gap-x-2">
				<h1 class="font-semibold text-5xl">{username}</h1>

				{#if data.registeredclan}
					<a href="/clans?clan={data.registeredclan}">
						<ImageAvatar.Root class="w-12 h-12 rounded-xl aspect-square">
							<ImageAvatar.Image src={clanImages[data.registeredclan]} alt="clan" />
							<ImageAvatar.Fallback />
						</ImageAvatar.Root>
					</a>
				{/if}
			</div>

			<div class="max-w-48 flex flex-wrap justify-around text-center">
				<div>
					<p class="font-bold text-muted-foreground">Friends</p>
					<p>{formatCompactNumber(data.friendsCount, false)}</p>
				</div>

				<div>
					<p class="font-bold text-muted-foreground">Knockouts</p>
					<p>{formatCompactNumber(data.knockouts, false)}</p>
				</div>
			</div>
		</div>

		{#if userid != data.user.userid}
			<div class="flex flex-col">
				<Dropdown {userid} />

				{#if data.relation.length > 0 && data.relation[0].type === 'block'}
					<Button variant="outline" class="ml-auto mt-auto h-14 w-40 text-lg" disabled size="lg"
						>Blocked</Button
					>
				{:else if data.relation.length > 0 && data.relation[0].type === 'friend'}
					<Button
						on:click={() => {
							friend(false)
						}}
						variant="outline"
						class="ml-auto mt-auto h-14 w-40 text-lg"
						size="lg">Unfriend</Button
					>
				{:else if data.relation.length > 0 && data.relation[0].type === 'request'}
					<Button variant="outline" class="ml-auto mt-auto h-14 w-40 text-lg" disabled size="lg"
						>Pending</Button
					>
				{:else}
					<Button
						on:click={() => {
							friend(true)
						}}
						variant="outline"
						class="ml-auto mt-auto h-14 w-40 text-lg"
						size="lg">Add Friend</Button
					>
				{/if}
			</div>
		{/if}
	</div>

	<div class="flex flex-row h-full">
		<div class="w-1/2 flex flex-col gap-y-4 h-full">
			<Separator class="w-full" />
			<h1 class="text-3xl font-semibold tracking-tight">
				{interpolate(data.t('profile.about'), { name: username })}
			</h1>
			<div
				class="bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl p-6 gap-y-4 flex flex-col min-h-[40rem]"
			>
				<div class="mx-auto flex flex-col">
					{#if status == 'online'}
						<h1 class="text-lg {textColor} mx-auto">[ Online: Website ]</h1>
					{:else if status == 'offline'}
						<h1 class="text-lg {textColor} mx-auto">[ Offline ]</h1>
					{:else if status == 'game'}
						<a href="/games/{data.activegame?.placeid}" class="mx-auto"
							><h1 class="text-lg {textColor} hover:underline">
								[ Online: {data.activegame?.placename} ]
							</h1></a
						>
					{:else if status == 'studio'}
						<a href="/games/{data.studiopresencelocation}" class="mx-auto"
							><h1 class="text-lg {textColor} hover:underline">[ Online: Studio ]</h1></a
						>
					{/if}

					<h1 class="text-lg {textColor} mx-auto hover:underline">
						<a href={$page.url.toString()}>{$page.url}</a>
					</h1>

					{#if data.role === 'admin' || data.role === 'owner'}
						<h1 class="text-lg text-destructive mx-auto">[ Administrator ]</h1>
					{:else if data.role === 'mod'}
						<h1 class="text-lg text-destructive mx-auto">[ Moderator ]</h1>
					{/if}
				</div>

				<Avatar
					state={status}
					{userid}
					{username}
					css={'xl:h-80 h-fit w-full max-w-80 aspect-square'}
					type="avatar"
				/>

				<p class="mx-auto line-clamp-6 break-words w-full whitespace-pre-line text-center">
					{data.blurb}
				</p>

				<Separator class="mt-2" />

				<div class="w-full flex flex-row flex-wrap justify-around text-center">
					<div>
						<p class="font-bold text-muted-foreground">{data.t('profile.joinDate')}</p>
						<p>{data.joindate.toLocaleDateString('en-US')}</p>
					</div>

					<div>
						<p class="font-bold text-muted-foreground">{data.t('profile.lastOnline')}</p>
						{#if new Date().valueOf() - new Date(data.lastactivetime).valueOf() < 3 * 60 * 1000}
							<p>Now</p>
							<!--Less than 3 mins ago-->
						{:else}
							<p>{relativeTime.from(data.lastactivetime)}</p>
						{/if}
					</div>

					<div>
						<p class="font-bold text-muted-foreground">{data.t('profile.placeVisits')}</p>
						<p>{formatCompactNumber(Number(data.placeVisits), false)}</p>
					</div>
				</div>

				<Separator class="mt-2" />
			</div>

			<h1 class="text-3xl font-semibold tracking-tight">{data.t('profile.hexagonBadges')}</h1>

			<div
				class="min-h-[28rem] bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl p-9 flex flex-col"
			>
				<div class="flex flex-wrap gap-y-16 gap-x-12 w-full">
					{#each data.badges as badge}
						<a href="/badges?badge={badge}"
							><div class="text-center w-28 h-28 my-auto">
								<ImageAvatar.Root class="w-full h-full rounded-xl aspect-square">
									<ImageAvatar.Image src={badgeImages[badge]} alt={badge} />
									<ImageAvatar.Fallback />
								</ImageAvatar.Root>

								<h2 class="hover:underline">{friendlyBadgeNames[badge]}</h2>
							</div></a
						>
					{/each}
				</div>
			</div>

			<h1 class="text-3xl font-semibold tracking-tight">{data.t('profile.playerBadges')}</h1>

			<div
				class="min-h-[30rem] bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl p-4 px-8 flex flex-col"
			>
				<div class="flex flex-wrap gap-y-16 gap-x-12 w-full">
					{#each data.playerbadges as badge}
						<a href="/catalog/{badge.itemid}/{slugify(badge.asset.assetname)}"
							><div class="text-center w-28 h-28 my-auto" title={badge.asset.assetname}>
								<CatalogAvatar
									css="w-full h-full rounded-xl aspect-square"
									itemId={badge.itemid}
									itemName={badge.asset.assetname}
									disable3d={true}
								/>
							</div></a
						>
					{/each}
				</div>

				<div class="mt-auto">
					<PaginationWrapper
						count={data.badgeCount}
						size={8}
						url={$page.url}
						queryName={'playerbadges'}
					/>
				</div>
			</div>

			<div class="flex flex-wrap"></div>

			<div />
		</div>

		<Separator orientation="vertical" class="h-full mx-4" />

		<div class="w-1/2 flex flex-col gap-y-4 h-full">
			<Separator class="w-full" />
			<h1 class="text-3xl font-semibold tracking-tight">{data.t('profile.activePlaces')}</h1>
			<div
				class="min-h-[40rem] bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl p-4 flex flex-col"
			>
				<Accordion.Root class="w-full mb-auto">
					{#each data.places as place, i}
						<Accordion.Item value="item-{i}">
							<Accordion.Trigger>{place.places?.[0].placename}</Accordion.Trigger>
							<Accordion.Content class="p-4">
								<div class="space-y-2">
									<h1 class="text-base">Visited {place.visits} times</h1>
									<a href="/games/{place.places?.[0].placeid}">
										<GameThumbnail
											assetUrl={place.thumbnail?.simpleasseturl}
											moderationState={place.thumbnail?.moderationstate}
											gamename={place.places?.[0].placename}
											size=" h-fit w-fit"
										/>
									</a>
									<p class="text-base leading-relaxed tracking-tight max-h-32 overflow-y-auto">
										{place.description}
									</p>
								</div>
							</Accordion.Content>
						</Accordion.Item>
					{/each}
				</Accordion.Root>

				<PaginationWrapper count={data.placeCount} size={40} url={$page.url} queryName={'places'} />
			</div>

			<h1 class="text-3xl font-semibold tracking-tight">
				{interpolate(data.t('profile.friends'), { name: username })}
			</h1>

			<div
				class="min-h-96 bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl p-4 px-12 flex flex-col"
			>
				<div class="flex flex-wrap gap-x-12 gap-y-4 mb-auto p-4">
					{#if data.friends}
						{#each data.friends as friend}
							<a href="/users/{friend.sender.userid}/profile">
								<FriendAvatar
									state={friend.status}
									username={friend.sender.username}
									userid={friend.sender.userid}
								/>
							</a>
						{/each}
					{/if}
				</div>

				<PaginationWrapper
					count={data.friendsCount}
					size={8}
					url={$page.url}
					queryName={'friends'}
				/>
			</div>

			<h1 class="text-3xl font-semibold tracking-tight">{data.t('profile.favorites')}</h1>

			<div
				class="min-h-[30rem] bg-muted-foreground/5 outline-dashed outline-muted-foreground/20 rounded-xl p-4 px-12 flex flex-col"
			>
				<div class="flex flex-wrap gap-x-16 gap-y-4 mb-auto p-4">
					{#if data.favorites.length > 0}
						{#each data.favorites as item}
							<div class="w-24 2xl:w-32">
								<a href="/games/{item.assetid}/{slugify(item.assetname ?? '')}">
									<ImageAvatar.Root class="w-24 h-24 2xl:w-32 2xl:h-32 rounded-xl aspect-square">
										<ImageAvatar.Image
											src={getImage(item.simpleasseturl, item.moderationstate, 'icon')}
											alt={item.assetname}
										/>
										<ImageAvatar.Fallback />
									</ImageAvatar.Root>
								</a>
								<a href="/catalog/{item.assetid}/{slugify(item.assetname ?? '')}">
									<h1 class="line-clamp-2 tracking-tighter break-words text-base hover:underline">
										{item.assetname}
									</h1></a
								>

								<h1 class="text-sm text-muted-foreground mt-2 line-clamp-2">
									{data.t('catalog.creator')}:
									<a href="/users/{item.creatoruserid}/profile"
										><span class="text-primary hover:underline">{item.creatorusername}</span></a
									>
								</h1>
							</div>
						{/each}
					{/if}
				</div>

				<PaginationWrapper
					count={data.favoritesCount}
					size={6}
					url={$page.url}
					queryName={'favorites'}
				/>
			</div>
		</div>
	</div>
</div>
