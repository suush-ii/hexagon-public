import type { ActionTypes } from '$lib/server/admin.js'

export const actionTexts: Record<ActionTypes, string> = {
	warn: 'Warned {name}',
	ban: 'Banned {name} for {length}',
	terminate: 'Terminated {name}',
	poison: 'Poisoned banned {name}',
	unban: 'Unbanned {name}',
	changedrole: 'Changed role for {name} to {role}',
	approvedasset: 'Approved a {type}: {name} (ID: {id})',
	rejectedasset: 'Rejected a {type}: {name} (ID: {id})',
	moderatedasset: 'Moderated a {type} {itemname} (ID: {id})',
	shutdownjob: 'Shutdown a game job in {gamename}',
	shutdownalljobs: 'Shut all game jobs for {gamename}'
}

export function getText(action: ActionTypes): string {
	return actionTexts[action]
}
