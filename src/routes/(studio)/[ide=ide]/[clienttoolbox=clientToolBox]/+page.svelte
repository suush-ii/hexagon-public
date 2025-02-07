<script lang="ts">
	// @ts-nocheck

	import './toolbox2.postcss'

	import type { PageData } from './$types'

	export let data: PageData
</script>

<svelte:head>
	<script type="text/javascript" src="/ide/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="/ide/jquery-migrate-1.2.1.min.js"></script>

	<script type="text/javascript" src="/ide/js/c3bd87c55384d381d7f38923c361e408.js"></script>
</svelte:head>
<body ng-app="clientToolbox">
	{@html `
	 <script type='text/javascript'>
        var Roblox = Roblox || {};
        Roblox.ClientToolboxLinks =
        {
            HeaderTemplateLink: "/viewapp/studio/toolbox/header.html",
            SubnavTemplateLink: "/viewapp/studio/toolbox/subnav.html",
            PaginationTemplateLink: "/viewapp/studio/toolbox/pagination.html",
            AssetsTemplateLink: "/viewapp/studio/toolbox/assets.html",
            ThumbnailTemplateLink: "/viewapp/studio/toolbox/thumbnail.html",
            GetSetsByCreatorLink: "/sets/get-by-creator",
            GetRobloxSetsLink: "/sets/get-roblox-sets",
            GetSubscribedSetsLink: "/sets/get-subscribed",
            GetAssetsLink: "/ide/toolbox/items",
            GetSetItemsLink: "/sets/0/items",
            VoteStudioLink: "/voting/studio/vote",
            UnvoteStudioLink: "/voting/studio/unvote",
            InsertAssetLink: "/ide/insertasset",
            GetGroupsCanManageGamesInLink: "/groups/can-manage-games"
        };
        Roblox.AssetType = {
            "10": "FreeModels",
            "13": "FreeDecals",
        };
        Roblox.ClientToolboxModel = {
            // type cast to boolean for javascript
            IsUserAuthenticated: ${data.userid ? 'true' : 'false'},
            ContentUrl: "http://www.roblox.com/asset/",
            UserId: "${data.userid ? data.userid : '-1'}",
            ShowGroupCategories: false
        };
        Roblox.jsConsoleEnabled = false;
        Roblox.EnableNewToolboxSearch = true;
    </script>`}

	<div
		id="image-retry-data"
		data-image-retry-max-times="10"
		data-image-retry-timer="1500"
		data-ga-logging-percent="10"
	></div>
	<div roblox-toolbox>
		<div roblox-toolbox-header class="client-toolbox-header"></div>
		<div
			ng-controller="RobloxReferralLink"
			ng-show="showReferralLinks()"
			class="client-toolbox-referral-links"
		>
			Try searching for:
			<a href ng-click="refer('NPC')">NPC</a>
			<a href ng-click="refer('Vehicle')">Vehicle</a>
			<a href ng-click="refer('Weapon')">Weapon</a>
			<a href ng-click="refer('Building')">Building</a>
			<a href ng-click="refer('Light')">Light</a>
		</div>
		<div roblox-toolbox-subnav class="client-toolbox-subnav"></div>
		<div roblox-toolbox-assets class="client-toolbox-content"></div>

		<div roblox-toolbox-pagination class="client-toolbox-subnav"></div>
	</div>
</body>
