<script lang="ts">
	import { BadgeAlert } from 'lucide-svelte'

	let className = ''
	export { className as class }

	function report() {
		console.log('Reported!')
	}
</script>

<button
	on:click={report}
	class="flex flex-row gap-x-1 text-destructive {className} font-semibold group w-24"
	>Report! <BadgeAlert class="group-hover:animate-bounce" strokeWidth={3} /></button
>
