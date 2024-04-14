import { gameGenreZod } from '.'

export type userState = 'offline' | 'online' | 'game' | 'studio'
export type userRole = 'owner' | 'admin' | 'mod' | 'uploader' | 'normal'
export type userGenders = 'male' | 'female' | 'nonbinary'

export type gameGenre = (typeof gameGenreZod)[number]

export type assetTypes = 'games' | 'audio' | 'decals'

export type clientVersions = '2014' | '2013'

export type assetStates = 'pending' | 'approved' | 'rejected' | 'deleted'

import type { SvelteComponent } from 'svelte'
export type Component = $$Generic<typeof SvelteComponent<any, any, any>>

import { jobsTable } from '$lib/server/schema/games'

type instances = Pick<typeof jobsTable.$inferSelect, 'jobid' | 'active' | 'players'>[]
