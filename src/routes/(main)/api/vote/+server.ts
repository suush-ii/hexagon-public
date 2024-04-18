import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$src/lib/server/db'
import { votesTable } from '$lib/server/schema/gamevotes'
import { gamesTable } from '$lib/server/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const voteSchema = z.object({
	type: z.enum(['like', 'dislike']),
	gameid: z.coerce.number().int()
})

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user

	if (!user) {
		error(401, { success: false, message: 'No session.', data: {} })
	}

	let gameid: number
	let type: 'like' | 'dislike'
	let result
	try {
		;({ gameid, type } = await request.json())
		result = await voteSchema.safeParseAsync({ type, gameid })
	} catch (e) {
		console.log(e)
		error(400, { success: false, message: 'Malformed JSON.', data: {} })
	}

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed JSON.', data: { errors } })
	}

	const game = await db
		.select({ likes: gamesTable.likes, dislikes: gamesTable.dislikes })
		.from(gamesTable)
		.where(eq(gamesTable.universeid, gameid))
		.limit(1)

	if (game.length === 0) {
		return json({
			success: true,
			message: "This game doesn't exist!",
			data: {}
		})
	}

	const existingVote = await db
		.select()
		.from(votesTable)
		.where(and(eq(votesTable.userid, user.userid), eq(votesTable.gameid, gameid)))
		.limit(1)

	if (existingVote.length !== 0) {
		if (existingVote[0].type === type) {
			// they want to undo their vote

			await db
				.update(gamesTable)
				.set({
					likes: game[0].likes - (type === 'like' ? 1 : 0),
					dislikes: game[0].dislikes - (type === 'dislike' ? 1 : 0)
				})
				.where(eq(gamesTable.universeid, gameid))

			await db
				.delete(votesTable)
				.where(and(eq(votesTable.userid, user.userid), eq(votesTable.gameid, gameid)))
		} else {
			// they want to change their vote

			await db
				.update(gamesTable)
				.set({
					likes: game[0].likes + (type === 'like' ? 1 : -1),
					dislikes: game[0].dislikes + (type === 'dislike' ? 1 : -1)
				})
				.where(eq(gamesTable.universeid, gameid))

			await db
				.update(votesTable)
				.set({ type })
				.where(and(eq(votesTable.userid, user.userid), eq(votesTable.gameid, gameid)))
		}

		return json({ success: true, message: '', data: {} })
	}

	await db.insert(votesTable).values({ userid: user.userid, type, gameid })

	await db
		.update(gamesTable)
		.set({
			likes: game[0].likes + (type === 'like' ? 1 : 0),
			dislikes: game[0].dislikes + (type === 'dislike' ? 1 : 0)
		})
		.where(eq(gamesTable.universeid, gameid))

	return json({ success: true, message: '', data: {} })
}
