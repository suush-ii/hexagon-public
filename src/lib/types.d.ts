import { assetGenreZod, assetTypes, gearAttributesZod } from '.'

export type userState = 'offline' | 'online' | 'game' | 'studio'
export type userRole = 'owner' | 'admin' | 'mod' | 'uploader' | 'normal'
export type userGenders = 'male' | 'female' | 'nonbinary'

export type gameGenre = (typeof assetGenreZod)[number]

export type AssetGenre = keyof typeof assetGenreZod

export type AssetGenreDB = (typeof assetGenreZod)[number]

export type AssetTypes = (typeof assetTypes)[number]

export type GearAttributes = (typeof gearAttributesZod)[number]

export type renderStatus = 'pending' | 'completed'

export type clientVersions = '2014' | '2013'

export type assetStates = 'pending' | 'approved' | 'rejected'
import type { SvelteComponent } from 'svelte'
export type Component = $$Generic<typeof SvelteComponent<any, any, any>>

import { jobsTable } from '$lib/server/schema/games'

type instances = Pick<typeof jobsTable.$inferSelect, 'jobid' | 'active' | 'players'>[]
