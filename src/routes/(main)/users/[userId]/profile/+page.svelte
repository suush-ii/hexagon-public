<script lang="ts">
	import Avatar from '$src/components/users/avatar.svelte'

	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="container p-4 flex flex-col gap-y-4 pt-8">
	<div
		class="flex flex-row gap-x-4 bg-muted-foreground/5 p-6 rounded-xl outline-dashed outline-muted-foreground/20"
	>
		<Avatar state={data.status} userid={1} />
		<h1 class="font-semibold text-5xl">{data.username}</h1>
	</div>
</div>
