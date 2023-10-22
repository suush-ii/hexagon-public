import { text, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({locals}) => {

	return text("http://hex.cirroskais.xyz/login/Negotiate.ashx?suggest=ROBLO") // 1: logged in null: logged out
}