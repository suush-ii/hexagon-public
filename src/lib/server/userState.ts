import type { userState } from '$lib/types'

export const getUserState = (timestamp: Date): userState => {
	if (new Date().valueOf() - timestamp.valueOf() < 5 * 60 * 1000) {
		return 'online'
	} else {
		return 'offline'
	}
}
