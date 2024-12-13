import type { userState } from '$lib/types'

export const getUserState = (
	timestamp: Date,
	activegame: number | null,
	studiopresencelocation: number | null,
	studiopresenceping: Date | null,
	gamepresenceping: Date | null
): userState => {
	if (
		activegame &&
		gamepresenceping &&
		new Date().valueOf() - gamepresenceping.valueOf() < 3 * 60 * 1000
	) {
		return 'game'
	}

	if (
		studiopresencelocation &&
		studiopresenceping &&
		new Date().valueOf() - studiopresenceping.valueOf() < 3 * 60 * 1000
	) {
		return 'studio'
	}

	if (new Date().valueOf() - timestamp.valueOf() < 5 * 60 * 1000) {
		return 'online'
	} else {
		return 'offline'
	}
}
