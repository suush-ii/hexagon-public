<script lang="ts">
	//@ts-nocheck

	import type { PageData } from './$types'

	export let data: PageData

	import './post.postcss'
	import './assetlist.postcss'

	import { getImage } from '$lib/games/getImage'
</script>

<svelte:head>
	<head data-machine-id="WEB1185">
		<!-- MachineID: WEB1185 -->
		<title>Publish Place As</title>

		<link rel="stylesheet" href="/ide/base.css" />

		<script>
			//Set if it browser's do not track flag is enabled
			var Roblox = Roblox || {}
			;(function () {
				var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack
				if (
					typeof window.external !== 'undefined' &&
					typeof window.external.msTrackingProtectionEnabled !== 'undefined'
				) {
					dnt = dnt || window.external.msTrackingProtectionEnabled()
				}
				Roblox.browserDoNotTrack = dnt == '1' || dnt == 'yes' || dnt === true
			})()
		</script>

		<script
			data-monitor="true"
			data-bundlename="studio"
			type="text/javascript"
			src="/ide/js/3719f3fb35135d05cf6b72d5b0f46333.js"
		></script>

		<script
			data-monitor="true"
			data-bundlename="page"
			type="text/javascript"
			src="/ide/js/79e749bac5810474fd3195d27f63e209.js"
		></script>

		<script type="text/javascript">
			if (typeof Roblox === 'undefined') {
				Roblox = {}
			}
			Roblox.Endpoints = Roblox.Endpoints || {}
			Roblox.Endpoints.Urls = Roblox.Endpoints.Urls || {}
		</script>
	</head>
</svelte:head>

<body>
	<div class="boxed-body">
		<h3>Choose an existing place to overwrite, or create a new place.</h3>

		<div>
			<div id="assetList" class="content asset-list tab-active">
				<div
					class="asset"
					id="newasset"
					onclick="document.location.href ='http://www.{data.baseurl}/ide/newplace';"
				>
					<!-- svelte-ignore a11y-missing-attribute -->
					<a class="game-image">
						<img
							class="placeThumbnail"
							src="/ide/assets/0a3736a37c742ad071c3e573897b752c354e9f92.png"
							alt="Create New"
						/>
					</a>
					<p class="item-name-container ellipsis-overflow">(Create New)</p>
				</div>

				{#if data.gamecreations}
					{#each data.gamecreations as place}
						<!-- svelte-ignore a11y-missing-attribute -->
						<div
							class="asset"
							id="newasset"
							onclick="document.location.href ='http://www.{data.baseurl}/ide/publishing?PlaceID={place.placeid}';"
						>
							<a class="game-image">
								<img
									class="placeThumbnail"
									src={getImage(
										place.thumbnail?.simpleasseturl,
										place.thumbnail?.moderationstate,
										'thumbnail'
									)}
									alt={place.placename}
								/>
							</a>
							<p class="item-name-container ellipsis-overflow">{place.placename}</p>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<div id="Close" class="footer-button-container divider-top">
			<a class="btn-medium btn-negative" id="closeButton">Cancel</a>
		</div>
	</div>
	<script type="text/javascript">
		$(function () {
			Roblox.PublishAs.Resources = {
				accept: 'Verify',
				decline: 'Cancel'
			}

			Roblox.PublishAs.Initialize()
		})
	</script>

	<script type="text/javascript">
		function urchinTracker() {}
	</script>

	<!-- svelte-ignore a11y-missing-attribute -->
	<div
		class="ConfirmationModal modalPopup unifiedModal smallModal"
		data-modal-handle="confirmation"
		style="display: none"
	>
		<!-- svelte-ignore a11y-missing-attribute -->
		<!-- svelte-ignore a11y-missing-content -->
		<a class="genericmodal-close ImageButton closeBtnCircle_20h"></a>
		<div class="Title"></div>
		<div class="GenericModalBody">
			<div class="TopBody">
				<div
					class="ImageContainer roblox-item-image"
					data-image-size="small"
					data-no-overlays
					data-no-click
				>
					<!-- svelte-ignore a11y-img-redundant-alt -->
					<img class="GenericModalImage" alt="generic image" />
				</div>
				<div class="Message"></div>
			</div>
			<div class="ConfirmationModalButtonContainer GenericModalButtonContainer">
				<a id="roblox-confirm-btn"><span></span></a>
				<a id="roblox-decline-btn"><span></span></a>
			</div>
			<div class="ConfirmationModalFooter"></div>
		</div>
		<script type="text/javascript">
			Roblox = Roblox || {}
			Roblox.Resources = Roblox.Resources || {}

			Roblox.Resources.GenericConfirmation = {
				yes: 'Yes',
				No: 'No',
				Confirm: 'Confirm',
				Cancel: 'Cancel'
			}
		</script>
	</div>
</body>
