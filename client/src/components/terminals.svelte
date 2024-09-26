<script>
  import { onMount } from 'svelte';
  import { API_URL } from '../stores';
  import { get } from '$lib';
  import { MapPin, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { SlideToggle } from '@skeletonlabs/skeleton';

  let terminals = [];
  let showInactive = false;
  let currentPage = 1;
  const terminalsPerPage = 3;

  function sortTerminalsByLastPing(terminals) {
    return terminals.sort((a, b) => {
      const lastPingA = a.lastPing || 0;
      const lastPingB = b.lastPing || 0;
      return lastPingB - lastPingA;
    });
  }

  async function fetchTerminals() {
    try {
      const response = await get(`${$API_URL}/api/terminals`);
      if (response.status === 200) {
        terminals = sortTerminalsByLastPing(response.result);
      } else {
        console.error('Error fetching terminals:', response);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function getTimeDifference(dateString) {
    if (!dateString) return { text: 'N/A', color: 'gray', diffInSeconds: Infinity };
    const now = new Date();
    const lastDate = new Date(dateString * 1000);
    const diffInSeconds = Math.floor((now - lastDate) / 1000);

    if (diffInSeconds < 120) {
      return { text: `${diffInSeconds}s`, color: 'success', diffInSeconds };
    } else if (diffInSeconds < 600) {
      return { text: `${Math.floor(diffInSeconds / 60)}m`, color: 'warning', diffInSeconds };
    } else {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return { text: `${diffInMinutes}m`, color: 'gray', diffInSeconds };
      } else {
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
          return { text: `${diffInHours}h`, color: 'gray', diffInSeconds };
        } else {
          const diffInDays = Math.floor(diffInHours / 24);
          return { text: `${diffInDays}d`, color: 'gray', diffInSeconds };
        }
      }
    }
  }

  function isTerminalInactive(terminal) {
    const { diffInSeconds } = getTimeDifference(terminal.lastPing);
    return diffInSeconds > 600; // 10 minutes = 600 seconds
  }

  function updateTerminalStatuses() {
    terminals = terminals.map(t => {
      const updatedTerminal = { ...t };
      if (isTerminalInactive(updatedTerminal) && updatedTerminal.status === 1) {
        updatedTerminal.status = 0;
        updatedTerminal.comment = updatedTerminal.comment ? `${updatedTerminal.comment}` : 'Offline';
      }
      return updatedTerminal;
    });
  }

  let timer;
  onMount(async () => {
    await fetchTerminals();

    // Run the update immediately
    updateTerminalStatuses();

    // Set up the interval
    timer = setInterval(updateTerminalStatuses, 1000);

    return () => clearInterval(timer);
  });

  $: filteredTerminals = showInactive ? sortTerminalsByLastPing([...terminals]) : sortTerminalsByLastPing([...terminals]).filter(t => t.status === 1);
  $: totalPages = Math.ceil(filteredTerminals.length / terminalsPerPage);
  $: paginatedTerminals = filteredTerminals.slice(
    (currentPage - 1) * terminalsPerPage,
    currentPage * terminalsPerPage
  );

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }
</script>

<div class="card p-4 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg rounded-[20px] shadow-slate-900">
  <div class="flex justify-between items-center mb-4">
    <h2 class="h2">Terminals</h2>
    <div class="flex items-center">
      <SlideToggle name="show-inactive" bind:checked={showInactive} on:change={() => { currentPage = 1; }}   active="variant-glass-secondary" size="sm">
        <span class="text-sm">Show Inactive</span>
      </SlideToggle>
    </div>
  </div>

  <div class="table-container">
    {#each paginatedTerminals as terminal}
      <div class="grid grid-cols-1 gap-3 mb-4 p-4 variant-glass-secondary rounded-[20px]">
        <div class="flex items-center gap-2">
          <h3 class="h3">{terminal.name}</h3>
          <span class="badge variant-filled-primary text-xs">{terminal.terminalId}</span>
          <span class={`badge variant-filled-${isTerminalInactive(terminal) ? 'error' : terminal.status === 1 ? 'success' : 'error'} text-xs`}>
            {isTerminalInactive(terminal) ? 'Inactive' : terminal.status === 1 ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div class="flex items-center">
          <MapPin size={20} class="mr-2" />
          <span>{terminal.location || 'N/A'}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center">
            <Clock size={20} class="mr-2" />
            {#if terminal.lastPing}
              {@const { text, color } = getTimeDifference(terminal.lastPing)}
              <span>Last Ping: <span class="font-bold text-{color}-500">{text} ago</span></span>
            {:else}
              <span>Last Ping: <span class="font-bold text-gray-500">N/A</span></span>
              {/if}
          </div>
          <div class="flex items-center">
            <Calendar size={20} class="mr-2" />
            {#if terminal.lastPrint}
              {@const { text } = getTimeDifference(terminal.lastPrint)}
              <span>Last Print: <span class="font-bold">{text} ago</span></span>
            {:else}
              <span>Last Print: <span class="font-bold text-gray-500">N/A</span></span>
            {/if}
          </div>
        </div>
        {#if terminal.comment}
          <div>
            <p class="text-sm italic">Comment: {terminal.comment}</p>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if filteredTerminals.length === 0}
    <p class="text-center py-4">No terminals found.</p>
  {:else}
    <div class="flex justify-between items-center mt-4">
      <button class="btn variant-filled-secondary" on:click={prevPage} disabled={currentPage === 1}>
        <ChevronLeft size={20} />
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button class="btn variant-filled-secondary" on:click={nextPage} disabled={currentPage === totalPages}>
        Next
        <ChevronRight size={20} />
      </button>
    </div>
  {/if}
</div>

<style>
  .text-success-500 {
    color: rgb(var(--color-success-500))
  }

  .text-warning-500 {
    color: rgb(var(--color-warning-500))
  }
</style>
