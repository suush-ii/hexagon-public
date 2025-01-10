import type { ParamMatcher } from '@sveltejs/kit'

export const match: ParamMatcher = (param) =>
	param === 'ClientAppSettings' ||
	param === 'ClientSharedSettings' ||
	param === 'RCCService' ||
	param === 'AndroidAppSettings'
