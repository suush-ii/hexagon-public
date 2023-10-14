<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar';

    export let gameName: string

    export let gameId: number
</script>

<a href="/games/{gameId}"><div class="flex flex-col w-32">
    <Avatar.Root class="w-32 h-32 rounded-xl">
        <Avatar.Image
            src="https://avaatars.githubusercontent.com/u/54828677?v=4{gameId}"
            alt="@sushidesigner"
        />
        <Avatar.Fallback />
    </Avatar.Root>
    <h1 class="line-clamp-2 tracking-tighter break-words text-xl">{gameName}</h1>
</div></a>