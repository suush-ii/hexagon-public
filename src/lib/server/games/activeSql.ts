import { sql } from 'drizzle-orm'
import { jobsTable, placesTable } from '../schema'

export const activeSql = sql<number>`(select sum(${jobsTable.active}) FROM ${jobsTable} where placeid = ${placesTable.placeid} and active > 0)`
