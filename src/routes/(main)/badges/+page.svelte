<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'

	import { badgeImages, friendlyBadgeNames, hexagonBadges } from '$lib'
	import { badgeDescriptions } from './badges'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'

	let badgeCategories = {
		'Community Badges': [hexagonBadges[0], hexagonBadges[1]], // admin and veteran
		'Builder Badges': [hexagonBadges[2], hexagonBadges[3]], // homestead bricksmith
		'Friendship Badges': [hexagonBadges[4]], // friendship
		'Combat Badges': [hexagonBadges[5], hexagonBadges[6], hexagonBadges[7]]
	}

	if (browser) {
		const anchorId = window.location.hash.replace('#', '')
		const anchor = document.getElementById(anchorId)

		window.scrollTo({
			top: anchor?.offsetTop,
			behavior: 'smooth'
		})
	}
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Badges</h1>

	{#each Object.entries(badgeCategories) as [category, badges]}
		<div class="flex flex-col gap-y-4">
			<div class="flex flex-col gap-y-6">
				<h1 class="text-3xl leading-none tracking-tight">{category}</h1>

				{#each badges as badge}
					<div
						class="flex gap-x-8 p-4 rounded-xl {browser &&
						decodeURIComponent(window?.location?.hash?.replace('#', '')) === badge
							? 'bg-muted-foreground/10'
							: ''}"
						id={badge}
					>
						<div class="w-24 h-24">
							<Avatar.Root class="w-full h-full rounded-xl aspect-square">
								<Avatar.Image src={badgeImages[badge]} alt={badge} loading="lazy" />
								<Avatar.Fallback />
							</Avatar.Root>
						</div>

						<div class="flex flex-col gap-y-4">
							<h1 class="text-2xl">{friendlyBadgeNames[badge]}</h1>

							<h2 class="">{badgeDescriptions[badge]}</h2>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
