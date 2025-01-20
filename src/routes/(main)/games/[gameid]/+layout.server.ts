import type { LayoutServerLoad } from './$types'
import { gamesTable, placesTable } from '$lib/server/schema/games'
import { db } from '$lib/server/db'
import { eq, and, count, desc, asc, sql } from 'drizzle-orm'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { votesTable } from '$lib/server/schema/gamevotes'
import { jobsTable } from '$lib/server/schema/games'
import { slugify } from '$lib/utils'
type jobs = typeof jobsTable.$inferSelect
import { env } from '$env/dynamic/private'
import {
	assetFavoritesTable,
	assetTable,
	inventoryTable,
	recentlyPlayedTable
} from '$src/lib/server/schema'
type passes = typeof assetTable.$inferSelect
const joinScriptUrl = `http://${env.BASE_URL}/game/Join.ashx`
import { gameCardSearch } from '$lib/server/games/gamecard'
import { imageSql } from '$lib/server/games/getImage'

export const load: LayoutServerLoad = async ({
	params,
	locals,
	depends,
	request,
	url,
	cookies
}) => {
	const result = await z.number().safeParseAsync(Number(params.gameid))

	if (result.success === false) {
		error(400, { success: false, message: 'Malformed input.' })
	}

	const place = await db.query.placesTable.findFirst({
		columns: {
			placeid: true,
			universeid: true,
			updated: true,
			created: true,
			geargenreenforced: true,
			allowedgear: true,
			placename: true
		},
		where: eq(placesTable.placeid, Number(params.gameid)),
		with: {
			associatedgame: {
				columns: {
					active: true,
					visits: true,
					serversize: true,
					updated: true,
					creatoruserid: true,
					description: true,
					genre: true,
					likes: true,
					dislikes: true,
					universeid: true,
					clientversion: true
				},
				with: {
					author: {
						columns: {
							username: true
						}
					},
					thumbnail: {
						columns: {
							moderationstate: true
						},
						extras: {
							simpleasseturl: imageSql
						}
					}
				}
			},
			associatedasset: {
				columns: {
					moderationstate: true
				}
			}
		}
	})

	if (!place) {
		error(404, { success: false, message: 'Game not found.', data: {} })
	}

	const slugGameName = slugify(place.placename)

	if (params?.game !== slugGameName && slugGameName !== '') {
		redirect(302, '/games/' + Number(params.gameid) + '/' + slugGameName)
	}

	const alreadyVoted = await db
		.select()
		.from(votesTable)
		.where(
			and(
				eq(votesTable.userid, locals.user.userid),
				eq(votesTable.gameid, Number(place.associatedgame.universeid))
			)
		)
		.limit(1)

	depends('app:game')

	let servers: Pick<jobs, 'jobid' | 'active' | 'players'>[] = []

	let passes: (Pick<passes, 'assetid' | 'assetname' | 'price'> & { own: unknown })[] = []

	let badges: (Pick<passes, 'assetid' | 'assetname' | 'description'> & {
		obtaineddate: unknown
		wonyesterday: number
		wonever: number
	})[] = []

	if (url.searchParams.get('page') === 'servers') {
		servers = await db
			.select({ jobid: jobsTable.jobid, active: jobsTable.active, players: jobsTable.players })
			.from(jobsTable)
			.where(eq(jobsTable.associatedid, place.associatedgame.universeid))
			.limit(40) // TODO: ADD PAGINATION
	}

	if (url.searchParams.get('page') === 'store') {
		passes = await db.query.assetTable.findMany({
			where: and(
				eq(assetTable.associatedgameid, place.associatedgame.universeid),
				eq(assetTable.onsale, true),
				eq(assetTable.assetType, 'gamepasses')
			),
			columns: {
				assetid: true,
				assetname: true,
				price: true
			},
			extras: {
				own: sql`exists (
                        select 1
                        from ${inventoryTable}
                        where ${inventoryTable.itemid} = ${assetTable.assetid}
                        and ${inventoryTable.userid} = ${locals.user.userid}
                    )`.as('own')
			}
		})
	}

	let [joinedGameCount] = await db
		.select({ count: count() })
		.from(recentlyPlayedTable)
		.where(
			sql`${recentlyPlayedTable.gameid} = ${place.associatedgame.universeid} and ${recentlyPlayedTable.time} >= (NOW() - INTERVAL '1 day')::date and ${recentlyPlayedTable.time} < (NOW() - INTERVAL '0 day')::date`
		)
		.limit(1)

	if ((url.searchParams.get('page') ?? 'about') === 'about') {
		badges = await db
			.select({
				assetid: assetTable.assetid,
				assetname: assetTable.assetname,
				description: assetTable.description,
				obtaineddate: inventoryTable.obatineddate,
				wonyesterday: sql<number>`(
                    select count(*)
                    from ${inventoryTable}
                    where ${inventoryTable.itemid} = ${assetTable.assetid}
                    and ${inventoryTable.obatineddate} >= (NOW() - INTERVAL '1 day')::date
                    and ${inventoryTable.obatineddate} < (NOW() - INTERVAL '0 day')::date
                )`.as('wonyesterday'),
				wonever:
					sql<number>`(select count(*) from ${inventoryTable} where ${inventoryTable.itemid} = ${assetTable.assetid})`.as(
						'wonever'
					)
			})
			.from(assetTable)
			.where(
				and(
					eq(assetTable.associatedgameid, place.associatedgame.universeid),
					eq(assetTable.assetType, 'badges')
				)
			)
			.leftJoin(
				inventoryTable,
				and(
					eq(inventoryTable.itemid, assetTable.assetid),
					eq(inventoryTable.userid, locals.user.userid)
				)
			)
			.orderBy(asc(assetTable.created))
	}

	const canEdit = Number(locals.user.userid) === place.associatedgame.creatoruserid

	const favorites = await db
		.select({ count: count() })
		.from(assetFavoritesTable)
		.where(eq(assetFavoritesTable.assetid, Number(params.gameid)))
		.limit(1)

	const alreadyFavorited = await db
		.select()
		.from(assetFavoritesTable)
		.where(
			and(
				eq(assetFavoritesTable.userid, locals.user.userid),
				eq(assetFavoritesTable.assetid, place.placeid)
			)
		)
		.limit(1)

	let recommendations = await gameCardSearch({
		orderBy: desc(gamesTable.active),
		limit: 8
	})

	recommendations = recommendations
		.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)

	const authBearer = cookies.get('.ROBLOSECURITY') ?? ''

	return {
		place: place,
		likespercentage: Math.round(
			(place.associatedgame.likes / (place.associatedgame.likes + place.associatedgame.dislikes)) *
				100
		), // (likes / total of likes and dislikes) times 100 rounded
		alreadyVoted: {
			voted: alreadyVoted.length > 0,
			voteType: alreadyVoted.length > 0 ? alreadyVoted[0].type : null
		},
		alreadyFavorited: alreadyFavorited.length > 0,
		favorites: favorites[0].count,
		servers,
		joinScriptUrl,
		canEdit,
		canModerate: locals.user.role !== 'normal' && locals.user.role !== 'uploader',
		userAgent: request.headers.get('user-agent'),
		recommendations,
		authBearer,
		baseurl: env.BASE_URL,
		passes,
		badges,
		joinedGameCount: joinedGameCount.count
	}
}
