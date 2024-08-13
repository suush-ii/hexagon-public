<script lang="ts">
	//@ts-nocheck

	import type { PageData } from './$types'

	export let data: PageData

	import { getImage } from '$lib/games/getImage'
</script>

<svelte:head>
	<title>Welcome</title>
	<script type="text/javascript" src="/ide/jquery-1.7.2.min.js"></script>
	<script type="text/javascript" src="/ide/MicrosoftAjax.js"></script>

	<link rel="stylesheet" href="/ide/base.css" />

	<script type="text/javascript" src="/ide/js/1213b611e48f19954b4b71cc85003f18.js"></script>

	<script type="text/javascript">
		Roblox.config.externalResources = ['/ide/jquery-1.7.2.min.js']
		Roblox.config.paths['jQuery'] = '/ide/js/29cf397a226a92ca602cb139e9aae7d7.js'
		Roblox.config.paths['Pages.Catalog'] = '/ide/js/c8f61a230e6ad34193b40758f1499a3d.js'
		Roblox.config.paths['Pages.Messages'] = '/ide/js/9d551a9e1b4c61c19e752fbed1a6da7c.js'
		Roblox.config.paths['Resources.Messages'] = '/ide/js/fb9cb43a34372a004b06425a1c69c9c4.js'
		Roblox.config.paths['Widgets.AvatarImage'] = '/ide/js/a404577733d1b68e3056a8cd3f31614c.js'
		Roblox.config.paths['Widgets.DropdownMenu'] = '/ide/js/d83d02dd89808934b125fa21c362bcb9.js'
		Roblox.config.paths['Widgets.GroupImage'] = '/ide/js/3e692c7b60e1e28ce639184f793fdda9.js'
		Roblox.config.paths['Widgets.HierarchicalDropdown'] =
			'/ide/js/e8b579b8e31f8e7722a5d10900191fe7.js'
		Roblox.config.paths['Widgets.ItemImage'] = '/ide/js/f676cf25d820c731b5adb4bf362bcd90.js'
		Roblox.config.paths['Widgets.PlaceImage'] = '/ide/js/08e1942c5b0ef78773b03f02bffec494.js'
		Roblox.config.paths['Widgets.Suggestions'] = '/ide/js/a63d457706dfbc230cf66a9674a1ca8b.js'
		Roblox.config.paths['Widgets.SurveyModal'] = '/ide/js/d6e979598c460090eafb6d38231159f6.js'
	</script>
