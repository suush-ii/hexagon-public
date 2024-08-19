// place files you want to import through the `$lib` alias in this folder.
import veteran from '$lib/icons/badges/veteran.png'
import homestead from '$lib/icons/badges/homestead.png'
import bricksmith from '$lib/icons/badges/bricksmith.png'
import friendship from '$lib/icons/badges/friendship.png'
import initiation from '$lib/icons/badges/initiation.png'
import warrior from '$lib/icons/badges/warrior.png'
import bloxxer from '$lib/icons/badges/bloxxer.png'
import type { HexagonBadges } from './types'

export const assetGenreZod = [
	'All',
	'Building',
	'Horror',
	'Town and City',
	'Military',
	'Comedy',
	'Medieval',
	'Adventure',
	'Sci-Fi',
	'Naval',
	'FPS',
	'RPG',
	'Sports',
	'Fighting',
	'Western'
] as const

export const gearAttributesZod = [
	'Melee weapons',
	'Ranged weapons',
	'Explosives',
	'Power ups',
	'Navigation enhancers',
	'Musical instruments',
	'Social items',
	'Building tools',
	'Personal transport'
] as const

export const assetTypes = [
	'games',
	'hats',
	'faces',
	'heads',
	't-shirts',
	'torsos',
	'l arms',
	'r arms',
	'l legs',
	'r legs',
	'packages',
	'audio',
	'decals',
	'shirts',
	'pants',
	'gears',
	'images'
] as const

export const hexagonBadges = [
	'admin',
	'veteran',
	'homestead',
	'bricksmith',
	'friendship',
	'combat initiation',
	'warrior',
	'bloxxer'
]

export const badgeImages: Record<HexagonBadges, string> = {
	admin: '/hexagon128.png',
	veteran,
	homestead,
	bricksmith,
	friendship,
	'combat initiation': initiation,
	warrior,
	bloxxer
}

export const friendlyBadgeNames: Record<HexagonBadges, string> = {
	admin: 'Admin',
	veteran: 'Veteran',
	homestead: 'Homestead',
	bricksmith: 'Bricksmith',
	friendship: 'Friendship',
	'combat initiation': 'Combat Initiation',
	warrior: 'Warrior',
	bloxxer: 'Bloxxer'
}
