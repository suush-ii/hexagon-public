<script lang="ts">
	import type { PageData } from './$types'

	import BadgeFormPrimitive from '$src/components/develop/badgeFormPrimitive.svelte'

	export let data: PageData
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Create a Badge</h1>

	<BadgeFormPrimitive
		fileTypes={data._uploadableAssets.badges.fileTypes}
		data={data.badgeForm}
		friendlyName={data._uploadableAssets.badges.friendlyName}
	/>
</div>
