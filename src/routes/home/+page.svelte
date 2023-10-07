<script lang="ts">
	import type { PageData } from "./$types";

    export let data: PageData;
</script>

<div class="container p-8 flex flex-col gap-y-24">

    <h1 class="text-5xl leading-none tracking-tight">{data.welcomeMessage}, {data.session.username}...</h1>

    <h1 class="text-3xl">Friends (0)</h1>

    <div class="supports-backdrop-blur:bg-background/60 w-full border-b bg-muted-foreground/5 shadow-sm backdrop-blur flex flex-row">

    </div>
</div>