import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$src/lib/server/db'
import { usersTable } from '$src/lib/server/schema/users'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { userState } from '$lib/types'

export const load: PageServerLoad = async ({ params }) => {

    let result = await z.number().safeParseAsync(Number(params.userId))

    if (result.success === false){
        throw error(400, {success: false, message: 'Malformed input.'})
    }
    
    const user = await db
    .select({
        username: usersTable.username,
        userid: usersTable.userid,
        lastactivetime: usersTable.lastactivetime
    })
    .from(usersTable)
    .where(eq(usersTable.userid, Number(params.userId)))
    .limit(1)

    let status: userState = "offline"

	if (user.length != 0) {

        if((new Date().valueOf() - user[0].lastactivetime.valueOf()) < 5*60*1000){
            // they have visited in over 5 mins
            status = "online"
        }

		return {
            username: user[0].username,
            userid: user[0].userid,
            lastactivetime: user[0].lastactivetime,
            status
        }
	}

	throw error(404, {success: false, message: 'User not found!'})
};