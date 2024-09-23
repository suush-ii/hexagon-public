import { applicationsTable } from '$lib/server/schema'
import { and, isNotNull, isNull } from 'drizzle-orm'

export const filter = and(
	isNull(applicationsTable.reviewed),
	isNotNull(applicationsTable.discordid)
)
