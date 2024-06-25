<script lang="ts">
	export let href: string

	import { ChevronRight } from 'lucide-svelte'
	import { page } from '$app/stores'
</script>

<a {href}
	><h1 class="text-xl hover:underline flex align-middle">
		{$page.data.t('generic.seeAll')}
		<ChevronRight />
	</h1></a
>
