<script lang="ts">
	import { Button } from '$src/components/ui/button'
	import { Loader2 } from 'lucide-svelte'

	import * as Form from '$src/components/ui/form'
	import { formSchema } from '$lib/schemas/signupschema'
	import type { PageData } from './$types'
	import { onMount } from 'svelte'
	import { spring } from 'svelte/motion'

	import Warntext from '$src/components/warntext.svelte'

	import { UserSquare2 } from 'lucide-svelte'
	import { Key } from 'lucide-svelte'

	import { pageName } from '$src/stores'

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { Input } from '$src/components/ui/input'
	import * as Select from '$src/components/ui/select'

	export let data: PageData

	let audio: HTMLAudioElement

	let completeAudio: HTMLAudioElement

	const form = superForm(data.form, {
		validators: zodClient(formSchema)
	})

	const { form: formData, enhance, submitting, message } = form

	const genders = {
		male: 'Male',
		female: 'Female',
		nonbinary: 'None'
	}

	$: selectedGender = $formData.gender
		? {
				label: genders[$formData.gender],
				value: $formData.gender
			}
		: undefined

	$: clickerPage = data.clicker

	let clicker = clickerPage

	let iconClass = ''

	const displayed_count = spring()

	displayed_count.set(0)

	$: displayed_count.set(clickerPage)

	$: offset = modulo($displayed_count, 1)

	function modulo(n: number, m: number) {
		// handle negative numbers
		return ((n % m) + m) % m
	}

	$: if (!clicker) {
		clicker = clickerPage
	}

	$: if (clicker != clickerPage) {
		// tick up/down
		const interval = setInterval(() => {
			if (clicker < clickerPage) {
				clicker += 1
			} else if (clicker > clickerPage) {
				clicker -= 1
			}
			if (clicker === clickerPage) {
				clearInterval(interval)
			}
		}, 300)
	}

	let timer: string | number | NodeJS.Timeout | undefined

	const emoticons = [
		'( ⚆_⚆)',
		'(☉_☉ )',
		'( ◕‿◕)',
		'(◕‿◕ )',
		'(⇀‿‿↼)',
		'(≖‿‿≖)',
		'(◕‿‿◕)',
		'(-__-)',
		'(°▃▃°)',
		'(⌐■_■)',
		'(•‿‿•)',
		'(^‿‿^)',
		'(ᵔ◡◡ᵔ)',
		'(☼‿‿☼)',
		'(≖__≖)',
		'(✜‿‿✜)',
		'(ب__ب)',
		'(╥☁╥ )',
		"(-_-')",
		'(♥‿‿♥)',
		'(☓‿‿☓)',
		'(#__#)',
		'(1__0)',
		'(1__1)',
		'(0__1)'
	]

	let emoticon = emoticons[Math.floor(Math.random() * emoticons.length)]

	$: pageName.set('Free Games ' + emoticon)

	async function clickerInc() {
		clearTimeout(timer)
		timer = setTimeout(async () => {
			//clicker = clicker+1
			const updated = await fetch('/api/clicker', { method: 'POST' })
			const updatedJson = await updated.json()
			clickerPage = updatedJson.data.clicker
			iconClass = ''
		}, 200)
	}

	let biteCount = 0

	let freezeEmoticon = false

	function biteInc() {
		if (iconClass != 'boop') {
			iconClass = 'boop'
		}
		if (biteCount < 3) {
			biteCount += 1

			audio = audio.cloneNode(true) as HTMLAudioElement
			audio.play()
		} else {
			emoticon = '(◕‿‿◕)'
			freezeEmoticon = true
			biteCount = 0
			completeAudio = completeAudio.cloneNode(true) as HTMLAudioElement
			completeAudio.play()
		}
	}

	onMount(() => {
		const interval = setInterval(async () => {
			if (!freezeEmoticon) {
				emoticon = emoticons[Math.floor(Math.random() * emoticons.length)]
			}
			if (!document.hidden) {
				const updated = await fetch('/api/clicker', { method: 'GET' })
				const updatedJson = await updated.json()
				clickerPage = updatedJson.data.clicker
				freezeEmoticon = false
			}
		}, 5000)
		return () => {
			clearInterval(interval)
		}
	})

	function submit() {
		emoticon = '(⇀‿‿↼)'
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap&text=ProjectHexagon"
		rel="stylesheet"
	/>
</svelte:head>
<!-- svelte-ignore a11y-media-has-caption -->
<video
	class="pointer-events-none absolute h-full w-full box-border -z-10 opacity-60 top-0 bottom-0 object-cover blur-sm"
	loop
	autoplay
	muted
>
	<source
		src="/Finalnew-1.webm"
		class="min-h-full min-w-full w-auto h-auto absolute"
		type="video/webm"
	/>
</video>

<div class="flex flex-col w-full flex-wrap">
	<div class="w-full flex p-4">
		<Button
			href="/login"
			on:mouseenter={() => {
				emoticon = '( ⚆_⚆) ! ! ! !'
			}}
			class="ml-auto">Log In</Button
		>
	</div>

	<div
		class="flex m-auto supports-backdrop-blur:bg-background/60 border-b bg-background/60 p-4 sm:p-16 shadow-sm rounded-xl"
	>
		<audio src="/hexabite/3_sndBite1.mp3" bind:this={audio} />

		<audio src="/hexabite/1_sndStart.mp3" bind:this={completeAudio} />

		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="relative mx-auto z-20 flex items-center text-4xl font-logo">
				<h1 class="text-2xl pr-4 mt-auto flex flex-row">Project</h1>
				<button on:click={clickerInc} on:click={biteInc}>
					<img
						alt="H"
						class="w-16 h-16 {iconClass}"
						src={biteCount === 0 ? '/hexagon512.png' : `/hexabite/${biteCount}.png`}
					/>
				</button>
				exagon
			</div>
			<h1 class="text-sm pr-4 mx-auto flex flex-row select-none font-mono font-semibold">
				{emoticon}
			</h1>

			<div class="mx-auto overflow-hidden flex flex-row gap-1 h-4 select-none">
				<p class="mx-auto text-sm text-muted-foreground">Has been clicked</p>
				<div class="" style="transform: translate(0, {100 * offset}%)">
					<p class="absolute top-[-100%] mx-auto text-sm text-muted-foreground">
						{Math.floor($displayed_count + 1)}
					</p>
					<noscript>
						<p class="mx-auto text-sm text-muted-foreground">
							{data.clicker}
						</p>
					</noscript>
					<p class="mx-auto text-sm text-muted-foreground">
						{Math.floor($displayed_count)}
					</p>
				</div>
				<p class="mx-auto text-sm text-muted-foreground">times.</p>
			</div>

			{#if data.registration}
				<div class="flex flex-col space-y-2 text-center">
					<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
					<p class="text-sm text-muted-foreground">
						Enter your details below to create your account
					</p>
				</div>

				<form method="POST" use:enhance>
					<Form.Field {form} name="username">
						<Form.Control let:attrs>
							<Form.Label>Username</Form.Label>
							<Input
								disabled={$submitting}
								placeholder="(3-20 Characters, no spaces)"
								icon={UserSquare2}
								direction="r"
								{...attrs}
								bind:value={$formData.username}
							/>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="password">
						<Form.Control let:attrs>
							<Form.Label>Password</Form.Label>
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

					{#if data.keysEnabled === true}
						<Form.Field {form} name="key">
							<Form.Control let:attrs>
								<Form.Label>Invite Key</Form.Label>
								<Input
									disabled={$submitting}
									placeholder="(Unique)"
									{...attrs}
									bind:value={$formData.key}
								/>
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					{/if}

					<Form.Field {form} name="gender">
						<Form.Control let:attrs>
							<Form.Label>Gender</Form.Label>
							<Select.Root
								selected={selectedGender}
								onSelectedChange={(v) => {
									v && ($formData.gender = v.value)
								}}
								disabled={$submitting}
							>
								<Select.Trigger {...attrs}>
									<Select.Value placeholder="Gender" />
								</Select.Trigger>
								<Select.Content>
									{#each Object.entries(genders) as [value, label]}
										<Select.Item {value} {label} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input hidden bind:value={$formData.gender} name={attrs.name} />
						</Form.Control>
						<Form.Description
							>You can always change this.
							{#if $message}<Warntext text={$message} />{/if}
						</Form.Description>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Button disabled={$submitting} class="w-full">
						{#if $submitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Sign Up!
					</Form.Button>
				</form>

				<p class="px-8 text-center text-sm text-muted-foreground">
					By clicking Sign Up, you agree to our
					<a href="/legal/terms" class="underline underline-offset-4 hover:text-primary">
						Terms of Service
					</a>
					and
					<a href="/legal/privacy" class="underline underline-offset-4 hover:text-primary">
						Privacy Policy
					</a>
					.
				</p>
			{:else}
				<h1 class="text-2xl text-center mx-auto pb-96">Sorry! Registration is currently closed.</h1>
			{/if}
		</div>
	</div>
</div>
