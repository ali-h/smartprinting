<script>
	import { post, getToken } from '$lib';
	import { goto } from '$app/navigation';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { API_URL, loading, showcontent } from '../../stores';
	// Import Lucide icons
	import { Shield, Eye, EyeOff } from 'lucide-svelte';

	const toastStore = getToastStore();

	$showcontent = false;
  $loading = true;

	let username = '';
	let password = '';
	let remember_me = false;
	let passwordVisible = false;

	async function handleSubmit(e) {
		e.preventDefault();

		if (username === '' || password === '') {
			toastStore.trigger({
				message: 'Username and password are required',
				background: 'variant-filled-error'
			});
			return;
		}

		try {
			const response = await post(`${$API_URL}/user/login`, { username, password }, false);
			if (response.result.token) {
				// Store the remember_me preference
				localStorage.setItem('rememberMe', remember_me);
				
				// Store the token based on remember_me preference
				if (remember_me) {
					localStorage.setItem('authToken', response.result.token);
				} else {
					sessionStorage.setItem('authToken', response.result.token);
				}
				
				goto('/'); // Redirect to home page or dashboard

				toastStore.trigger({
					message: 'Login successful',
					background: 'variant-filled-success'
				});
			} else {
				throw new Error(response.result.message || 'Login failed');
			}
		} catch (error) {
			toastStore.trigger({
				message: error.message || 'An error occurred during login',
				background: 'variant-filled-error'
			});
		}
	}

	function togglePasswordVisibility() {
		passwordVisible = !passwordVisible;
		const passwordInput = document.getElementById('password');
		passwordInput.type = passwordVisible ? 'text' : 'password';
	}

	onMount(() => {
		const isLoggedIn = getToken();
		if (isLoggedIn) {
			goto('/')
		} else {
      $loading = false;
      $showcontent = true;
    }
	});
</script>

{#if $showcontent}
<div class="container h-full mx-auto flex justify-center items-center my-10">
	<div class="space-y-5 w-full max-w-[390px]">	
		<div class="card p-4">
			<div class="card-body w-full">
				<div class="mb-5 flex justify-between items-center">					
					<span class="h2">
						Login
					</span>

					<Shield size={28} />
				</div>

				<hr class="!border-t-3 mb-5" />

				<form class="space-y-4">
					<div>
						<label for="username" class="block text-sm font-medium ml-1">Username</label>
						<input type="text" name="username" id="username" bind:value={username} class="mt-2 input" placeholder="Enter Username" required>
					</div>

					<div>
						<label for="Password" class="block text-sm font-medium ml-1">Password</label>
						<div class="relative mt-2">
							{#if passwordVisible}
								<input type="text" name="password" id="password-visible" bind:value={password} class="input pr-10" placeholder="Enter Password" required>
							{:else}
								<input type="password" name="password" id="password-hidden" bind:value={password} class="input pr-10" placeholder="Enter Password" required>
							{/if}
							<button type="button" class="absolute inset-y-0 end-0 flex items-center pe-3" on:click={togglePasswordVisibility}>
								{#if passwordVisible}
									<EyeOff size={18} />
								{:else}
									<Eye size={18} />
								{/if}
							</button>
						</div>
					</div>

					<div class="flex items-center justify-between">
						<div class="flex items-center">
							<input id="remember_me" name="remember_me" type="checkbox" bind:checked={remember_me} class="radio ">
							<label for="remember_me" class="ml-2 block text-sm">Remember me</label>
						</div>
						<div class="text-sm">
							<a href="recover" class="font-medium text-primary-600 hover:text-primary-500">Forgot your password?</a>
						</div>
					</div>
					<div>
						<button type="submit" class="mt-2 mb-2 btn variant-filled-primary w-full" on:click={handleSubmit}>Login</button>
					</div>

					<hr class="!border-t-3" />

					<div class="flex items-center justify-center">
						<a href="register" class="mt-2 mb-2 btn variant-filled w-full">Register</a>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
{/if}
