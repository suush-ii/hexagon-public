import { text, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({locals}) => {

	return text("1") // 1: logged in null: logged out
}