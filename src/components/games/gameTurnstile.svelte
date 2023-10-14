<script lang="ts">
	import GameCard from '$src/components/games/gameCard.svelte';

	import { Button } from '$src/components/ui/button';

	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	import EmptyCard from '$src/components/emptyCard.svelte';

	let listElement: any;

	let leftButtonDisabled = true;

	let rightButtonDisabled = false;

	let scrollStep = 1000;

	function scroll(direction: 'left' | 'right') {
		// ewww svelte doesn't let you bind:scroll so we have to hack it :(
		let sl = listElement.scrollLeft;
		let cw = listElement.scrollWidth;
		let maxScrollLeft = listElement.scrollWidth - listElement.clientWidth;

		if (direction === 'right') {
			if (sl + scrollStep >= maxScrollLeft) {
				rightButtonDisabled = true;
				listElement.scrollTo(cw, 0);
			} else {
				rightButtonDisabled = false;
				leftButtonDisabled = false;
				listElement.scrollTo(sl + scrollStep, 0);
			}
		} else {
			if (sl - scrollStep <= 0) {
				leftButtonDisabled = true;
				rightButtonDisabled = false;
				listElement.scrollTo(0, 0);
			} else {
				leftButtonDisabled = false;
				rightButtonDisabled = false;
				listElement.scrollTo(sl - scrollStep, 0);
			}
		}
	}

	let games: boolean = false;

	if (games === false) {
		rightButtonDisabled = true;
	}
</script>

<div class="flex flex-row w-full flex-wrap justify-end">
	<a href="/games/popular"><h1 class="text-xl hover-underline">See All</h1></a>

	<div
		class="flex flex-row gap-x-2 w-full outline-dashed outline-muted-foreground/20 rounded-xl outline-offset-4"
	>
		<Button
			class="h-full"
			size="icon"
			variant="outline"
			on:click={() => {
				scroll('left');
			}}
			disabled={leftButtonDisabled}><ChevronLeft className="h-2 w-2" /></Button
		>

		<div class="flex flex-row gap-x-3 w-full overflow-hidden scroll-smooth" bind:this={listElement}>
			{#if games === true}
				<GameCard gameId={1} gameName="game game gamasdfassdfdfne" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
				<GameCard gameId={1} gameName="NEW SHIT TYCOON [🔥]" />
			{:else}
				<EmptyCard class="p-8 m-auto" />
			{/if}
		</div>

		<Button
			class="h-full"
			size="icon"
			variant="outline"
			on:click={() => {
				scroll('right');
			}}
			disabled={rightButtonDisabled}><ChevronRight className="h-2 w-2" /></Button
		>
	</div>
</div>
