<script lang="ts">
	import { pageName } from '$src/stores'
	import Avatar from '$src/components/catalog/avatar.svelte'

	pageName.set('Admin')

	import type { PageData } from './$types'
	import { moveSchema } from './schema'

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import * as Form from '$src/components/ui/form'
	import { Input } from '$src/components/ui/input'
	import { Loader2 } from 'lucide-svelte'
	import { Button } from '$src/components/ui/button'
	import * as AlertDialog from '$src/components/ui/alert-dialog'
	import { Separator } from '$src/components/ui/separator'

	export let data: PageData

	const moveForm = superForm(data.moveForm, {
		validators: zodClient(moveSchema),
		onResult: async ({ result }) => {
			if (result.type === 'success') {
				openMove = false
			}
		}
	})

	const { form: moveData, enhance: moveEnhance, submitting: moveSubmitting } = moveForm

	$: summary = [
		{ friendlyName: 'Asset Name', value: data.item.asset.assetname },
		{ friendlyName: 'Asset Type', value: data.item.asset.assetType },
		{
			friendlyName: 'Moderation Status',
			value: data.item.asset.moderationstate === 'rejected' ? 'Moderated' : 'Ok'
		},
		{ friendlyName: 'AssetId', value: data.item.asset.assetid },
		{ friendlyName: 'Obtained', value: data.item.obatineddate?.toLocaleDateString('en-US') },
		{ friendlyName: 'Owner', value: data.item.owner.username },
		{ friendlyName: 'OwnerId', value: data.item.owner.userid }
	]

	let openMove = false
</script>

<div class="p-8 flex flex-col space-y-4 grow max-w-5xl h-full">
	<h1 class="text-lg">Item Summary</h1>

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
					<td class="px-8 py-1">
						<Avatar
							css="xl:h-96 h-fit w-full max-w-96 aspect-square"
							itemName={data.item.asset.assetname}
							itemId={data.item.asset.assetid}
							disable3d={true}
						/>
					</td>
					<td class="px-8 py-1 flex flex-col mt-4">
						<a class="hover:underline" href="/catalog/{data.item.asset.assetid}">Asset Page</a>
						<a class="hover:underline" href="/users/{data.item.owner.userid}/profile">Owner Page</a>

						<div class="flex flex-col mt-24">
							<h1 class="text-destructive">Danger Zone</h1>

							<h1 class="text-xl">Move Item</h1>

							<form
								class="flex align-middle space-x-4 items-center"
								method="POST"
								action="?/move"
								use:moveEnhance
							>
								<h1 class="text-xl">User ID:</h1>
								<Form.Field form={moveForm} name="userId">
									<Form.Control let:attrs>
										<Input type="number" {...attrs} bind:value={$moveData.userId} />
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
								<AlertDialog.Root closeOnOutsideClick={true} bind:open={openMove}>
									<AlertDialog.Trigger asChild let:builder>
										<Button
											type="button"
											builders={[builder]}
											disabled={$moveSubmitting}
											variant="outline"
											>{#if $moveSubmitting}
												<Loader2 class="mr-2 h-4 w-4 animate-spin" />
											{/if}Move</Button
										>
									</AlertDialog.Trigger>

									<AlertDialog.Content>
										<AlertDialog.Header>
											<AlertDialog.Title class="text-xl font-semibold">
												<div class="flex justify-between">Move Item</div>

												<Separator />
											</AlertDialog.Title>

											<AlertDialog.Description class="text-lg flex flex-col gap-y-4">
												<div class="flex flex-row flex-wrap line-clamp-2 break-all">
													Are you sure you want to move this item?
												</div>
												<Avatar
													css="mx-auto aspect-square w-40 rounded-xl"
													itemId={data.item.asset.assetid}
													itemName={data.item.asset.assetname}
													disable3d={true}
												/>
											</AlertDialog.Description>
										</AlertDialog.Header>

										<AlertDialog.Footer class="mx-auto">
											<Form.Button
												disabled={$moveSubmitting}
												on:click={() => {
													moveForm.submit()
												}}>Move</Form.Button
											>
											<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
										</AlertDialog.Footer>
									</AlertDialog.Content>
								</AlertDialog.Root>
							</form>

							<AlertDialog.Root closeOnOutsideClick={true}>
								<AlertDialog.Trigger asChild let:builder>
									<Button builders={[builder]} variant="outline" type="button">Delete</Button>
								</AlertDialog.Trigger>

								<AlertDialog.Content>
									<form method="POST" action="?/delete">
										<AlertDialog.Header>
											<AlertDialog.Title class="text-xl font-semibold">
												<div class="flex justify-between">Delete Item</div>

												<Separator />
											</AlertDialog.Title>

											<AlertDialog.Description class="text-lg flex flex-col gap-y-4">
												<div class="flex flex-row flex-wrap line-clamp-2 break-all">
													Are you sure you want to delete this item?
												</div>
												<Avatar
													css="mx-auto aspect-square w-40 rounded-xl"
													itemId={data.item.asset.assetid}
													itemName={data.item.asset.assetname}
													disable3d={true}
												/>
											</AlertDialog.Description>
										</AlertDialog.Header>

										<AlertDialog.Footer class="mx-auto">
											<Button type="submit">Delete</Button>
											<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
										</AlertDialog.Footer>
									</form>
								</AlertDialog.Content>
							</AlertDialog.Root>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
