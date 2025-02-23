<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData

	import '../../[ide=ide]/publishing/upload.postcss'
	import '../../[ide=ide]/Upload.aspx/assetlist.postcss'
	import '../../[ide=ide]/Upload.aspx/post.postcss'
	import '../../[ide=ide]/newplace/newplace.postcss'
	import '../../base.postcss'
</script>

<svelte:head>
	<head>
		<title>Publish New {data.animation ? 'Animation' : 'Model'}</title>

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
			src="/ide/js/a1ec30f16d5202192e1d89ed4aca2c58.js"
		>
		</script>
	</head>
</svelte:head>

<div
	class="boxed-body"
	data-return-url="http://www.{data.baseurl}/{data.animation
		? 'studio/animations/publish'
		: 'UI/Save.aspx'}"
>
	<div id="placeForm">
		<div class="headline">
			<h2>Basic Settings</h2>
		</div>
		<form
			id="basicSettingsForm"
			method="post"
			action="http://www.{data.baseurl}/UI/New.aspx?animation={data.animation}"
		>
			<input
				data-val="true"
				data-val-number="The field GroupId must be a number."
				id="GroupId"
				name="GroupId"
				type="hidden"
				value=""
			/>
			<label class="form-label" for="Name">Name:</label>
			<input
				class="text-box text-box-medium"
				data-val="true"
				data-val-required="Name is required"
				id="Name"
				name="Name"
				type="text"
				value=""
			/>
			<span id="nameRow"
				><span class="field-validation-valid" data-valmsg-for="Name" data-valmsg-replace="true"
				></span></span
			>
			<label class="form-label" for="Description">Description:</label>
			<textarea
				class="text-box text-area-medium"
				cols="80"
				id="Description"
				name="Description"
				rows="6"
			></textarea>
			<span class="field-validation-valid" data-valmsg-for="Description" data-valmsg-replace="true"
			></span>
			<label class="form-label" for="Genre">Genre:</label>
			<select class="form-select" id="Genre" name="Genre">
				<option selected>All</option>
				<option>Adventure</option>
				<option>Building</option>
				<option>Comedy</option>
				<option>Fighting</option>
				<option>FPS</option>
				<option>Horror</option>
				<option>Medieval</option>
				<option>Military</option>
				<option>Naval</option>
				<option>RPG</option>
				<option>Sci-Fi</option>
				<option>Sports</option>
				<option>Town and City</option>
				<option>Western</option>
			</select>
			<span class="field-validation-valid" data-valmsg-for="Genre" data-valmsg-replace="true"
			></span>
		</form>
	</div>
</div>
<div class="footer-button-container divider-top">
	<a class="btn-medium btn-primary" id="finishButton">Finish</a><a
		class="btn-medium btn-negative"
		id="cancelButton">Cancel</a
	>
</div>
<div
	class="ConfirmationModal modalPopup unifiedModal smallModal"
	data-modal-handle="confirmation"
	style="display:none;"
>
	<!-- svelte-ignore a11y-missing-attribute -->
	<!-- svelte-ignore a11y-missing-content -->
	<a class="genericmodal-close ImageButton closeBtnCircle_20h"></a>
	<div class="Title"></div>
	<div class="GenericModalBody">
		<div class="TopBody">
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<div
				class="ImageContainer roblox-item-image"
				data-image-size="small"
				data-no-overlays
				data-no-click
			>
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
</div>
