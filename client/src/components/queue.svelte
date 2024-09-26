<script>
  import { onMount } from 'svelte';
  import { API_URL } from '../stores';
  import { get, post, getToken } from '$lib';
  import { Download, Trash, Info } from 'lucide-svelte';
  import { popup, getToastStore } from '@skeletonlabs/skeleton';

  const toastStore = getToastStore();

  let queueData = [];

  onMount(async () => {
    await fetchQueueData();
  });

  async function fetchQueueData() {
    try {
      const response = await get(`${$API_URL}/api/queue`);
      if (response.status === 200) {
        queueData = response.result;
      } else {
        console.error('Error fetching queue data:', response);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function deleteItem(id) {
    try {
      const response = await post(`${$API_URL}/api/delete`, { fileId: id });
      if (response.status === 200) {
        await fetchQueueData();
        toastStore.trigger({
          message: 'File deleted successfully',
          background: 'variant-filled-success',
        });
      } else {
        console.error('Error deleting item:', response);
        toastStore.trigger({
          message: 'Error deleting item',
          background: 'variant-filled-error',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toastStore.trigger({
        message: 'Error deleting item',
        background: 'variant-filled-error',
      });
    }
  }

  async function downloadItem(id) {
    try {
      const url = `${$API_URL}/api/download/${id}`;
      
      // Open the URL in a new tab
      window.open(url, '_blank');

      toastStore.trigger({
        message: 'Download started',
        background: 'variant-filled-success',
      });
    } catch (error) {
      console.error('Error opening download link:', error);
      toastStore.trigger({
        message: 'Error opening download link',
        background: 'variant-filled-error',
      });
    }
  }

  function formatRemainingTime(uploadTime) {
    const uploadTimestamp = new Date(uploadTime).getTime();
    const expirationTime = uploadTimestamp + 24 * 60 * 60 * 1000;
    const remainingTime = expirationTime - Date.now();
    
    if (remainingTime <= 0) return 'Expired';

    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  }

  const tableColumns = [
    { key: 'filename', title: 'File Name' },
    { key: 'pages', title: 'Pages' },
    { key: 'bill', title: 'Bill' },
    { key: 'actions', title: 'Actions' },
  ];
</script>

<div class="card p-4 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg rounded-[20px] shadow-slate-900">
  <h2 class="h2 mb-4">Print Queue</h2>

  {#if queueData.length > 0}
    <div class="table-container bg-surface-800" style="max-height: 490px; overflow-y: auto;">
      <table class="table table-hover w-full">
        <thead>
          <tr>
            {#each tableColumns as column}
              <th class="text-center">{column.title}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each queueData as row}
            <tr>
              {#each tableColumns as column}
                {#if column.key !== 'actions'}
                  <td style="vertical-align: middle !important;">{row[column.key]}</td>
                {:else}
                  <td style="vertical-align: middle !important;">
                    <div class="flex justify-center items-center">
                      <button
                        use:popup={{
                          event: 'click',
                          target: `popup-${row.id}`,
                          placement: 'top'
                        }}
                        class="btn btn-sm btn-ghost"
                      >
                        <Info size={18} />
                      </button>
                      <button on:click={() => downloadItem(row.fileId)} class="btn btn-sm btn-ghost">
                        <Download size={18} />
                      </button>
                      <button on:click={() => deleteItem(row.fileId)} class="btn btn-sm btn-ghost">
                        <Trash size={18} />
                      </button>                      
                      <div class="card p-4 shadow-xl" data-popup={`popup-${row.id}`}>
                        <p>Uploaded at: {new Date(row.uploadedAt * 1000).toLocaleString()}</p>
                        <p>Expiration in: {formatRemainingTime(row.uploadedAt * 1000)}</p>
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
    <p class="text-center py-4">No pending prints in the queue.</p>
  {/if}
</div>

