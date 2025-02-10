import type { LayoutServerLoad } from './$types'
import { error } from '@sveltejs/kit'
import { z } from 'zod'

export const _assetSchema = z.enum([
	'games',
	'audio',
	'decals',
	'shirts',
	'pants',
	't-shirts',
	'badges',
	'gamepasses',
	'models',
	'userads'
])

interface assetPrimitive {
	friendlyName: string
	fileTypes: string[]
	mimeTypes: string[]
}

const imagePrimitive = {
	fileTypes: ['.png', '.jpg', '.jpeg'],
	mimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
}

const accessoryPrimitive = {
	fileTypes: ['.rbxm'],
	mimeTypes: ['application/octet-stream']
}

export const _uploadableAssets: Record<string, assetPrimitive> = {
	games: { friendlyName: 'Game', fileTypes: ['.rbxl'], mimeTypes: ['application/octet-stream'] },
	audio: { friendlyName: 'Audio', fileTypes: ['.mp3'], mimeTypes: ['audio/mpeg'] },
	decals: {
		friendlyName: 'Decal',
		...imagePrimitive
	},
	images: {
		friendlyName: 'Image',
		...imagePrimitive
	},
	shirts: {
		friendlyName: 'Shirt',
		...imagePrimitive
	},
	pants: {
		friendlyName: 'Pants',
		...imagePrimitive
	},
	't-shirts': {
		friendlyName: 'T-Shirt',
		...imagePrimitive
	},
	hats: {
		friendlyName: 'Hat',
		...accessoryPrimitive
	},
	gears: {
		friendlyName: 'Gear',
		...accessoryPrimitive
	},
	faces: {
		friendlyName: 'Face',
		...accessoryPrimitive
	},
	packages: {
		friendlyName: 'Package',
		fileTypes: [],
		mimeTypes: []
	},
	heads: {
		friendlyName: 'Head',
		...accessoryPrimitive
	},
	torsos: {
		friendlyName: 'Torso',
		...accessoryPrimitive
	},
	'l arms': {
		friendlyName: 'Left Arm',
		...accessoryPrimitive
	},
	'l legs': {
		friendlyName: 'Left Leg',
		...accessoryPrimitive
	},
	'r arms': {
		friendlyName: 'Right Arm',
		...accessoryPrimitive
	},
	'r legs': {
		friendlyName: 'Right Leg',
		...accessoryPrimitive
	},
	badges: {
		friendlyName: 'Badge',
		...imagePrimitive
	},
	gamepasses: {
		friendlyName: 'Game Pass',
		...imagePrimitive
	},
	meshes: {
		friendlyName: 'Mesh',
		fileTypes: ['.mesh'],
		mimeTypes: ['application/octet-stream']
	},
	models: {
		friendlyName: 'Model',
		fileTypes: ['.rbxm'],
		mimeTypes: ['application/octet-stream']
	},
	userads: {
		friendlyName: 'User Ad',
		...imagePrimitive
	}
}

export const load: LayoutServerLoad = async ({ params }) => {
	const result = await _assetSchema.safeParseAsync(params.item)

	if (result.success === false) {
		error(404, { success: false, message: 'Not found.' })
	}

	return {
		item: params.item,
		friendlyName: _uploadableAssets[params.item].friendlyName,
		fileTypes: _uploadableAssets[params.item].fileTypes,
		_uploadableAssets
	}
}
