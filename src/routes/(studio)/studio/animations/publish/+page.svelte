<script lang="ts">
	//@ts-nocheck

	import type { PageData } from './$types'

	export let data: PageData

	import '../../../[ide=ide]/publishing/upload.postcss'
	import '../../../[ide=ide]/Upload.aspx/assetlist.postcss'
	import '../../../[ide=ide]/Upload.aspx/post.postcss'
</script>

<svelte:head>
	<head>
		<title>Publish Animation As</title>
	</head>
</svelte:head>

<div class="boxed-body">
	<h3>Choose an existing animation to overwrite, or create a new animation.</h3>
	<div>
		<div id="assetList" class="content asset-list tab-active">
			<div
				class="asset model"
				id="newasset"
				onclick="document.location.href ='/UI/New.aspx?animation=true';"
			>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a class="model-image">
					<img
						id="newModelImage"
						class="modelThumbnail"
						src="/ide/assets/upd.png"
						alt="Create New"
					/>
				</a>
				<p class="item-name-container ellipsis-overflow">(Create New)</p>
			</div>

			{#each data.assets as asset}
				<div
					class="asset model"
					onclick="document.location.href ='/UI/Edit.aspx?assetId={asset.assetid}&animation=true';"
				>
					<!-- svelte-ignore a11y-missing-attribute -->
					<a class="model-image">
						<img
							id="newModelImage"
							class="modelThumbnail"
							src={data.animation}
							alt={asset.assetname}
						/>
					</a>
					<p class="item-name-container ellipsis-overflow">{asset.assetname}</p>
				</div>
			{/each}
		</div>
	</div>

	<div id="Close" class="footer-button-container divider-top">
		<a class="btn-medium btn-negative" id="closeButton">Cancel</a>
	</div>
</div>
