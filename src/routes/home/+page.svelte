<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	import * as Avatar from '$src/components/ui/avatar';

	import { HeartCrack } from 'lucide-svelte';
</script>

<div class="container p-8 flex flex-col">
	<h1 class="text-5xl leading-none tracking-tight">
		{data.welcomeMessage}, {data.session.username}...
	</h1>

	<div class="pt-24 flex flex-col gap-y-4">

	<h1 class="text-3xl">Friends (0)</h1>

	<div
		class="supports-backdrop-blur:bg-background/60 w-full border-b bg-muted-foreground/5 shadow-sm backdrop-blur flex flex-row p-4 gap-x-4 select-none outline-dashed outline-muted-foreground/20 rounded-xl"
	>
		<div class="mx-auto flex flex-col w-full gap-y-4">
			<HeartCrack class="w-24 h-24 mx-auto" strokeWidth={1.2} />
			<h5 class="text-center mx-auto">There seems to be no one here... 😕</h5>
		</div>
		<!--TODO: FINISH this...-->

		<!--<div>
        <Avatar.Root class="w-24 h-24">
            <Avatar.Image src="https://avatars.githubusercontent.com/u/54828677?v=4" alt="@sushidesigner" />
            <Avatar.Fallback>SU</Avatar.Fallback>
          </Avatar.Root>
          <p class="truncate">SushiDesigner</p>
        </div>-->
	</div>

</div>

</div>
