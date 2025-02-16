import { type RequestHandler, error, text } from '@sveltejs/kit'
import { z } from 'zod'
import { codes, codesZod } from './codes'
import { env } from '$env/dynamic/private'

const sysStatsSchema = z.object({
	message: z.string().pipe(z.enum(codesZod).catch('unknown')),
	userid: z.coerce.number().int(),
	resolution: z.string(),
	placeid: z.coerce.number().int(),
	jobid: z.string().uuid()
})

export const GET: RequestHandler = async ({ url }) => {
	const result = await sysStatsSchema.safeParseAsync({
		message: url.searchParams.get('Message'),
		userid: url.searchParams.get('UserID'),
		resolution: url.searchParams.get('Resolution'),
		placeid: url.searchParams.get('placeid'),
		jobid: url.searchParams.get('jobid')
	})

	if (!result.success) {
		const errors = result.error.issues.map((issue) => issue.message) // get us only the error msgs
		error(400, { success: false, message: 'Malformed.', data: { errors } })
	}

	const { message, userid, resolution, placeid, jobid } = result.data

	if (env.DISCORD_WEBHOOK_STATS) {
		await fetch(env.DISCORD_WEBHOOK_STATS, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: '',
				tts: false,
				embeds: [
					{
						id: 663817101,
						fields: [
							{
								id: 972459961,
								name: 'Place ID',
								value: placeid
							},
							{
								id: 39532476,
								name: 'User',
								value: `http://hexagon.pw/users/${userid}/profile`
							},
							{
								id: 319747079,
								name: 'Resolution',
								value: resolution
							},
							{
								id: 143778988,
								name: 'Code',
								value: message
							},
							{
								id: 216227723,
								name: 'Message',
								value: codes[message] ?? 'N/A'
							}
						],
						color: 16711680,
						title: 'SysStats Report'
					}
				],
				components: [],
				actions: {}
			})
		})
	}

	return text('true')
}
