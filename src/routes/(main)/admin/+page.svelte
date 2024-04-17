<script lang="ts">
	import SidePanel from '$src/components/admin/sidepanel.svelte'

	import { pageName } from '$src/stores'

	pageName.set('Admin')

	import type { PageData } from './$types'

	import { page } from '$app/stores'

	$: error = $page.url.searchParams.get('error')

	export let data: PageData
</script>

<div class="p-4">
	<SidePanel role={data.session.role} />
</div>

<div class="p-8 flex flex-col space-y-4">
	<h1 class="text-xl">We empty as HELL</h1>

	{#if error === 'permission'}
		<h1 class="text-xl">Sorry u don't have access to that :/</h1>
	{/if}
</div>
