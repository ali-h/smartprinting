<script>
  import { API_URL, loading, showcontent, isLoggedIn, name } from '../stores';
  import { get } from '$lib';
  import { onMount } from 'svelte';
  import { toSvg } from 'jdenticon';

  export let profilePictureUrl = '';
  export let username = '';
  export let balance = 0;
  export let lockedBalance = 0;
  export let pendingPrints = 0;
  export let totalSpent = 0;
  export let totalPrints = 0;
  export let activeSince = '';

  onMount(() => {
    get(`${$API_URL}/user/profile`)
      .then(response => {
        if (response.status === 200) {
          const { user, billingInfo } = response;
          username = user.username;
          $name = user.name;
          balance = billingInfo.currentBalance;
          lockedBalance = billingInfo.lockedBalance;
          pendingPrints = billingInfo.pendingPrints || 0;
          totalSpent = billingInfo.totalSpent || 0;
          totalPrints = billingInfo.totalPrints || 0;
          
          const date = new Date(billingInfo.createdAt);
          const now = new Date();
          const diffTime = Math.abs(now - date);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffMonths = Math.floor(diffDays / 30);
          const diffYears = Math.floor(diffDays / 365);
          
          if (diffYears > 0) {
            activeSince = `${diffYears} year${diffYears > 1 ? 's' : ''}`;
          } else if (diffMonths > 0) {
            activeSince = `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
          } else {
            activeSince = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
          }
          
          // Update profile picture
          const newProfilePicture = toSvg($name, 200);
          profilePictureUrl = `data:image/svg+xml;base64,${btoa(newProfilePicture)}`;
        }
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
      });
  });
</script>

<!-- User Profile and Account Billing Card -->
<div class="card p-4 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg rounded-[20px] shadow-slate-900">
  <div class="flex items-center mb-4">
    <img src={profilePictureUrl} alt="Profile" class="w-24 h-24 rounded-full mb-2" />
    <div class="flex flex-col ml-4">
      <h2 class="h2">{$name}</h2>
      <h3 class="h4 text-slate-400">{username}</h3>
    </div>
  </div>

  <div class="flex flex-col md:flex-row items-around md:items-start">
    <div class="flex-grow grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      <div class="card flex flex-col justify-between variant-glass-surface rounded-[20px] text-center sm:text-left">
        <h3 class="h5 mb-1 flex gap-3 items-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="w-7 h-7 bi bi-cash-stack transform rotate-[-10deg]" viewBox="0 0 16 16">
            <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
            <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2z"/>
          </svg>
          Current Balance
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{balance}</p>
        </div>
      </div>
      <div class="card flex flex-col justify-between variant-glass-surface rounded-[20px] text-center sm:text-left">
        <h3 class="h5 mb-1 flex gap-3 items-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="w-7 h-7 bi bi-lock transform rotate-[-10deg]" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
          </svg>
          Locked Balance
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{lockedBalance}</p>
        </div>
      </div>
      <div class="card flex flex-col justify-between variant-glass-surface rounded-[20px] text-center sm:text-left">
        <h3 class="h5 mb-1 flex gap-3 items-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="w-7 h-7 bi bi-printer transform rotate-[-10deg]" viewBox="0 0 16 16">
            <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
            <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
          </svg>
          Pending Prints
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{pendingPrints}</p>
        </div>
      </div>
      <div class="card flex flex-col justify-between variant-glass-surface rounded-[20px] text-center sm:text-left">
        <h3 class="h5 mb-1 flex gap-3 items-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="w-7 h-7 bi bi-wallet2 transform rotate-[-10deg]" viewBox="0 0 16 16">
            <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>
          </svg>
          Total Spent
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{totalSpent}</p>
        </div>
      </div>
      <div class="card flex flex-col justify-between variant-glass-surface rounded-[20px] text-center sm:text-left">
        <h3 class="h5 mb-1 flex gap-3 items-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="w-7 h-7 bi bi-printer-fill transform rotate-[-10deg]" viewBox="0 0 16 16">
            <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
            <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
          </svg>
          Total Prints
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{totalPrints}</p>
        </div>
      </div>
      <div class="card flex flex-col justify-between variant-glass-surface rounded-[20px] text-center sm:text-left">
        <h3 class="h5 mb-1 flex gap-3 items-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="w-7 h-7 bi bi-calendar-check transform rotate-[-10deg]" viewBox="0 0 16 16">
            <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
          </svg>
          Active Since
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{activeSince}</p>
        </div>
      </div>
    </div>
  </div>
</div>