</svelte:head>
{@html `
<!-- ugly hack but whatever -->
	<script type="text/javascript">
		function editTemplateInStudio(play_placeId) {
			RobloxLaunch._GoogleAnalyticsCallback = function () {
				var isInsideRobloxIDE = 'website'
				if (Roblox && Roblox.Client && Roblox.Client.isIDE && Roblox.Client.isIDE()) {
					isInsideRobloxIDE = 'Studio'
				}
				GoogleAnalyticsEvents.FireEvent(['Edit Location', 'Guest', isInsideRobloxIDE])
				GoogleAnalyticsEvents.FireEvent(['Edit', 'Guest', ''])
			}
			Roblox.Client.WaitForRoblox(function () {
				RobloxLaunch.StartGame(
					'http://www.${data.baseurl}/Game/edit.ashx?PlaceID=' + play_placeId + '&upload=',
					'edit.ashx',
					'https://www.${data.baseurl}/Login/Negotiate.ashx',
					'FETCH',
					true
				)
			})
		}

		function editGameInStudio(play_placeId) {
			Roblox.Client.WaitForRoblox(function () {
				RobloxLaunch.StartGame(
					'http://www.${data.baseurl}/Game/edit.ashx?PlaceID=' + play_placeId + '&upload=',
					'edit.ashx',
					'https://www.${data.baseurl}/Login/Negotiate.ashx',
					'FETCH',
					true
				)
			})
		}

		function buildGameInStudio(play_placeId) {
			Roblox.Client.WaitForRoblox(function () {
				RobloxLaunch.StartGame(
					'http://www.${data.baseurl}/Game/edit.ashx?PlaceID=' + play_placeId + '&upload=',
					'edit.ashx',
					'https://www.${data.baseurl}/Login/Negotiate.ashx',
					'FETCH',
					true
				)
			})
		}
	</script>
`}
<body id="StudioWelcomeBody">
	<div class="header">
		<div id="header-login-wrapper" class="iframe-login-signup" data-display-opened="">
			{#if data.username}
				<span id="userName">Logged in as {data.username}</span>
			{:else}
				<a
					href="/"
					target="_blank"
					class="btn-control btn-control-large translate"
					id="header-signup"><span>Sign Up</span></a
				>
				<!--
		<span id="header-or">or</span>
		<span class="studioiFrameLogin">
			<span id="login-span">
				<a id="header-login" class="btn-control btn-control-large"
					>Login <span class="grey-arrow">▼</span></a
				>
			</span>

			<div id="iFrameLogin" class="studioiFrameLogin" style="display: none">
				<iframe
					class="login-frame"
					src="http://www.hexagon.pw/Login/iFrameLogin.aspx?loginRedirect=True&amp;parentUrl=http%3a%2f%2fwww.hexagon.pw%2fide%2fwelcome"
					scrolling="no"
					frameborder="0"
					title="Login"
				></iframe>
			</div>
		</span>-->
			{/if}
		</div>

		<!-- This is only after the login stuff because IE7 demands floated elements be before non-floated -->
		<img src="/ide/img-studio_title.png" alt="Roblox Studio Title" />
	</div>
	<div class="container">
		<div class="navbar">
			<ul class="navlist">
				<li id="NewProject"><p>New Project</p></li>
				<li id="MyProjects"><p>My Projects</p></li>
				<!--li class="lastnav"><p>Recent News</p></li-->
			</ul>
			{#if Object.keys(data.files).length > 0}
				<ul id="StudioRecentFiles" class="filelist">
					<li>Recent Files</li>
					{#each Object.entries(data.files) as [filepath, filename]}
						<li>
							<!-- svelte-ignore a11y-missing-attribute -->
							<a js-data-file={decodeURIComponent(filepath)}>{decodeURIComponent(filename)}</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div class="main">
			<div id="TemplatesView" class="welcome-content-area">
				<h2 id="StudioGameTemplates">GAME TEMPLATES</h2>
				<div class="templatetypes">
					<ul class="templatetypes">
						<li js-data-templatetype="Basic"><a href="#Basic">Basic</a></li>
						<li js-data-templatetype="Strategy"><a href="#Strategy">Strategy</a></li>
						<li js-data-templatetype="Action"><a href="#Action">Action</a></li>
					</ul>
					<!--div class="tool-tip">
                    <img alt="Recommended for users new to ROBLOX studio" src="/images/IDE/img-tail-top.png" class="top" />
                    <p>Recommended for users new to ROBLOX studio</p>
                    <a class="closeButton"></a>
                </div -->
				</div>
				<div class="templates" js-data-templatetype="Basic">
					<div class="template" placeid="95206881">
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a href="" class="game-image"
							><img
								class=""
								width="197"
								height="115"
								src="/ide/assets/b9e7f7d3cf793d3c06f1d5a4f7e4f27a.jpg"
								alt="Baseplate"
							/></a
						>
						<p>Baseplate</p>
					</div>
					<div class="template" placeid="95206192">
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a href="" class="game-image"
							><img
								class=""
								width="197"
								height="115"
								src="/ide/assets/74587bf715e014212ed54247d0b10bba.jpg"
								alt="Flat Terrain"
							/></a
						>
						<p>Flat Terrain</p>
					</div>
				</div>
				<div class="templates" js-data-templatetype="Strategy">
					<div class="template" placeid="92721754">
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a href="" class="game-image"
							><img
								class=""
								width="197"
								height="115"
								src="/ide/assets/78e4138e7497d93902652f3e4bbcc036.jpg"
								alt="Capture The Flag"
							/></a
						>
						<p>Capture The Flag</p>
					</div>
					<div class="template" placeid="95269276">
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a href="" class="game-image"
							><img
								class=""
								width="197"
								height="115"
								src="/ide/assets/c8ced6c77d62498c25bb15db54f485a3.jpg"
								alt="Control Points"
							/></a
						>
						<p>Control Points</p>
					</div>
				</div>
				<div class="templates" js-data-templatetype="Action">
					<div class="template" placeid="92721884">
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a href="" class="game-image"
							><img
								class=""
								width="197"
								height="115"
								src="/ide/assets/2a19b9c792e323fffe1e403b768a37ea.jpg"
								alt="Free For All"
							/></a
						>
						<p>Free For All</p>
					</div>
					<div class="template" placeid="95205458">
						<!-- svelte-ignore a11y-invalid-attribute -->
						<a href="" class="game-image"
							><img
								class=""
								width="197"
								height="115"
								src="/ide/assets/689e0dd9ad716d4f59d2739ee118ebb9.jpg"
								alt="Team Deathmatch"
							/></a
						>
						<p>Team Deathmatch</p>
					</div>
				</div>
			</div>
			<div id="MyProjectsView" class="welcome-content-area" style="display: none">
				<h2>My Published Projects</h2>
				<div id="assetList">
					{#if data.gamecreations}
						{#each data.gamecreations as game}
							<div class="place" data-active="True" data-placeid={game.places[0].placeid}>
								<!-- svelte-ignore a11y-invalid-attribute -->
								<a href="" class="game-image"
									><img
										class=""
										width="197"
										height="115"
										src={getImage(
											game.thumbnail?.simpleasseturl,
											game.thumbnail?.moderationstate,
											'thumbnail'
										)}
										alt={game.gamename}
									/></a
								>
								<p>{game.gamename}</p>
							</div>
						{/each}
					{:else}
						<div>
							<span>You must be logged in to view your published projects!</span>
						</div>
						<script type="text/javascript">
							$('#MyProjects').click(function () {
								$('#header-login').addClass('active')
								$('#iFrameLogin').css('display', 'block')
							})
						</script>
					{/if}
				</div>
			</div>
			<div id="ButtonRow" class="divider-top divider-left divider-bottom">
				<a class="btn-medium btn-primary" id="EditButton">Edit</a>
				<a class="btn-medium btn-primary" id="BuildButton">Build</a>
				<a class="btn-medium btn-negative" id="CollapseButton">Cancel</a>
			</div>
		</div>
	</div>

	<div class="GenericModal modalPopup unifiedModal smallModal" style="display: none">
		<div class="Title"></div>
		<div class="GenericModalBody">
			<div>
				<div class="ImageContainer">
					<!-- svelte-ignore a11y-img-redundant-alt -->
					<img class="GenericModalImage" alt="generic image" />
				</div>
				<div class="Message"></div>
			</div>
			<div class="clear"></div>
			<div id="GenericModalButtonContainer" class="GenericModalButtonContainer">
				<!-- svelte-ignore a11y-missing-attribute -->
				<a class="ImageButton btn-neutral btn-large roblox-ok">OK<span class="btn-text">OK</span></a
				>
			</div>
		</div>
	</div>
	<script type="text/javascript">
		$(function () {
			Roblox.Client.Resources = {
				//<sl:translate>
				here: 'here',
				youNeedTheLatest: 'You need Our Plugin for this.  Get the latest version from ',
				plugInInstallationFailed: 'Plugin installation failed!',
				errorUpdating: 'Error updating: '
				//</sl:translate>
			}

			if (typeof Roblox.IDEWelcome === 'undefined') Roblox.IDEWelcome = {}

			Roblox.IDEWelcome.Resources = {
				//<sl:translate>
				openProject: 'Open Project',
				openProjectText: 'To open your project, open to this page in ',
				robloxStudio: 'Hexagon Studio',
				editPlace: 'Edit Place',
				toEdit: 'To edit ',
				openPage: ', open to this page in ',
				buildPlace: 'Build Place',
				toBuild: 'To build on ',
				placeInactive: 'Place Inactive',
				activate: ', activate this place by going to File->My Published Projects.',
				emailVerifiedTitle: 'Verify Your Email',
				emailVerifiedMessage:
					"You must verify your email before you can work on your place. You can verify your email on the <a href='/My/Account.aspx?confirmemail=1'>Account</a> page.",
				verify: 'Verify',
				appStudioTitle: 'Warning',
				appStudioBody:
					'If you edit this place in Studio, it may no longer function properly within the App.',
				OK: 'OK'
				//</sl:translate>
			}
		})
	</script>

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
					<img class="GenericModalImage" alt="generic" />
				</div>
				<div class="Message"></div>
			</div>
			<div class="ConfirmationModalButtonContainer">
				<!-- svelte-ignore a11y-missing-attribute -->
				<a roblox-confirm-btn><span></span></a>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a roblox-decline-btn><span></span></a>
			</div>
			<div class="ConfirmationModalFooter"></div>
		</div>
		<script type="text/javascript">
			var Roblox = Roblox || {}
			Roblox.GenericConfirmation = Roblox.GenericConfirmation || {}

			//<sl:translate>
			Roblox.GenericConfirmation.Resources = { yes: 'Yes', No: 'No' }
			//</sl:translate>
		</script>
	</div>
</body>
