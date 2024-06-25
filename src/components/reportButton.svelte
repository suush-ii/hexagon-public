<script lang="ts">
	import { BadgeAlert } from 'lucide-svelte'
	import { page } from '$app/stores'

	let className = ''
	export { className as class }

	function report() {
		console.log('Reported!')
	}
</script>

<button
	on:click={report}
	class="flex flex-row gap-x-1 text-destructive {className} font-semibold group w-24"
	>{$page.data.t('assetGeneric.report')}
	<BadgeAlert class="group-hover:animate-bounce shrink-0" strokeWidth={3} /></button
>
