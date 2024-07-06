<!-- svelte-ignore a11y-missing-attribute -->
<script lang="ts">
	//@ts-nocheck
</script>

<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>Upload</title>
		<style>
			* {
				font-size: 12px;
				font-family: Arial, Helvetica, sans-serif;
			}
			H1 {
				font-weight: bold;
				font-size: larger;
			}

			.CreationsPanel {
				height: 250px;
				width: 450px;
			}
		</style>
	</head>
	<body scroll="no">
		<form name="Form1" method="post" action="/Game/Upload.aspx" id="Form1">
			<div>
				<input
					type="hidden"
					name="__VIEWSTATE"
					id="__VIEWSTATE"
					value="xhg1AMyqv3xm7IeDK1ZHd9PPv5K5tzLgSdLL3Z4vXwOLfj28kUwwMk1XXiEwptRm5LJsZha1ozHOxHiGCGUBXvub0Il6UP4L7dm2Lv1rba8YReOSyuskl0affUe3O5oyetWg6Q=="
				/>
			</div>

			<div>
				<input
					type="hidden"
					name="__VIEWSTATEGENERATOR"
					id="__VIEWSTATEGENERATOR"
					value="ACBD662E"
				/>
			</div>
			<script type="text/javascript">
				window.onload = function () {
					if (publishOnPageLoad) publish()
				}

				function publish() {
					if (redirectLoginUrl !== '') {
						window.location = redirectLoginUrl
						return
					}

					document.getElementById('Uploading').style.display = 'block'
					var result = window.external.Save()
					if (result) {
						document.getElementById('DialogResult').value = '1'
						window.close()
					} else {
						// try again...
						result = window.external.Save()
						if (result) {
							document.getElementById('DialogResult').value = '1'
							window.close()
						} else {
							document.getElementById('ErrorLabel').style.display = ''
							document.getElementById('NormalSaveButton').style.display = 'none'
							document.getElementById('NormalSaveText').style.display = 'none'

							document.getElementById('LocalSaveButton').style.display = 'block'
							document.getElementById('LocalSaveText').style.display = 'block'
						}
					}
					document.getElementById('Uploading').style.display = 'none'
				}
			</script>
			<script type="text/javascript">
				var redirectLoginUrl = ''
				var publishOnPageLoad = false
			</script>
			<table height="100%" cellpadding="12" width="100%">
				<tr valign="top">
					<td colspan="2">
						<p>
							You are about to leave your Place. Do you wish to save changes made to your Place
							before exiting?
						</p>
						<div id="Uploading" style="DISPLAY: none; FONT-WEIGHT: bold; COLOR: royalblue">
							Uploading. Please wait...
						</div>
						<span id="ErrorLabel" style="color: Red; display: none">Upload Failed!</span>
						<input id="DialogResult" type="hidden" />
					</td>
				</tr>
				<tr>
					<td width="120">
						<div id="NormalSaveButton" style="display:block;">
							<input
								type="button"
								style="WIDTH: 100%"
								value="Save"
								class="OKCancelButton translate"
								onclick="return publish();"
							/>
						</div>
						<div id="LocalSaveButton" style="display:none;">
							<input
								class="OKCancelButton translate"
								style="WIDTH: 100%"
								onclick="DialogResult.value='3'; window.close(); return false"
								type="button"
								value="Save Local"
							/>
						</div>
					</td>
					<td>
						<div id="NormalSaveText" style="display:block;">
							<strong>Save changes to my Place to Hexagon.</strong> (You will leave your place after
							the save has completed.)
						</div>
						<div id="LocalSaveText" style="display:none;">
							<strong>Save a local copy of my Place instead of uploading.</strong> ("You can open the
							file you save using Hexagon Studio.")
						</div>
					</td>
				</tr>
				<tr>
					<td width="120"
						><input
							class="OKCancelButton translate"
							style="WIDTH: 100%"
							onclick="DialogResult.value='1'; window.close(); return false"
							type="button"
							value="Don't Save"
						/></td
					>
					<td
						><strong>Leave my Place on Hexagon unchanged.</strong> (You will lose any changes you made
						during your visit.)</td
					>
				</tr>
				<tr>
					<td width="120"
						><input
							class="OKCancelButton translate"
							style="WIDTH: 100%"
							onclick="DialogResult.value='2'; window.close(); return false"
							type="button"
							value="Cancel"
						/></td
					>
					<td><strong>Keep playing and exit later.</strong></td>
				</tr>
			</table>
		</form>
	</body>
</html>
