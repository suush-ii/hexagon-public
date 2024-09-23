<script lang="ts">
	import { Button } from '$src/components/ui/button'
	import { Loader2, Check, X } from 'lucide-svelte'

	import EmptyCard from '$src/components/emptyCard.svelte'

	import { pageName } from '$src/stores'

	pageName.set('Admin')

	import type { PageData } from './$types'
	import { Label } from '$src/components/ui/label'
	import { superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { formSchema } from '$lib/schemas/queueschema'
	import * as Form from '$src/components/ui/form'
	import { questions } from '$lib/questions'
	import { Input } from '$src/components/ui/input'

	export let data: PageData

	let form = superForm(data.form, {
		validators: zodClient(formSchema)
	})

	const { form: formData, enhance, submitting } = form
</script>

<div class="p-8 flex flex-col space-y-4 grow">
	<h1 class="text-xl">Queue: {data.applicationQueueCount}</h1>

	<div class="mx-auto w-full max-w-4xl">
		<div class="flex flex-col gap-y-2">
			{#if data.application && data.application.questions}
				<h1 class="select-all text-center">{data.application.applicationid}</h1>

				<form method="POST" enctype="multipart/form-data" class="space-y-2" use:enhance>
					{#each data.application.questions as question}
						<div>
							<Label>{questions[question.question].label}</Label>

							<p class="text-sm text-muted-foreground">
								{questions[question.question].description}
							</p>

							<p
								class="text-sm bg-muted-foreground/10 p-4 rounded-xl {question.question ===
								'verificationPhrase'
									? ''
									: 'h-24'} overflow-auto"
							>
								{question.answer}
							</p>
						</div>
					{/each}

					<div>
						<Label>Discord ID</Label>

						<p class="text-sm bg-muted-foreground/10 p-4 rounded-xl">
							{data.application.discordid}
						</p>
					</div>

					<div class="flex justify-between gap-x-2 mt-auto">
						<Button
							variant="outline"
							on:click={() => {
								$formData.approved = false
							}}
							class="w-full"
							>{#if $formData.approved === false}<X />{:else}Deny{/if}</Button
						>
						<Button
							variant="outline"
							on:click={() => {
								$formData.approved = true
							}}
							class="bg-success w-full"
							>{#if $formData.approved === true}<Check />{:else}Approve{/if}</Button
						>
					</div>

					<input type="hidden" name="approved" bind:value={$formData.approved} />

					<input type="hidden" name="applicationid" bind:value={$formData.applicationid} />

					<Form.Button disabled={$submitting} variant="outline" class="w-full">
						{#if $submitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Submit
					</Form.Button>

					<Form.Field {form} name="internalreason">
						<Form.Control let:attrs>
							<Form.Label>Internal Note</Form.Label>
							<Input
								maxlength={50}
								placeholder="(Optional)"
								{...attrs}
								bind:value={$formData.internalreason}
							/>
						</Form.Control>
						<Form.Description>Anything that could be helpful for moderation.</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
				</form>
			{:else}
				<EmptyCard />
			{/if}
		</div>
	</div>
</div>
