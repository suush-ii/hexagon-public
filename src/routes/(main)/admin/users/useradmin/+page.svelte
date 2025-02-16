<script lang="ts">
	import { pageName } from '$src/stores'
	import Avatar from '$src/components/users/avatar.svelte'

	pageName.set('Admin')

	import * as Table from '$src/components/ui/table'

	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { questions } from '$lib/questions'
	import { Label } from '$src/components/ui/label'

	export let data: PageData

	$: username = data.username

	$: userid = data.userid

	$: joindate = data.joindate

	$: discordId = data.discordid

	$: summary = [
		{ friendlyName: 'Username', value: username },
		{ friendlyName: 'Moderation Status', value: data.banid ? 'Moderated' : 'Ok' },
		{ friendlyName: 'UserId', value: userid },
		{ friendlyName: 'Membership Type', value: 'N/A' },
		{ friendlyName: 'Discord ID', value: discordId ?? 'N/A' },
		{ friendlyName: 'Joindate', value: joindate?.toLocaleDateString('en-US') }
	]
</script>

<div class="p-8 flex flex-col space-y-4 grow h-full">
	<h1 class="text-lg">Account Summary</h1>

	<div class="flex w-full gap-x-8">
		<div
			class="p-4 flex flex-col supports-backdrop-blur:bg-background/60 bg-muted-foreground/5 rounded-xl"
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
							<a class="hover:underline" href="/admin/users/tradehistory?id={data.userid}"
								>Trade History</a
							>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		{#if data.application && data.application.questions}
			<div class="w-full max-w-2xl">
				<h1 class="text-lg">Application</h1>
				{#each data.application.questions as question}
					<div>
						<Label>{questions[question.question].label}</Label>

						<p class="text-sm text-muted-foreground">
							{questions[question.question].description}
						</p>

						<p class="text-sm bg-muted-foreground/10 p-4 rounded-xl h-32 max-w-5xl overflow-auto">
							{question.answer}
						</p>
					</div>
				{/each}

				<div>
					<Label>Internal Note</Label>

					<p class="text-sm bg-muted-foreground/10 p-4 rounded-xl h-32 max-w-5xl overflow-auto">
						{data.application.internalreason ?? 'N/A'}
					</p>
				</div>
			</div>
		{/if}

		<div class="w-full max-w-2xl">
			<h1 class="text-lg">Possible Alts</h1>

			<Table.Root class="text-center">
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[100px]">Username</Table.Head>
						<Table.Head>UserID</Table.Head>
						<Table.Head>Role</Table.Head>
						<Table.Head>Moderation Status</Table.Head>
						<Table.Head class="text-right">Joined</Table.Head>
						<Table.Head class="text-right">Matched</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.altsIp as user}
						<Table.Row>
							<Table.Cell
								><a href="/admin/users/useradmin?id={user.userid}" class="hover:underline"
									>{user.username}</a
								></Table.Cell
							>
							<Table.Cell>{user.userid}</Table.Cell>
							<Table.Cell>{user.role}</Table.Cell>
							<Table.Cell>Ok</Table.Cell>
							<Table.Cell class="text-right">{user.joindate.toLocaleDateString('en-US')}</Table.Cell
							>
							<Table.Cell class="text-right">{'IP'}</Table.Cell>
						</Table.Row>
					{/each}

					{#each data.altsMac as user}
						<Table.Row>
							<Table.Cell
								><a href="/admin/users/useradmin?id={user.userid}" class="hover:underline"
									>{user.username}</a
								></Table.Cell
							>
							<Table.Cell>{user.userid}</Table.Cell>
							<Table.Cell>{user.role}</Table.Cell>
							<Table.Cell>Ok</Table.Cell>
							<Table.Cell class="text-right">{user.joindate.toLocaleDateString('en-US')}</Table.Cell
							>
							<Table.Cell class="text-right">{'Mac'}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>

	<div class="max-w-3xl">
		<h1 class="text-lg">Punishments</h1>
		<Table.Root class="">
			<Table.Header>
				<Table.Row>
					<Table.Head>ID</Table.Head>
					<Table.Head class="w-[100px] text-center">Action</Table.Head>
					<Table.Head>Moderator</Table.Head>
					<Table.Head class="text-center">Created</Table.Head>
					<Table.Head class="text-center">Expiration</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.punishments as punishment}
					<Table.Row>
						<Table.Cell>{punishment.banid}</Table.Cell>
						<Table.Cell class="text-center">{punishment.action}</Table.Cell>
						<Table.Cell
							><a
								target="_blank"
								class="hover:underline"
								href="/users/{punishment.moderator?.userid}/profile"
								>{punishment.moderator?.username}</a
							></Table.Cell
						>
						<Table.Cell class="text-center"
							>{punishment.time.toLocaleDateString('en-US')}
							{punishment.time.toLocaleTimeString('en-US')}</Table.Cell
						>
						<Table.Cell class="text-center"
							>{punishment.expiration.toLocaleDateString('en-US')}
							{punishment.expiration.toLocaleTimeString('en-US')}</Table.Cell
						>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
		<PaginationWrapper count={data.punishmentsCount} size={5} url={$page.url} />
	</div>
</div>
