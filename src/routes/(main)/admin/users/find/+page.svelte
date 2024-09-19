<script lang="ts">
	import { Input } from '$src/components/ui/input'

	import { Separator } from '$src/components/ui/separator'

	import * as Form from '$src/components/ui/form'
	import * as Table from '$src/components/ui/table'
	import { usernameSchema, idSchema, discordIdSchema } from './schema'

	import type { ActionData, PageData } from './$types'

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'

	import { page } from '$app/stores'
	import { Loader2 } from 'lucide-svelte'

	$: redirect = $page.url.searchParams.get('redirect')

	export let data: PageData

	export let form: ActionData

	const usernameform = superForm(data.usernameForm, {
		validators: zodClient(usernameSchema)
	})

	const {
		form: usernameData,
		enhance: usernameEnhance,
		submitting: usernameSubmitting
	} = usernameform

	const idForm = superForm(data.idForm, {
		validators: zodClient(idSchema)
	})

	const discordIdForm = superForm(data.discordIdForm, {
		validators: zodClient(discordIdSchema)
	})

	const { form: idData, enhance: idEnhance, submitting: idSubmitting } = idForm

	const {
		form: discordIdData,
		enhance: discordIdEnhance,
		submitting: discordIdSubmitting
	} = discordIdForm
</script>

<div class="p-8 flex flex-col space-y-4">
	<form class="flex align-middle space-x-4" method="POST" action="?/username" use:usernameEnhance>
		<h1 class="text-xl">Username:</h1>
		<Form.Field form={usernameform} name="username">
			<Form.Control let:attrs>
				<Input {...attrs} bind:value={$usernameData.username} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button disabled={$usernameSubmitting} variant="outline">
			{#if $usernameSubmitting}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Search</Form.Button
		>
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
		<Form.Button disabled={$idSubmitting} variant="outline"
			>{#if $idSubmitting}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{/if}Search</Form.Button
		>
	</form>

	<form
		class="flex align-middle space-x-4 whitespace-pre"
		method="POST"
		action="?/discordid"
		use:discordIdEnhance
	>
		<h1 class="text-xl">Discord ID:</h1>
		<Form.Field form={discordIdForm} name="discordid">
			<Form.Control let:attrs>
				<Input type="number" {...attrs} bind:value={$discordIdData.discordid} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button disabled={$discordIdSubmitting} variant="outline"
			>{#if $discordIdSubmitting}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{/if}Search</Form.Button
		>
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
