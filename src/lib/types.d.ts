export type userState = 'offline' | 'online' | 'game' | 'studio'
export type userRole = 'owner' | 'admin' | 'mod' | 'uploader' | 'normal'

export type gameGenre =
	| 'All'
	| 'Building'
	| 'Horror'
	| 'Town and City'
	| 'Military'
	| 'Comedy'
	| 'Medieval'
	| 'Adventure'
	| 'Sci-Fi'
	| 'Naval'
	| 'FPS'
	| 'RPG'
	| 'Sports'
	| 'Fighting'
	| 'Western'

export type assetTypes = 'games' | 'audio' | 'decals'

export type clientVersions = '2016' | '2013'

export type assetStates = 'pending' | 'approved' | 'rejected' | 'deleted'

import type { SvelteComponent } from 'svelte'
export type Component = $$Generic<typeof SvelteComponent<any, any, any>>
