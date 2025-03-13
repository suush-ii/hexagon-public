export const actionTypes = [
	'warn',
	'ban',
	'terminate',
	'poison',
	'unban',
	'changedrole',
	'approvedasset',
	'rejectedasset',
	'moderatedasset',
	'shutdownjob',
	'shutdownalljobs',
	'uploadasset',
	'moveitem',
	'deleteitem'
] as const

export type ActionTypes = (typeof actionTypes)[number]

export const friendlyActionNames: Record<ActionTypes, string> = {
	warn: 'Warn',
	ban: 'Ban',
	terminate: 'Terminate',
	poison: 'Poison',
	unban: 'Unban',
	changedrole: 'Changed Role',
	approvedasset: 'Approved Asset',
	rejectedasset: 'Rejected Asset',
	moderatedasset: 'Moderated Asset',
	shutdownjob: 'Shutdown Job',
	shutdownalljobs: 'Shutdown All Jobs',
	uploadasset: 'Upload Asset',
	moveitem: 'Move Item',
	deleteitem: 'Delete Item'
}
