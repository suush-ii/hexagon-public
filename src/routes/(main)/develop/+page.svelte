<script lang="ts">
	import * as Tabs from '$src/components/ui/tabs'
	import { Input } from '$src/components/ui/input'
	import { Upload } from 'lucide-svelte'

	import { pageName } from '$src/stores'
	pageName.set('Develop')
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Develop</h1>

	<Tabs.Root value="games" class="w-full flex flex-col gap-y-4">
		<Tabs.List class="w-full justify-around">
			<Tabs.Trigger class="w-full" value="games">Games</Tabs.Trigger>
			<Tabs.Trigger class="w-full" value="account">Audio</Tabs.Trigger>
			<Tabs.Trigger class="w-full" value="password">Decals</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="games" class="flex flex-col">
			<div
				class="h-40 supports-backdrop-blur:bg-background/60 w-full border-b bg-muted-foreground/5 shadow-sm backdrop-blur p-4 select-none outline-dashed outline-muted-foreground/20 rounded-xl flex flex-col"
			>
				<Upload class="m-auto w-14 h-14" />
				<h1 class="mx-auto mb-auto font-semibold text-xl">Upload Here</h1>
			</div>
		</Tabs.Content>
		<Tabs.Content value="account">Audio.</Tabs.Content>
		<Tabs.Content value="password">Decals.</Tabs.Content>
	</Tabs.Root>
</div>
