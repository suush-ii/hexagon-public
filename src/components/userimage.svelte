<script lang="ts">
	import * as Avatar from '$src/components/ui/avatar'

	export let type: 'skyscraper' | 'banner'

	// TODO: actually fetch ads and moderation
</script>

{#if type === 'skyscraper'}
	<Avatar.Root class="h-[600px] w-full max-w-[160px] rounded-xl aspect-auto sm:block hidden">
		<Avatar.Image src={''} loading="lazy" />
		<Avatar.Fallback />
	</Avatar.Root>
{:else if type === 'banner'}
	<Avatar.Root class="h-[90px] w-full max-w-[728px] rounded-xl mx-auto aspect-auto sm:block hidden">
		<Avatar.Image src={''} loading="lazy" />
		<Avatar.Fallback />
	</Avatar.Root>
{/if}
