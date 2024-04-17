<script lang="ts">
	import SidePanel from '$src/components/admin/sidepanel.svelte'

	import { pageName } from '$src/stores'

	pageName.set('Admin')

	import type { PageData } from './$types'

	export let data: PageData

	let summary = [
		{ friendlyName: 'Username', value: 'Sushi' },
		{ friendlyName: 'Moderation Status', value: 'Ok' },
		{ friendlyName: 'UserId', value: 2 },
		{ friendlyName: 'Membership Type', value: 'N/A' },
		{ friendlyName: 'Joindate', value: '4/20/2024' }
	]
</script>

<div class="p-4">
	<SidePanel role={data.session.role} />
</div>

<div class="p-8 flex flex-col space-y-4 grow">
	<h1 class="text-lg">Account Summary</h1>

	<div class="p-4 max-w-4xl">
		<table class="table-fixed text-lg">
			<tbody>
				{#each summary as key}
					<tr>
						<td class="px-12 py-1">{key.friendlyName}: </td>
						<td class="px-12 py-1">{key.value}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
