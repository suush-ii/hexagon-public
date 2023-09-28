import { error, json } from '@sveltejs/kit';
import { usersTable } from '$src/lib/server/schema/users';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { db } from '$src/lib/server/db';

import { z } from "zod"

import { usernameSchema } from '$lib/schemas/signupschema';

export const POST: RequestHandler = async ({ request, locals }) => {
    let username: string
    let result
    try{
        ({ username }  = await request.json())
        result = await usernameSchema.safeParseAsync({ username })
    }catch(e){
        console.log(e)
        throw error(400, {success: false, message: "Malformed JSON.", data: {}})
    }

    if (!result.success){
        const errors = result.error.issues.map(issue => issue.message) // get us only the error msgs
        throw error(400, {success: false, message: "Malformed JSON.", data: {errors}})
    }

    const user = await db
    .select({
      username: usersTable.username
    })
    .from(usersTable)
    .where(eq(usersTable.username, result.data.username))
    .limit(1);

    if (user.length != 0) {
        return json({"success": true, "message": "This username is not available!", data: {available: false}});
    }

	return json({"success": true, "message": "This username is available!", data: {available: true}});
}
