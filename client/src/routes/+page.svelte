<script>
  import { API_URL, loading, showcontent, isLoggedIn, triggerUpdate } from '../stores';
  import { goto } from '$app/navigation';
  import { get, getToken } from '$lib';
  import { onMount, onDestroy } from 'svelte';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import Profile from '../components/profile.svelte';
  import Upload from '../components/upload.svelte';
  import Queue from '../components/queue.svelte';
  import Terminals from '../components/terminals.svelte'
  import History from '../components/history.svelte';
  
  const toastStore = getToastStore();

  $showcontent = false;
  $loading = true;

  let socket;

  function connectWebSocket(token) {
    socket = new WebSocket(`${$API_URL.replace('http://', 'ws://')}/updates`);

    socket.onopen = () => {
      console.log('WebSocket connected');
      socket.send(JSON.stringify({ token }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'authentication') {
        if (data.status === 'success') {
          console.log('WebSocket authenticated successfully');
        } else {
          console.error('WebSocket authentication failed');
          socket.close();
        }
      } else {
        if (data.type === 'print_completed') {
          toastStore.trigger({
            message: `Just Printed: ${data.data.filename} (${data.data.pages} pages) at ${data.data.TerminalId}`,
            background: 'variant-filled-success'
          });
        
          triggerUpdate();
        } else {
          triggerUpdate();
        }
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(() => connectWebSocket(token), 5000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  onMount(() => {
    const token = getToken();
    if (!token) {
      goto('/login')
      return;
    } else {
      $loading = false;
      $showcontent = true;
      $isLoggedIn = true;
      connectWebSocket(token);
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

  // Clean up WebSocket connection when component is destroyed
  onDestroy(() => {
    if (socket) {
      socket.close();
    }
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
