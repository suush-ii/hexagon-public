<script lang="ts">
	import { page } from '$app/stores'
	import type { PageData } from './$types'
	import * as Table from '$src/components/ui/table'
	import PaginationWrapper from '$src/components/pagnationWrapper.svelte'
	import Avatar from '$src/components/users/avatar.svelte'

	export let data: PageData
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">Referrals</h1>

	<table class="table-fixed border-separate border-spacing-y-4 w-full">
		<tbody>
			<tr>
				<td class="w-28">Referral Link:</td>
				<td>
					<h1 class="border p-3 rounded-xl select-all">
						{$page.url.origin}?referral={data.user.userid}#{data.user.username}
					</h1></td
				>
			</tr>
		</tbody>
	</table>

	<h2>For every person you invite using your link you receive 25 moons!</h2>

	<Table.Root class="">
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">{data.t('transactions.date')}</Table.Head>
				<Table.Head class="w-full">{data.t('transactions.member')}</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if data.referrals}
				{#each data.referrals as referral}
					<Table.Row>
						<Table.Cell>{referral?.reviewed?.toLocaleDateString('en-US')}</Table.Cell>
						<Table.Cell
							><a href="/users/{referral.signupuserid ?? 0}/profile">
								<Table.Cell class="flex gap-x-2 items-center truncate w-[150px] hover:underline"
									><Avatar
										state={'offline'}
										userid={referral.signupuserid ?? 0}
										css="h-7 w-7"
										disableoutline={true}
									/>
									{referral.user?.username}
								</Table.Cell></a
							></Table.Cell
						>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>

	<div class="mt-auto">
		<PaginationWrapper count={data.referralCount} size={30} url={$page.url} />
	</div>
</div>
