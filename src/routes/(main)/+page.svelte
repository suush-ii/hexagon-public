<script lang="ts">
	import { Button } from '$src/components/ui/button'
	import { Loader2 } from 'lucide-svelte'

	import * as Form from '$src/components/ui/form'
	import { formSchema, applicationFormSchema } from '$lib/schemas/signupschema'
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
	import { interpolate } from '$lib/poly-i18n/interpolate'
	import { Textarea } from '$src/components/ui/textarea'
	import { Label } from '$src/components/ui/label'
	import { slide } from 'svelte/transition'
	import { page } from '$app/stores'

	$: hideText = false

	export let data: PageData

	let audio: HTMLAudioElement

	let completeAudio: HTMLAudioElement

	const form = superForm(data.form, {
		validators: zodClient(formSchema)
	})

	const { form: formData, enhance, submitting, message } = form

	const applicationForm = superForm(data.applicationForm, {
		validators: zodClient(applicationFormSchema)
	})

	const {
		form: applicationFormData,
		enhance: applicationEnhance,
		submitting: applicationSubmitting,
		message: applicationMessage
	} = applicationForm

	const genders = {
		male: data.t('genders.male'),
		female: data.t('genders.female'),
		nonbinary: data.t('genders.None')
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

	$applicationFormData.verificationPhrase = data.verificationPhrase
	$applicationFormData.referer = Number($page.url.searchParams.get('referral'))
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
			class="ml-auto">{data.t('signUpLogin.logIn')}</Button
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
				<button
					on:click={clickerInc}
					on:click={biteInc}
					on:click={() => {
						hideText = false
					}}
				>
					<img
						alt="H"
						class="w-16 h-16 {iconClass}"
						src={biteCount === 0 ? '/hexagon512.png' : `/hexabite/${biteCount}.png`}
					/>
				</button>
				exagon

				<img alt="noob" class="w-32 h-32 absolute -right-28 top-0" src={'/noob.gif'} />
			</div>

			{#if !hideText}
				<h1
					transition:slide|local
					class="text-sm pr-4 mx-auto flex flex-row select-none font-mono font-semibold"
				>
					{emoticon}
				</h1>

				<div
					transition:slide|local
					class="mx-auto overflow-hidden flex flex-row gap-1 h-4 select-none"
				>
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
			{/if}

			{#if data.registration}
				<div class="flex flex-col space-y-2 text-center">
					{#if data.applicationsEnabled && data.accepted === false}
						<h1 class="text-2xl font-semibold tracking-tight">Application</h1>
					{:else}
						<h1 class="text-2xl font-semibold tracking-tight">{data.t('signUpLogin.create')}</h1>
					{/if}

					{#if data.applicationsEnabled}
						<a href="/applications"
							><p class="text-sm text-muted-foreground hover:underline underline-offset-2">
								<span class="font-bold">Already made an application?</span> Click here to view the status.
							</p></a
						>
					{/if}

					<p class="text-sm text-muted-foreground">
						{data.t('signUpLogin.details')}
					</p>
				</div>

				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				{#if data.applicationsEnabled && data.accepted === false}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<form
						method="POST"
						action="?/application"
						use:applicationEnhance
						on:click={() => {
							hideText = true
						}}
					>
						<Form.Field form={applicationForm} name="discover">
							<Form.Control let:attrs>
								<Form.Label>About Me</Form.Label>
								<Form.Description>How did you discover Hexagon?</Form.Description>
								<Textarea
									{...attrs}
									placeholder="(Minimum 100 characters)"
									class="resize-none"
									bind:value={$applicationFormData.discover}
									disabled={$applicationSubmitting}
									maxlength={1000}
								/>
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field form={applicationForm} name="socialmedia">
							<Form.Control let:attrs>
								<Form.Label>Socials</Form.Label>
								<Form.Description
									>Paste a URL to a public profile. You can use Roblox profiles, Bluesky accounts,
									etc..</Form.Description
								>
								<Input
									{...attrs}
									placeholder="(Profile URL)"
									bind:value={$applicationFormData.socialmedia}
									disabled={$applicationSubmitting}
									maxlength={200}
								/>
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<Form.Field form={applicationForm} name="pastrevivals">
							<Form.Control let:attrs>
								<Form.Label>History</Form.Label>
								<Form.Description
									>Have you been in any past revivals? Tell us about it!</Form.Description
								>
								<Textarea
									{...attrs}
									placeholder="(Optional)"
									class="resize-none"
									bind:value={$applicationFormData.pastrevivals}
									disabled={$applicationSubmitting}
									maxlength={1000}
								/>
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<div class="space-y-2">
							<Label>Verification</Label>

							<p class="text-sm text-muted-foreground">
								The entire phrase below should appear in your account to prove you own it.
							</p>

							<p class="text-sm bg-muted-foreground/10 p-4 rounded-xl select-all">
								{data.verificationPhrase}
							</p>

							{#if $applicationMessage}<Warntext text={$applicationMessage} />{/if}
						</div>

						<input
							type="hidden"
							name="verificationPhrase"
							bind:value={$applicationFormData.verificationPhrase}
						/>

						<input type="hidden" name="referer" value={$applicationFormData.referer} />

						<Form.Button disabled={$applicationSubmitting} class="w-full mt-4">
							{#if $applicationSubmitting}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							{data.t('signUpLogin.signUp')}
						</Form.Button>
					</form>
				{:else}
					<form method="POST" use:enhance action="?/register">
						<Form.Field {form} name="username">
							<Form.Control let:attrs>
								<Form.Label>{data.t('signUpLogin.username')}</Form.Label>
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
								<Form.Label>{data.t('signUpLogin.password')}</Form.Label>
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

						{#if data.keysEnabled === true && data.applicationsEnabled === false}
							<Form.Field {form} name="key">
								<Form.Control let:attrs>
									<Form.Label>{data.t('signUpLogin.invite')}</Form.Label>
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
								<Form.Label>{data.t('signUpLogin.gender')}</Form.Label>
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

						<input
							type="hidden"
							name="application"
							value={data.applicationid ?? '00000000-0000-0000-0000-000000000000'}
						/>

						<Form.Button disabled={$submitting} class="w-full">
							{#if $submitting}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							{data.t('signUpLogin.signUp')}
						</Form.Button>
					</form>
				{/if}

				<p class="px-8 text-center text-sm text-muted-foreground">
					{@html interpolate(data.t('signUpLogin.agreement'), {
						button: data.t('signUpLogin.signUp'),
						terms: `<a href="/legal/terms" class="underline underline-offset-4 hover:text-primary">${data.t('signUpLogin.terms')}</a>`,
						privacy: `<a href="/legal/privacy" class="underline underline-offset-4 hover:text-primary">${data.t('signUpLogin.privacy')}</a>`
					})}
				</p>
			{:else}
				<h1 class="text-2xl text-center mx-auto pb-96">Sorry! Registration is currently closed.</h1>
			{/if}
		</div>
	</div>
</div>
