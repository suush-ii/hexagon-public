<script lang="ts">
	import SidePanel from '$src/components/admin/sidepanel.svelte'

	import { pageName } from '$src/stores'

	pageName.set('Admin')

	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="p-4">
	<SidePanel role={data.session.role} />
</div>

<div class="p-8 flex flex-col space-y-4">
	<h1 class="text-xl">You only have access to what you need</h1>
</div>
