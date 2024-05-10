import type { ActionTypes } from '$lib/server/admin.js'

export const actionTexts: Record<ActionTypes, string> = {
	warn: 'Warned {name}',
	ban: 'Banned {name} for {length}',
	terminate: 'Terminated {name}',
	poison: 'Poisoned banned {name}',
	unban: 'Unbanned {name}',
	changedrole: 'Changed role for {name} to {role}',
	approvedasset: 'Approved {type}: {itemname} (ID: {id})',
	rejectedasset: 'Rejected {type}: {itemname} (ID: {id})',
	moderatedasset: 'Moderated a {type} {itemname} (ID: {id})',
	shutdownjob: 'Shutdown a game job in {gamename}',
	shutdownalljobs: 'Shut all game jobs for {gamename}',
	uploadasset: 'Uploaded {type}: {itemname} (ID: {id})'
}

export function getText(action: ActionTypes): string {
	return actionTexts[action]
}
