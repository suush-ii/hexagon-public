<script lang="ts">
	import { pageName } from '$src/stores'
	import Avatar from '$src/components/users/avatar.svelte'

	pageName.set('Admin')

	import * as Table from '$src/components/ui/table'

	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	import type { PageData } from './$types'

	export let data: PageData

	$: username = data.username

	$: userid = data.userid

	$: joindate = data.joindate

	$: summary = [
		{ friendlyName: 'Username', value: username },
		{ friendlyName: 'Moderation Status', value: 'Ok' },
		{ friendlyName: 'UserId', value: userid },
		{ friendlyName: 'Membership Type', value: 'N/A' },
		{ friendlyName: 'Joindate', value: joindate?.toLocaleDateString('en-US') }
	]
</script>

<div class="p-8 flex flex-col space-y-4 grow">
	<h1 class="text-lg">Account Summary</h1>

	<div
		class="p-4 max-w-3xl flex flex-col supports-backdrop-blur:bg-background/60 bg-muted-foreground/5 rounded-xl"
	>
		<table class="table-fixed text-lg">
			<tbody>
				{#each summary as key}
					<tr>
						<td class="px-8 py-1">{key.friendlyName}: </td>
						<td class="px-8 py-1">{key.value}</td>
					</tr>
				{/each}
				<tr>
					<td class="px-8 py-1"
						><Avatar
							css="xl:h-96 h-fit w-full max-w-96 aspect-square"
							userid={data.userid}
							username={data.username}
							type="avatar"
							disable3d={true}
						/>
					</td>
					<td class="px-8 py-1 flex flex-col mt-4">
						<a class="hover:underline" href="/users/{data.userid}/profile">User Homepage</a>
						<a class="hover:underline" href="/admin/users/moderateuser?id={data.userid}"
							>Moderate User</a
						>
					</td>
				</tr>
			</tbody>
		</table>
	</div>

	<h1 class="text-lg">Punishments</h1>
</div>
