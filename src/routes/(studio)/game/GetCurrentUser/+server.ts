import { text, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({locals}) => {

	return text("1") // 1: logged in 0: logged out
}