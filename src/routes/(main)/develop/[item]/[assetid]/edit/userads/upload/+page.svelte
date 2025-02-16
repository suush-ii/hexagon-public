<script lang="ts">
	import { Button } from '$src/components/ui/button'

	import UserAdFormPrimitive from '$src/components/develop/userAdFormPrimitive.svelte'

	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="container p-8 flex flex-col gap-y-8">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Instructions</h1>

	<h1>
		On Hexagon, users can bid an amount of moons to buy advertising for their places, groups,
		clothing, and models.
	</h1>

	<h1>Download, Edit and Upload one of the following templates:</h1>

	<ul class="list-disc ml-8 space-y-2 max-w-72">
		<li>
			<div class="flex items-center">
				728 x 90 Banner
				<a href="/ads/AdBannerTemplate.png" target="_blank" class="ml-auto"
					><Button variant="outline">Download</Button></a
				>
			</div>
		</li>
		<li>
			<div class="flex items-center">
				160 x 600 Skyscraper
				<a href="/ads/AdSkyscraperTemplate.png" target="_blank" class="ml-auto"
					><Button variant="outline">Download</Button></a
				>
			</div>
		</li>
		<li>
			<div class="flex items-center">
				300 x 250 Rectangle
				<a href="/ads/AdRectangleTemplate.png" target="_blank" class="ml-auto"
					><Button variant="outline">Download</Button></a
				>
			</div>
		</li>
	</ul>

	<UserAdFormPrimitive
		fileTypes={data._uploadableAssets.userads.fileTypes}
		data={data.userAdForm}
		friendlyName={data._uploadableAssets.userads.friendlyName}
	/>

	<h1 class="text-muted-foreground">
		This ad needs to be approved by a Moderator before it can be launched.
	</h1>
</div>
