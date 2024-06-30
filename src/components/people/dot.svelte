<script lang="ts">
	import type { userState } from '$lib/types'
	import { stateBackgroundMap } from '$lib/utils'

	export let state: userState

	$: outline = stateBackgroundMap[state]
</script>

<div class="min-w-3 min-h-3 {outline} rounded-full"></div>
