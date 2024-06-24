<script lang="ts">
	import * as Select from '$src/components/ui/select/index.js'
	import { themes } from '$lib/themes'
	import { browser } from '$app/environment'

	let current_theme = ''
	if (browser) {
		const theme = window.localStorage.getItem('theme')
		if (theme && themes.includes(theme)) {
			document.documentElement.setAttribute('class', theme)
			current_theme = theme
		}
	}

	function set_theme() {
		const theme = selected.value
		if (themes.includes(theme)) {
			const one_year = 60 * 60 * 24 * 365
			window.localStorage.setItem('theme', theme)
			document.cookie = `theme=${theme}; max-age=${one_year}; path=/;`
			document.documentElement.setAttribute('class', theme)
			current_theme = theme
		}
	}

	$: selected = {
		value: current_theme,
		label: current_theme
	}

	$: selected, set_theme()
</script>

<div class="container p-4 flex flex-col gap-y-4">
	<h1 class="text-4xl leading-none tracking-tight font-semibold">My Settings</h1>

	<h2 class="text-lg font-semibold">Account Settings</h2>

	<div class="flex items-center gap-x-4">
		<h1>Theme:</h1>
		<Select.Root bind:selected>
			<Select.Trigger class="w-[180px]">
				<Select.Value />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each themes as theme}
						<Select.Item value={theme} label={theme}>{theme}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="favoriteFruit" />
		</Select.Root>
	</div>
</div>
