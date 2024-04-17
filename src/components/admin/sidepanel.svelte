<script lang="ts">
	import type { userRole } from '$lib/types'

	let subLists = [
		{
			title: 'People',
			links: [
				{ title: 'Find', href: '/admin/users/find' },
				{ title: 'User Admin', href: '/admin/users/useradmin' },
				{ title: 'Moderate User', href: '/admin/users/moderateuser' }
			]
		},
		{
			title: 'Catalog',
			links: [
				{ title: 'Upload', href: '/admin/catalog/upload' },
				{ title: 'Queue', href: '/admin/catalog/queue' }
			]
		}
	]

	export let role: userRole
</script>

<svelte:head>
	<style>
		.path:before {
			background-color: hsl(var(--secondary-foreground));
			width: 2px;
			content: '';
			position: absolute;
			top: 20px;
			bottom: 12px;
			left: 2px;
		}
		.path2:after {
			background-color: hsl(var(--secondary-foreground));
			width: 8px;
			height: 2px;
			content: '';
			position: absolute;
			top: 14px;
			left: -12px;
		}
	</style>
	<!--Absolutely disgusting-->
</svelte:head>

<div
	class="p-4 h-full rounded-xl supports-backdrop-blur:bg-background/60 bg-muted-foreground/5 flex flex-col gap-y-4"
>
	<h1 class="text-4xl leading-none tracking-tight font-semibold text-center">Admin</h1>

	<h1 class="text-lg leading-none tracking-tight font-semibold text-center">
		Role: {role.charAt(0).toUpperCase() + role.slice(1)}
	</h1>

	<ul class="list-disc list-inside relative text-xl overflow-y-auto">
		<li class="path"><a href="/admin">Admin Panel</a></li>

		<li class="path2 ml-4 relative"><a href="/admin/configuration">Configuration</a></li>

		<li class="path2 ml-4 relative"><a href="/admin/sitealert">Site Alert</a></li>
		<li class="path2 ml-4 relative"><a href="/admin/logs">Logs</a></li>

		{#each subLists as { title, links }}
			<ul class="list-disc list-inside ml-4 relative">
				<li class="path path2">{title}</li>
				<ul class="list-disc list-inside ml-4">
					{#each links as { title, href }}
						<li class="path2 relative"><a {href}>{title}</a></li>
					{/each}
				</ul>
			</ul>
		{/each}
	</ul>
</div>
