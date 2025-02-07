<script lang="ts">
	import { pageName } from '$src/stores'
	import Avatar from '$src/components/users/avatar.svelte'
	import * as Form from '$src/components/ui/form'
	import * as RadioGroup from '$src/components/ui/radio-group'
	import { Textarea } from '$src/components/ui/textarea'
	import { Button } from '$src/components/ui/button'
	import Assetcardprimitive from '$src/components/admin/assetcardprimitive.svelte'
	import { Checkbox } from '$src/components/ui/checkbox/index.js'

	pageName.set('Admin')

	import * as Table from '$src/components/ui/table'

	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'

	import { moderationSchema } from './schema'

	import type { PageData } from './$types'
	import { Loader2 } from 'lucide-svelte'

	import { actions } from './schema'
	import Warntext from '$src/components/warntext.svelte'
	import { page } from '$app/stores'

	export let data: PageData

	const form = superForm(data.form, {
		validators: zodClient(moderationSchema)
	})

	const { form: formData, enhance, submitting, message } = form

	$: username = data.username

	$: userid = data.userid

	$: joindate = data.joindate

	const autoFill = {
		Spam: "Please don't spam on Hexagon.",
		Swear: 'Do not swear.',
		'Spam Alt': 'Do not post spam.',
		Link: 'Do not post bad links.',
		Harassment:
			'Do not harass other users. Do not say inappropriate or mean things about others on Hexagon.',
		Scam: 'Do not scam other users.',
		'Bad Image': 'Do not post inappropriate images.',
		'Bad Audio': 
			'Do not attempt to upload egregiously loud audio. This includes any \'bypass\' audio from other platforms, and inappropiately boosted audio.',
		'Exploit1D':
			'Your account has been detected as exploiting on Hexagon. Please discontinue this behavior immediately, as this is your only warning to not exploit on Hexagon.',
		'ExploitDEL':
			'Your account has been detected as exploiting on Hexagon. You are no longer welcome on Hexagon.'
	}
	$: if ($formData.scrubusername) {
		$formData.action = 'Delete'
	}
</script>

<div class="p-8 flex flex-col space-y-4 grow">
	<h1 class="text-lg">Moderate {username}</h1>

	<form class="flex gap-x-12" method="POST" use:enhance>
		<Form.Fieldset {form} name="action" class="space-y-3">
			<Form.Legend>Action:</Form.Legend>
			{#each actions as action}
				<RadioGroup.Root bind:value={$formData.action} class="flex flex-col space-y-1">
					<div class="flex items-center space-x-3 space-y-0">
						<Form.Control let:attrs>
							<RadioGroup.Item value={action} {...attrs} />
							<Form.Label class="font-normal">{action}</Form.Label>
						</Form.Control>
					</div>
					<RadioGroup.Input name="action" />
				</RadioGroup.Root>
			{/each}
			<Form.FieldErrors />
		</Form.Fieldset>

		<div class="grow space-y-3 max-w-4xl">
			<Form.Field {form} name="note">
				<Form.Control let:attrs>
					<Form.Label>Note to {username}:</Form.Label>
					<Textarea {...attrs} class="resize-none" bind:value={$formData.note} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="internalnote">
				<Form.Control let:attrs>
					<Form.Label>Internal Note:</Form.Label>
					<Textarea {...attrs} class="resize-none" bind:value={$formData.internalnote} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field
				{form}
				name="scrubusername"
				class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
			>
				<Form.Control let:attrs>
					<Checkbox {...attrs} bind:checked={$formData.scrubusername} />
					<div class="space-y-1 leading-none">
						<Form.Label
							><span class="font-bold tracking-tighter">Scrub Username:</span> This will set the user's
							name to [Content Deleted]. Making it impossible for them to log in. It will also delete
							this account.</Form.Label
						>
					</div>
					<input name={attrs.name} value={$formData.scrubusername} hidden />
				</Form.Control>
			</Form.Field>

			<Form.Button disabled={$submitting} variant="outline" size="lg" class="w-full">
				{#if $submitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Submit</Form.Button
			>
			{#if $message}<Warntext text={$message} />{/if}
		</div>

		<div class="flex flex-col gap-y-4">
			<h5 class="text-sm font-medium leading-none">Auto-fill fields</h5>
			{#each Object.entries(autoFill) as [name, value]}
				<Button
					size="sm"
					class="h-8"
					on:click={() => {
						$formData.note = value
						$formData.internalnote = name
					}}>{name}</Button
				>
			{/each}
		</div>

		{#if data.asset}
			<div>
				<h1 class="text-xl">Current abuses to review for {username}</h1>

				<div class="w-[350px] flex flex-col">
					<Assetcardprimitive
						assetName={data.asset.scrubbedassetname ?? data.asset.assetname}
						assetType={data.asset.assetType}
						assetUrl={data.asset.simpleasseturl}
					/>
				</div>
			</div>
		{/if}
	</form>

	<div class="flex gap-x-8">
		<div class="p-4 flex supports-backdrop-blur:bg-background/60 bg-muted-foreground/5 rounded-xl">
			<Avatar
				css="xl:h-96 h-fit w-full max-w-96 aspect-square"
				userid={data.userid}
				username={data.username}
				type="avatar"
				disable3d={true}
			/>

			<div class="flex flex-col">
				<a class="hover:underline" href="/users/{data.userid}/profile">User Homepage</a>
				<a class="hover:underline" href="/admin/users/useradmin?id={data.userid}"
					>User Admin Profile</a
				>
			</div>
		</div>

		<div>
			<h1 class="text-lg">Past Punishments</h1>
			<div class="max-w-4xl space-y-4 h-full">
				<Table.Root class="mb-auto">
					<Table.Header>
						<Table.Row>
							<Table.Head>ID</Table.Head>
							<Table.Head class="w-[100px] text-center">Action</Table.Head>
							<Table.Head>Moderator</Table.Head>
							<Table.Head>Internal Note</Table.Head>
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
								<Table.Cell>{punishment.internalreason}</Table.Cell>
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
	</div>
</div>
