import type { AssetTypes } from '$lib/types'

export const categories: { value: AssetTypes; label: string }[] = [
	{ value: 'heads', label: 'Heads' },
	{ value: 'faces', label: 'Faces' },
	{ value: 'gears', label: 'Gear' },
	{ value: 'hats', label: 'Hats' },
	{ value: 't-shirts', label: 'T-Shirts' },
	{ value: 'shirts', label: 'Shirts' },
	{ value: 'pants', label: 'Pants' },
	{ value: 'decals', label: 'Decals' },
	{ value: 'models', label: 'Models' },
	{ value: 'audio', label: 'Audios' },
	{ value: 'badges', label: 'Badges' },
	{ value: 'gamepasses', label: 'Game Passes' },
	{ value: 'l arms', label: 'Left Arms' },
	{ value: 'r arms', label: 'Right Arms' },
	{ value: 'l legs', label: 'Left Legs' },
	{ value: 'r legs', label: 'Right Legs' },
	{ value: 'torsos', label: 'Torsos' },
	{ value: 'packages', label: 'Packages' }
]
