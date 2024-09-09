<script lang="ts">
	import { onMount, onDestroy } from 'svelte'

	onMount(() => {
		window.addEventListener('message', (event) => {
			if (!event.source || !event.origin) return
			event.source.postMessage(
				{ code: new URLSearchParams(window.location.search).get('code') },
				event.origin as any
			)
		})
	})

	onDestroy(() => {})
</script>
