<script lang="ts">
	import { BadgeAlert } from 'lucide-svelte'

	let className = ''
	export { className as class }
</script>

<h1 class="text-destructive {className} font-semibold flex flex-row gap-x-1">
	Report! <BadgeAlert strokeWidth={3} />
</h1>
