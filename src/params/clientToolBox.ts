import type { ParamMatcher } from '@sveltejs/kit'

export const match: ParamMatcher = (param) =>
	param === 'clienttoolbox.aspx' || param === 'ClientToolbox.aspx'
