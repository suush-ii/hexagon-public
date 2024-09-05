<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData

	import '../Upload.aspx/post.postcss'
	import './upload.postcss'
</script>

<svelte:head>
	<head data-machine-id="WEB1262">
		<!-- MachineID: WEB1262 -->
		<title>Uploading</title>

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
		>
		</script>
		<script
			data-monitor="true"
			data-bundlename="page"
			type="text/javascript"
			src="/ide/js/8954c11526342f34c1d4684694cd84de.js"
		>
		</script>

		<script type="text/javascript">
			if (typeof Roblox === 'undefined') {
				Roblox = {}
			}
			Roblox.Endpoints = Roblox.Endpoints || {}
			Roblox.Endpoints.Urls = Roblox.Endpoints.Urls || {}
		</script>

		<script type="text/javascript">
			if (typeof Roblox === 'undefined') {
				Roblox = {}
			}
			if (typeof Roblox.Studio === 'undefined') {
				Roblox.Studio = {}
			}
			Roblox.Studio.Resources = {
				errorMSG: 'Error: Upload Failed. Please try publishing again.',
				inappropriateTextError: 'Error: Inappropriate name or description.'
			}
		</script>
	</head>
</svelte:head>

<body>
	<div class="boxed-body">
		<h3>Uploading to {data.placeName}</h3>
		<div id="progressBarWrapper">
			<div
				id="uploadProgressBar"
				data-upload-url={`http://www.${data.baseurl}/Data/Upload.ashx?assetid=${data.placeId}`}
				data-previous-url="http://www.{data.baseurl}/ide/publish/newplace"
				data-newupload="False"
				data-assetid={data.placeId}
				data-isplace="True"
				data-ispackage="False"
			>
				<div id="progressAmount" class="progress-blue-bar" style="width:0%;"></div>
			</div>
			<a class="btn-medium btn-negative uploadCancel" id="cancelButton">Cancel</a>
			<a style="display: none;" class="btn-medium btn-neutral uploadOK" id="okButton">OK</a>
			<a style="display: none;" class="btn-medium blue-arrow uploadNext" id="nextButton">Next</a>
		</div>
		<p id="errorMessageContainer"><span id="uploadProgressCounter">0%</span> Completed</p>

		<div id="shareWithFriends" class="divider-top">
			<h3>Share your Place with friends</h3>
			<input
				class="form-text-box"
				id="gameLink"
				name="gameLink"
				type="text"
				value="http://www.{data.baseurl}/games/{data.placeId}"
			/>
		</div>
	</div>

	<script type="text/javascript">
		function urchinTracker() {}
	</script>

	<!-- svelte-ignore a11y-missing-content -->
	<div
		class="ConfirmationModal modalPopup unifiedModal smallModal"
		data-modal-handle="confirmation"
		style="display:none;"
	>
		<!-- svelte-ignore a11y-missing-attribute -->
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
