<script lang="ts">
	import SidePanel from '$src/components/admin/sidepanel.svelte'

	import type { LayoutData } from './$types'

	export let data: LayoutData
</script>

<div class="w-full flex flex-row">
	<div class="p-4 flex-shrink-0">
		<SidePanel role={data.user.role} queueCount={data.queueCount} />
	</div>

	<slot />
</div>
