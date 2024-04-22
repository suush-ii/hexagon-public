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
	'shutdownalljobs'
] as const

export type ActionTypes = (typeof actionTypes)[number]
