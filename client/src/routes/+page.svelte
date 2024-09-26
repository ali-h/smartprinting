<script>
  import { API_URL, loading, showcontent, isLoggedIn, name } from '../stores';
  import { goto } from '$app/navigation';
  import { get, getToken } from '$lib';
  import { onMount } from 'svelte';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import Profile from '../components/profile.svelte';
  import Upload from '../components/upload.svelte';
  import Queue from '../components/queue.svelte';
  import Terminals from '../components/terminals.svelte'
  import History from '../components/history.svelte';

  const toastStore = getToastStore();

  $showcontent = false;
  $loading = true;

  onMount(() => {
    const token = getToken();
    if (!token) {
      goto('/login')
      return;
    } else {
      $loading = false;
      $showcontent = true;
      $isLoggedIn = true;
    }

    get(`${$API_URL}/user/profile`)
      .catch(error => {
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('authToken');
        toastStore.trigger({
          message: 'Session expired. Please log in again.',
          background: 'variant-filled-error'
        });
        goto('/login');
      });
  });
</script>

{#if $showcontent}
<div class="p-4 w-full">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Profile />
    <Upload />
    <Queue />
    <Terminals /> 
    <History />
  </div>
</div>
{/if}
