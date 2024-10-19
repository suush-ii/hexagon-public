<script lang="ts">
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { Separator } from '$src/components/ui/separator'
	import { Input } from '$src/components/ui/input'
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms'
	import { type FormSchema, formSchema } from '$lib/schemas/changepasswordschema'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { Key } from 'lucide-svelte'
	import * as Form from '$src/components/ui/form'
	import { page } from '$app/stores'

	export let changePasswordForm: SuperValidated<Infer<FormSchema>>

	let form = superForm(changePasswordForm, {
		validators: zodClient(formSchema),
		onResult: async (result) => {
			if (result.result.type === 'success') {
				openChangePassword = false
			}
		}
	})

	const { form: formData, enhance, submitting } = form

	let openChangePassword = false

	export function open() {
		openChangePassword = true
	}
</script>

<AlertDialog.Root closeOnOutsideClick={true} bind:open={openChangePassword}>
	<AlertDialog.Content class="space-y-2">
		<form method="POST" class="space-y-2 flex flex-col" action="?/changepassword" use:enhance>
			<AlertDialog.Header class="space-y-6">
				<AlertDialog.Title class="text-xl font-semibold">
					Change Password
					<Separator />
				</AlertDialog.Title>
			</AlertDialog.Header>
			<div class="flex gap-x-4 mx-auto w-full">
				<div class="flex flex-col w-full">
					<h1 class="flex items-center gap-x-1">Current Password:</h1>
					<Form.Field {form} name="password">
						<Form.Control let:attrs>
							<Form.Label>{$page.data.t('signUpLogin.password')}</Form.Label>
							<Input
								disabled={$submitting}
								placeholder="(Unique)"
								type="password"
								icon={Key}
								direction="r"
								{...attrs}
								bind:value={$formData.password}
							/>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<h1 class="flex items-center gap-x-1">New Password:</h1>
					<Form.Field {form} name="newpassword">
						<Form.Control let:attrs>
							<Form.Label>{$page.data.t('signUpLogin.password')}</Form.Label>
							<Input
								disabled={$submitting}
								placeholder="(Unique)"
								type="password"
								icon={Key}
								direction="r"
								{...attrs}
								bind:value={$formData.newpassword}
							/>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
			<AlertDialog.Footer class="mx-auto">
				<Form.Button disabled={$submitting}>Submit</Form.Button>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
