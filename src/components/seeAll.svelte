<script lang="ts">
	export let href: string

	import { ChevronRight } from 'lucide-svelte'
</script>

<a {href}><h1 class="text-xl hover:underline flex align-middle">See All <ChevronRight /></h1></a>
