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
</script>

<div class="p-8 flex flex-col space-y-4 grow">
	<h1 class="text-lg">Moderate {username}</h1>
</div>
