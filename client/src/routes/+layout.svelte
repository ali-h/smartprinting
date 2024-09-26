<script>
	import '../app.postcss';

	import { AppBar, initializeStores, Toast, ProgressBar, getToastStore } from '@skeletonlabs/skeleton';
	import { loading, name, isLoggedIn } from '../stores.js';
	import { goto } from '$app/navigation';
	import { Menu, X, CircleUser, Gauge, Wallet, Settings, BookOpen, LogIn, UserPlus, LogOut, FileText, Flag } from 'lucide-svelte';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { blur } from 'svelte/transition';

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	initializeStores();

	const toastStore = getToastStore();

	let isDrawerOpen = false;

	const openDrawer = () => {
		isDrawerOpen = true;
	}

	const closeDrawer = () => {
		isDrawerOpen = false;
	}

	const logout = () => {
		localStorage.removeItem('authToken');
		sessionStorage.removeItem('authToken');
		isLoggedIn.set(false);
		goto('/login');

		toastStore.trigger({
			message: 'Logged out successfully',
			background: 'variant-filled-warning'
		});
	}

	const handleMenuItemClick = () => {
		closeDrawer();
	}

	$loading = true;

	onMount(() => {
		const drawer = document.getElementById('custom-drawer');
		drawer.addEventListener('transitionend', () => {
			if (!isDrawerOpen) {
				drawer.style.display = 'none';
			}
		});
	});
</script>

<Toast position="t" />

<AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
	<svelte:fragment slot="lead">
		<a href="/" class="flex items-center gap-2">
			<img src="/icon.png" alt="Smart Printing" class="w-10 h-10" />
			<span class="h3 handjet mt-1">SMART PRINTING</span>
		</a>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<button class="btn variant-ghost-primary" on:click={openDrawer}>
			<Menu size={20} />
		</button>
	</svelte:fragment>

	<div
		id="custom-drawer"
		class="fixed top-0 right-0 h-full bg-surface-800/90 backdrop-blur-xl w-3/4 md:w-[350px] transform transition-transform duration-200 ease-in-out z-[10000] {isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}"
		style="display: {isDrawerOpen ? 'block' : 'none'};"
	>
		<div class="flex flex-col w-full">
			<div class="p-4 flex justify-between items-center">
				{#if $isLoggedIn}
				<a class="btn variant-ghost-secondary ps-0 py-0 gap-1" href="/settings">
					<CircleUser size={34} class="text-gray-300" />
					<span class="text-gray-300">{$name}</span>
				</a>
				{/if}
				<button class="btn variant-ghost-secondary" on:click={closeDrawer}>
					<X size={20} />
				</button>
			</div>
	
			<div class="flex mt-5 flex-col gap-2">
				{#if $isLoggedIn}
				<a class="btn variant-glass-secondary btn-lg rounded-l-none rounded-r-full w-4/5" href="/" on:click={handleMenuItemClick}>
					<Gauge size={20} />
					<span class="text-gray-300">Dashboard</span>
				</a>
				<a class="btn variant-glass-secondary btn-lg rounded-l-none rounded-r-full w-4/5" href="/topup" on:click={handleMenuItemClick}>
					<Wallet size={20} />
					<span class="text-gray-300">Topup</span>
				</a>
				<a class="btn variant-glass-secondary btn-lg rounded-l-none rounded-r-full w-4/5" href="/settings" on:click={handleMenuItemClick}>
					<Settings size={20} />
					<span class="text-gray-300">Settings</span>
				</a>
				{/if}
				<a class="btn variant-glass-secondary btn-lg rounded-l-none rounded-r-full w-4/5" href="/guide" on:click={handleMenuItemClick}>
					<BookOpen size={16} />
					<span class="text-gray-300">Guide</span>
				</a>
				{#if !$isLoggedIn}
				<a class="btn variant-glass-secondary btn-lg rounded-l-none rounded-r-full w-4/5" href="/login" on:click={handleMenuItemClick}>
					<LogIn size={16} />
					<span class="text-gray-300">Login</span>
				</a>
				<a class="btn variant-glass-secondary btn-lg rounded-l-none rounded-r-full w-4/5" href="/register" on:click={handleMenuItemClick}>
					<UserPlus size={16} />
					<span class="text-gray-300">Register</span>
				</a>
				{:else}
				<button class="btn variant-glass-error btn-lg rounded-l-none rounded-r-full w-4/5" on:click={() => { logout(); closeDrawer(); }}>
					<LogOut size={20} />
					<span class="text-gray-300">Logout</span>
				</button>	
				{/if}
			</div>
	
			<div class="absolute bottom-4 right-0 flex flex-col gap-2">
				<a class="btn variant-glass-error btn-lg rounded-r-none rounded-l-full" href="/about" on:click={handleMenuItemClick}>
					<FileText size={16} />
					<span class="text-gray-300">About Us</span>
				</a>
				<a class="btn variant-glass-error btn-lg rounded-r-none rounded-l-full" href="/report" on:click={handleMenuItemClick}>
					<Flag size={20} />
					<span class="text-gray-300">Report a Problem</span>
				</a>
				<span class="h6 text-gray-300 text-right mr-2">v0.1.0 alpha</span>
			</div>
		</div>
	</div>

	{#if isDrawerOpen}
		<div
			class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
			on:click={closeDrawer}
			on:keydown={(e) => e.key === 'Escape' && closeDrawer()}
			aria-label="Close menu"
			role="button"
			tabindex="0"
		></div>
	{/if}
</AppBar>

<slot />

{#if $loading}
	<div class="fixed bottom-0 left-0 right-0">
		<ProgressBar meter="variant-filled-primary" />
	</div>
{/if}

<style>
	#custom-drawer {
		z-index: 10000;
		box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
	}
</style>
