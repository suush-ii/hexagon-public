<script lang="ts">
	import SidePanel from '$src/components/admin/sidepanel.svelte'

	import { Input } from '$src/components/ui/input'

	import { Separator } from '$src/components/ui/separator'

	import * as Form from '$src/components/ui/form'
	import * as Table from '$src/components/ui/table'
	import { usernameSchema, idSchema } from './schema'

	import type { ActionData, PageData } from './$types'

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'

	import { page } from '$app/stores'

	$: redirect = $page.url.searchParams.get('redirect')

	export let data: PageData

	export let form: ActionData

	const usernameform = superForm(data.usernameForm, {
		validators: zodClient(usernameSchema)
	})

	const { form: usernameData, enhance: usernameEnhance } = usernameform

	const idForm = superForm(data.idForm, {
		validators: zodClient(idSchema)
	})

	const { form: idData, enhance: idEnhance } = idForm
</script>

<div class="p-4">
	<SidePanel role={data.user.role} />
</div>

<div class="p-8 flex flex-col space-y-4">
	<form class="flex align-middle space-x-4" method="POST" action="?/username" use:usernameEnhance>
		<h1 class="text-xl">Username:</h1>
		<Form.Field form={usernameform} name="username">
			<Form.Control let:attrs>
				<Input {...attrs} bind:value={$usernameData.username} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button variant="outline">Search</Form.Button>
	</form>

	<Separator />

	<form
		class="flex align-middle space-x-4 whitespace-pre"
		method="POST"
		action="?/id"
		use:idEnhance
	>
		<h1 class="text-xl">User ID:</h1>
		<Form.Field form={idForm} name="userid">
			<Form.Control let:attrs>
				<Input type="number" {...attrs} bind:value={$idData.userid} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button variant="outline">Search</Form.Button>
	</form>
	{#if form?.users}
		<div>
			<h1>Search Results</h1>

			<Table.Root class="text-center">
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[100px]">Username</Table.Head>
						<Table.Head>UserID</Table.Head>
						<Table.Head>Role</Table.Head>
						<Table.Head>Moderation Status</Table.Head>
						<Table.Head class="text-right">Joined</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each form.users as user}
						<Table.Row>
							<Table.Cell
								><a
									href="/admin/users/{redirect ?? 'useradmin'}?id={user.userid}"
									class="hover:underline">{user.username}</a
								></Table.Cell
							>
							<Table.Cell>{user.userid}</Table.Cell>
							<Table.Cell>{user.role}</Table.Cell>
							<Table.Cell>Ok</Table.Cell>
							<Table.Cell class="text-right">{user.joindate.toLocaleDateString('en-US')}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
