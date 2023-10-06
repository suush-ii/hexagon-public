<script lang="ts">
	import { Button } from '$src/components/ui/button';
	import { Loader2 } from 'lucide-svelte';

	import * as Form from '$src/components/ui/form';
	import { formSchema, type FormSchema } from '$lib/schemas/signupschema';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';

	import Warntext from '$src/components/warntext.svelte';

	export let data: PageData;

	let form: SuperValidated<FormSchema>;

	$: clickerPage = data.clicker;

	let clicker = clickerPage;

	const displayed_count = spring();

	displayed_count.set(0)
	
	$: displayed_count.set(clickerPage);

	$: offset = modulo($displayed_count, 1);

	function modulo(n: number, m: number) {
		// handle negative numbers
		return ((n % m) + m) % m;
	}

	$: if (!clicker) {
		clicker = clickerPage;
	}

	$: if (clicker != clickerPage) {
		// tick up/down
		const interval = setInterval(() => {
			if (clicker < clickerPage) {
				clicker += 1;
			} else if (clicker > clickerPage) {
				clicker -= 1;
			}
			if (clicker === clickerPage) {
				clearInterval(interval);
			}
		}, 300);
	}

	let timer: number | undefined;

	async function clickerInc() {
		clearTimeout(timer);
		timer = setTimeout(async () => {
			//clicker = clicker+1
			const updated = await fetch('/api/clicker', { method: 'POST' });
			const updatedJson = await updated.json();
			clickerPage = updatedJson.data.clicker;
		}, 200);
	}

	onMount(() => {
		if (!document.hidden) {
			const interval = setInterval(() => {
				invalidateAll();
			}, 5000);

			return () => {
				clearInterval(interval);
			};
		}
	});
</script>

<div class="flex m-auto">
	<Button href="/login" class="absolute right-5 top-5">Log In</Button>

	<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
		<div class="relative mx-auto font-bold z-20 flex items-center text-4xl">
			<button on:click={clickerInc}>
				<img alt="H" class="w-16" src="/hexagon128.png" />
			</button>
			exagon
		</div>

		<div class="mx-auto overflow-hidden flex flex-row gap-1 h-4">
			<p class="mx-auto text-sm text-muted-foreground">Has been clicked</p>
			<div class="" style="transform: translate(0, {100 * offset}%)">
				<p class="absolute top-[-100%] mx-auto text-sm text-muted-foreground">
					{Math.floor($displayed_count + 1)}
				</p>
				<p class="mx-auto text-sm text-muted-foreground">{Math.floor($displayed_count)}</p>
			</div>
			<p class="mx-auto text-sm text-muted-foreground">times.</p>
		</div>

		{#if data.registration}
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
				<p class="text-sm text-muted-foreground">Enter your details below to create your account</p>
			</div>

			<Form.Root method="POST" {form} schema={formSchema} let:config let:submitting let:message>
				<Form.Field {config} name="username">
					<Form.Item>
						<Form.Label>Username</Form.Label>
						<Form.Input disabled={submitting} placeholder="(3-20 Characters, no spaces)" />
						<Form.Validation />
					</Form.Item>
				</Form.Field>

				<Form.Field {config} name="password">
					<Form.Item>
						<Form.Label>Password</Form.Label>
						<Form.Input disabled={submitting} placeholder="(Unique)" type="password" />
						<Form.Validation />
					</Form.Item>
				</Form.Field>

				<Form.Field {config} name="key">
					<Form.Item>
						<Form.Label>Invite Key</Form.Label>
						<Form.Input disabled={submitting} placeholder="(Unique)" />
						<Form.Validation />
					</Form.Item>
				</Form.Field>

				<Form.Field {config} name="gender">
					<Form.Item>
						<Form.Label>Gender</Form.Label>
						<Form.Select disabled={submitting}>
							<Form.SelectTrigger placeholder="Select" />
							<Form.SelectContent>
								<Form.SelectItem value="male">Male</Form.SelectItem>
								<Form.SelectItem value="female">Female</Form.SelectItem>
								<Form.SelectItem value="nonbinary">None</Form.SelectItem>
							</Form.SelectContent>
						</Form.Select>
						<Form.Description
							>You can always change this.
							{#if message}<Warntext text={message} />{/if}
						</Form.Description>
						<Form.Validation />
					</Form.Item>
				</Form.Field>

				<Form.Button disabled={submitting} class="w-full">
					{#if submitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Sign Up!</Form.Button
				>
			</Form.Root>

			<p class="px-8 text-center text-sm text-muted-foreground">
				By clicking Sign Up, you agree to our
				<a href="/terms" class="underline underline-offset-4 hover:text-primary">
					Terms of Service
				</a>
				and
				<a href="/privacy" class="underline underline-offset-4 hover:text-primary">
					Privacy Policy
				</a>
				.
			</p>
		{:else}
			<h1 class="text-2xl text-center mx-auto pb-96">Sorry! Registration is currently closed.</h1>
		{/if}
	</div>
</div>
