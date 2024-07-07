<script lang="ts">
	//@ts-nocheck
	import './toolbox.postcss'
</script>

<svelte:head>
	<script id="Functions" type="text/jscript">
		function insertContent(id) {
			try {
				window.external.Insert('http://hexagon.pw/asset?id=' + id)
			} catch (x) {
				alert('Could not insert the requested item')
			}
		}
		function dragRBX(id) {
			try {
				window.external.StartDrag('http://hexagon.pw/asset?id=' + id)
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
			<span id="dlToolboxItems" style="display:inline-block;width:100%;"
				><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10099842)">
						<a
							id="dlToolboxItems_ctl01_ciToolboxItem"
							title="Truss Beam"
							href="javascript:insertContent(10099842)"
							><img src="/Images/Toolbox/13af69798ab1d6971cef27d4fab700ee" alt="Truss Beam" /></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10099923)">
						<a
							id="dlToolboxItems_ctl02_ciToolboxItem"
							title="Wooden Truss Beam"
							href="javascript:insertContent(10099923)"
							><img
								src="/Images/Toolbox/046f5a704fe24c07641a648a84f73255"
								alt="Wooden Truss Beam"
							/></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10099957)">
						<a
							id="dlToolboxItems_ctl03_ciToolboxItem"
							title="Rusty Truss Beam"
							href="javascript:insertContent(10099957)"
							><img
								src="/Images/Toolbox/9e27aea8c1c695f0d8f1889d6adb88d0"
								alt="Rusty Truss Beam"
							/></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10099981)">
						<a
							id="dlToolboxItems_ctl04_ciToolboxItem"
							title="Shiny Aluminium Truss Beam"
							href="javascript:insertContent(10099981)"
							><img
								src="/Images/Toolbox/94bca904298ac0be1cd9c2300847443b"
								alt="Shiny Aluminium Truss Beam"
							/></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100046)">
						<a
							id="dlToolboxItems_ctl05_ciToolboxItem"
							title="Green Plastic Brick"
							href="javascript:insertContent(10100046)"
							><img
								src="/Images/Toolbox/460f6ae4c7e600474369c46a42d7efac"
								alt="Green Plastic Brick"
							/></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100069)">
						<a
							id="dlToolboxItems_ctl06_ciToolboxItem"
							title="Wooden Brick"
							href="javascript:insertContent(10100069)"
							><img src="/Images/Toolbox/da98053826366aa1ef087df1020ee27b" alt="Wooden Brick" /></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100083)">
						<a
							id="dlToolboxItems_ctl07_ciToolboxItem"
							title="Stone Brick"
							href="javascript:insertContent(10100083)"
							><img src="/Images/Toolbox/ebc9803632c9df19f040433ab1b02c1a" alt="Stone Brick" /></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100275)">
						<a
							id="dlToolboxItems_ctl08_ciToolboxItem"
							title="Transparent Brick"
							href="javascript:insertContent(10100275)"
							><img
								src="/Images/Toolbox/3fd8c80952e3c7532763eb3d4de833bc"
								alt="Transparent Brick"
							/></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100297)">
						<a
							id="dlToolboxItems_ctl09_ciToolboxItem"
							title="Shiny Brick"
							href="javascript:insertContent(10100297)"
							><img src="/Images/Toolbox/488becf24c411704f039468aa83da237" alt="Shiny Brick" /></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100356)">
						<a
							id="dlToolboxItems_ctl10_ciToolboxItem"
							title="Plastic Plate"
							href="javascript:insertContent(10100356)"
							><img src="/Images/Toolbox/1457159ef2646b0e2411ce23c390997f" alt="Plastic Plate" /></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100371)">
						<a
							id="dlToolboxItems_ctl11_ciToolboxItem"
							title="Wooden Plate"
							href="javascript:insertContent(10100371)"
							><img src="/Images/Toolbox/2e18154e9e628d962ae9cb9e9904fd30" alt="Wooden Plate" /></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100380)">
						<a
							id="dlToolboxItems_ctl12_ciToolboxItem"
							title="Stone Plate"
							href="javascript:insertContent(10100380)"
							><img src="/Images/Toolbox/1d5db006dff448f304a28d43250a73f8" alt="Stone Plate" /></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100399)">
						<a
							id="dlToolboxItems_ctl13_ciToolboxItem"
							title="Shiny Metal Plate"
							href="javascript:insertContent(10100399)"
							><img
								src="/Images/Toolbox/2fadd20074dc6f892e7bd0a0f96e018d"
								alt="Shiny Metal Plate"
							/></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100422)">
						<a
							id="dlToolboxItems_ctl14_ciToolboxItem"
							title="Weld Connector"
							href="javascript:insertContent(10100422)"
							><img
								src="/Images/Toolbox/c15f38239eaf6191ac7199403a0a08db"
								alt="Weld Connector"
							/></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100443)">
						<a
							id="dlToolboxItems_ctl15_ciToolboxItem"
							title="Universal Connector"
							href="javascript:insertContent(10100443)"
							><img
								src="/Images/Toolbox/8d26d119dd3ce6aa68db64599fe3bc39"
								alt="Universal Connector"
							/></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100483)">
						<a
							id="dlToolboxItems_ctl16_ciToolboxItem"
							title="Smooth Wooden Ball"
							href="javascript:insertContent(10100483)"
							><img
								src="/Images/Toolbox/121d4ba43746366e2bca73d54707c5bb"
								alt="Smooth Wooden Ball"
							/></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100552)">
						<a
							id="dlToolboxItems_ctl17_ciToolboxItem"
							title="Welded Plastic Ball"
							href="javascript:insertContent(10100552)"
							><img
								src="/Images/Toolbox/d9e3414d018608c156586495db3cef44"
								alt="Welded Plastic Ball"
							/></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100614)">
						<a
							id="dlToolboxItems_ctl18_ciToolboxItem"
							title="Wooden Wheel"
							href="javascript:insertContent(10100614)"
							><img src="/Images/Toolbox/fba68c0b4d364f2229e17117a5cc857a" alt="Wooden Wheel" /></a
						>
					</span>
				</span><span>
					<span class="ToolboxItem" ondragstart="dragRBX(10100669)">
						<a
							id="dlToolboxItems_ctl19_ciToolboxItem"
							title="Stone Sphere"
							href="javascript:insertContent(10100669)"
							><img src="/Images/Toolbox/b9d4714c7d2690ccd55d4d62d2967e72" alt="Stone Sphere" /></a
						>
					</span>
				</span></span
			>
		</div>
	</div>
</body>
