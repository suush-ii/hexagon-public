<script lang="ts">
	import SidePanel from '$src/components/admin/sidepanel.svelte'

	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="p-4 flex flex-col gap-y-4">
	<SidePanel role={data.session.role} />
</div>
