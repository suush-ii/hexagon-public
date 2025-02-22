import {
	assetGenreZod,
	assetTypes,
	gearAttributesZod,
	hexagonBadges,
	hexagonClans,
	clientVersionsZod,
	posesZod
} from '.'
import type { SvelteComponent } from 'svelte'

export type userState = 'offline' | 'online' | 'game' | 'studio' | 'winner'
export type userRole = 'owner' | 'manager' | 'admin' | 'mod' | 'uploader' | 'normal'
export type userGenders = 'male' | 'female' | 'nonbinary'

export type gameGenre = (typeof assetGenreZod)[number]

export type AssetGenre = keyof typeof assetGenreZod

export type AssetGenreDB = (typeof assetGenreZod)[number]

export type AssetTypes = (typeof assetTypes)[number]

export type GearAttributes = (typeof gearAttributesZod)[number]

export type HexagonBadges = (typeof hexagonBadges)[number]

export type HexagonClans = (typeof hexagonClans)[number]

export type renderStatus = 'pending' | 'completed'

export type clientVersions = (typeof clientVersionsZod)[number]

export type assetStates = 'pending' | 'approved' | 'rejected'

export type poses = (typeof posesZod)[number]

export type Component = $$Generic<typeof SvelteComponent<any, any, any>>

import { jobsTable } from '$lib/server/schema/games'

type instances = Pick<typeof jobsTable.$inferSelect, 'jobid' | 'active' | 'players'>[]

type locales = import('$lib/poly-i18n/locales').LocaleCode
