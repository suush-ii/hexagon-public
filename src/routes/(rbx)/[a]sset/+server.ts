import { text, type RequestHandler, error, redirect } from "@sveltejs/kit"
import { z } from "zod"

const assetSchema = z.number().int().positive()

export const GET: RequestHandler = async ({url}) => {

    const result = await assetSchema.safeParseAsync(Number(url.searchParams.get("id")))

    if (!result.success) {
		throw error(400, { success: false, message: 'Malformed ID.', data: {} })
	}


	throw redirect(302, "https://assetdelivery.roblox.com/v1/asset/?id=" + Number(url.searchParams.get("id")))
}