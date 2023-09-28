import { auth } from "$lib/server/lucia";
import { fail, redirect } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) throw redirect(302, "/login");
	await auth.invalidateSession(session.sessionId); // invalidate session
	locals.auth.setSession(null); // remove cookie
	throw redirect(302, "/login"); // redirect to login page
};