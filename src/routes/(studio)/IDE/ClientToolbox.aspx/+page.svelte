<script lang="ts">
	import './toolbox.postcss'

	import * as Select from '$src/components/ui/select'
</script>

<svelte:head>
	<script id="Functions" type="text/jscript">
		function insertContent(id) {
			try {
				window.external.Insert('http://hex.cirroskais.xyz/asset?id=' + id)
			} catch (x) {
				alert('Could not insert the requested item')
			}
		}
		function dragRBX(id) {
			try {
				window.external.StartDrag('http://hex.cirroskais.xyz/asset?id=' + id)
			} catch (x) {
				alert('Sorry Could not drag the requested item')
			}
		}
		function clickButton(e, buttonid) {
			var bt = document.getElementById(buttonid)
			if (typeof bt == 'object') {
				if (navigator.appName.indexOf('Netscape') > -1) {
					if (e.keyCode == 13) {
						bt.click()
						return false
					}
				}
				if (navigator.appName.indexOf('Microsoft Internet Explorer') > -1) {
					if (event.keyCode == 13) {
						bt.click()
						return false
					}
				}
			}
		}
	</script>
</svelte:head>
<body class="Page">
	<div id="ToolboxContainer">
		<div id="ToolboxControls">
			<div id="ToolboxSelector">
				<select name="ddlToolboxes" id="ddlToolboxes" class="Toolboxes">
					<option value="1">Bricks</option>
					<option value="2">Vehicles</option>
					<option value="9">Tools &amp; Weapons</option>
					<option value="12">Furniture</option>
					<option value="13">Terrain</option>
					<option value="14">Scenery</option>
					<option value="15">Traps</option>
					<option value="16">Small Buildings</option>
					<option value="17">Ramps</option>
					<option value="18">Robots</option>
					<option value="19">Game Objects</option>
					<option value="20">Disney XD Skate Park Elements</option>
					<option value="21">Disney XD Skate Park Decals</option>
					<option value="FreeDecals">Free Decals</option>
					<option value="FreeModels">Free Models</option>
				</select>
			</div>
		</div>

		<div class="flex flex-row flex-wrap h-full w-full">
			<!-- svelte-ignore a11y-invalid-attribute -->
			<a title="Stone Brick" href="javascript:insertContent(10100083)"
				><img src="/Images/Toolbox/ebc9803632c9df19f040433ab1b02c1a" alt="Stone Brick" /></a
			>
		</div>
	</div>
</body>
