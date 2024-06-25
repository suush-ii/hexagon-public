<script lang="ts">
	import { depluralize } from '$lib/utils'
	import GameThumbnail from '$src/components/games/gameThumbnail.svelte'
	import * as Tabs from '$src/components/ui/tabs/index.js'
	import { Button } from '$src/components/ui/button'
	import Separator from '$src/components/ui/separator/separator.svelte'
	import EmptyCard from '$src/components/emptyCard.svelte'
	import type { PageData } from './$types'
	import { page } from '$app/stores'

	export let data: PageData
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">
		{data.t('develop.configure')} Place
	</h1>
	<Tabs.Root>
		<Tabs.List>
			<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
			<Tabs.Trigger value="versions">Version History</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="settings"></Tabs.Content>
		<Tabs.Content value="versions"></Tabs.Content>
	</Tabs.Root>
</div>
