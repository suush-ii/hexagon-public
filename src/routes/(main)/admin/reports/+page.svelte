<script lang="ts">
	import { pageName } from '$src/stores'

	pageName.set('Admin')

	import type { PageData } from './$types'

	import { page } from '$app/stores'

	$: error = $page.url.searchParams.get('error')

	export let data: PageData
</script>

<div class="p-8 flex flex-col space-y-4">Coming soon right lol</div>
