<script lang="ts">
	import { Button } from '$src/components/ui/button';
	import * as Card from '$src/components/ui/card';
	import * as Select from '$src/components/ui/select';
	import { Input } from '$src/components/ui/input';
	import { Label } from '$src/components/ui/label';
	import { Loader2 } from 'lucide-svelte';

	let isLoading = false;

	async function onSubmit() {
		console.log('wtf');
		isLoading = true;

		setTimeout(() => {
			isLoading = false;
		}, 3000);
	}
</script>

<div class="flex h-screen">
	<Button href="/login" class="absolute right-5 top-5">Log In</Button>

	<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
		<div class="relative mx-auto font-bold z-20 flex items-center text-5xl">Hexagon</div>

		<div class="flex flex-col space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
			<p class="text-sm text-muted-foreground">Enter your details below to create your account</p>
		</div>

		<Card.Root>
			<form on:submit|preventDefault={onSubmit}>
				<Card.Content>
					<div class="grid w-full items-center gap-4">
						<div class="flex flex-col space-y-1.5">
							<Label for="username">Username</Label>
							<Input
								id="username"
								disabled={isLoading}
								placeholder="(3-20 Characters, no spaces)"
							/>
						</div>
						<div class="flex flex-col space-y-1.5">
							<Label for="password">Password</Label>
							<Input id="password" disabled={isLoading} type="password" placeholder="(Unique)" />
						</div>
						<div class="flex flex-col space-y-1.5">
							<Label for="password">Invite Key</Label>
							<Input
								id="password"
								disabled={isLoading}
								type="password"
								placeholder="(Unique, Required)"
							/>
						</div>
						<div class="flex flex-col space-y-1.5">
							<Label for="gender">Gender</Label>
							<Select.Root disabled={isLoading}>
								<Select.Trigger id="gender">
									<Select.Value placeholder="Select" />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="male" label="Male">{'Male'}</Select.Item>

									<Select.Item value="female" label="Female">{'Female'}</Select.Item>

									<Select.Item value="nonbinary" label="None">{'None'}</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
					</div>
				</Card.Content>
				<Card.Footer>
					<Button disabled={isLoading} type="submit" class="w-full">
						{#if isLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Sign Up!</Button
					>
				</Card.Footer>
			</form>
		</Card.Root>

		<p class="px-8 text-center text-sm text-muted-foreground">
			By clicking continue, you agree to our
			<a href="/terms" class="underline underline-offset-4 hover:text-primary">
				Terms of Service
			</a>
			and
			<a href="/privacy" class="underline underline-offset-4 hover:text-primary">
				Privacy Policy
			</a>
			.
		</p>
	</div>
</div>
