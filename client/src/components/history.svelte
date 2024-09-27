<script>
  import { onMount } from 'svelte';
  import { API_URL, updateTrigger } from '../stores';
  import { get, post, getToken } from '$lib';
  import { Printer, Info } from 'lucide-svelte';
  import { popup, getToastStore } from '@skeletonlabs/skeleton';

  const toastStore = getToastStore();

  let historyData = [];

  onMount(async () => {
    await fetchHistoryData();
  });

  $: {
    $updateTrigger;
    fetchHistoryData();
  }

  async function fetchHistoryData() {
    try {
      const response = await get(`${$API_URL}/api/history`);
      if (response.status === 200) {
        historyData = response.result;
      } else {
        console.error('Error fetching history data:', response);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function reprintFile(fileId) {
    try {
      const response = await post(`${$API_URL}/api/reprint`, { fileId });
      if (response.status === 200) {
        toastStore.trigger({
          message: 'File added to print queue',
          background: 'variant-filled-success',
        });
      } else {
        console.error('Error reprinting file:', response);
        toastStore.trigger({
          message: 'Error reprinting file',
          background: 'variant-filled-error',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toastStore.trigger({
        message: 'Error reprinting file',
        background: 'variant-filled-error',
      });
    }
  }

  function canReprint(printedAt) {
    const printTimestamp = new Date(printedAt * 1000).getTime();
    const currentTime = Date.now();
    return currentTime - printTimestamp <= 24 * 60 * 60 * 1000;
  }

  function formatDateTime(dateTime) {
    return new Date(dateTime).toLocaleString();
  }

  const tableColumns = [
    { key: 'filename', title: 'File Name' },
    { key: 'pages', title: 'Pages' },
    { key: 'bill', title: 'Bill' },
    { key: 'uploadedAt', title: 'Uploaded' },
    { key: 'printedAt', title: 'Printed' },
    { key: 'terminalName', title: 'Terminal' },
    { key: 'actions', title: 'Actions' },
  ];
</script>

<div class="card col-span-1 md:col-span-2 lg:col-span-2 p-4 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg rounded-[20px] shadow-slate-900">
  <h2 class="h2 mb-4">Print History</h2>

  {#if historyData.length > 0}
    <div class="table-container bg-surface-800" style="max-height: 600px; overflow-y: auto;">
      <table class="table table-hover w-full">
        <thead>
          <tr>
            {#each tableColumns as column}
              <th class="text-center">{column.title}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each historyData as row}
            <tr>
              {#each tableColumns as column}
                {#if column.key === 'uploadedAt' || column.key === 'printedAt'}
                  <td style="vertical-align: middle !important;">{formatDateTime(row[column.key] * 1000)}</td>
                {:else if column.key !== 'actions'}
                  <td style="vertical-align: middle !important;">{row[column.key]}</td>
                {:else}
                  <td style="vertical-align: middle !important;">
                    <div class="flex justify-center items-center">
                      <button
                        use:popup={{
                          event: 'click',
                          target: `popup-${row.printId}`,
                          placement: 'top'
                        }}
                        class="btn btn-sm btn-ghost"
                      >
                        <Info size={18} />
                      </button>
                      {#if canReprint(row.printedAt)}
                        <button on:click={() => reprintFile(row.fileId)} class="btn btn-sm btn-ghost">
                          <Printer size={18} />
                        </button>
                      {/if}
                      <div class="card p-4 shadow-xl" data-popup={`popup-${row.printId}`}>
                        <p>File ID: {row.fileId}</p>
                        <p>Print ID: {row.printId}</p>
                      </div>
                    </div>
                  </td>
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="text-center py-4">No print history available.</p>
  {/if}
</div>
