<script>
	import { page } from '$app/stores';

	import * as Card from '$src/components/ui/card';

	import { Button } from '$src/components/ui/button';

	import { HeartCrack } from 'lucide-svelte';
</script>

<div class="m-auto flex">
	<Card.Root class="w-96 p-4 text-center m-auto">
		<Card.Header class="flex flex-col gap-y-2">
			<div class="flex flex-row mx-auto gap-x-2">
				<HeartCrack class="w-8 h-8" strokeWidth={1.2} />
				<Card.Title class="text-3xl font-bold">{$page.status}</Card.Title>
			</div>
			<Card.Description>Uh oh an fucky wucky occured!</Card.Description>
			{#if $page.status != 404}
				<Card.Description
					>Don't worry your error has been logged and our team is working on it! uwu</Card.Description
				>
			{/if}
		</Card.Header>
		<Card.Content>
			<p>{$page.error?.message}</p>
		</Card.Content>
		<Card.Footer>
			<Button
				on:click={() => {
					history.back();
				}}
				variant="outline"
				class="w-full">Go back</Button
			>
		</Card.Footer>
	</Card.Root>
</div>
