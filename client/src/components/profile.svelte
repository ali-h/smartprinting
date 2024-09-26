<script>
  import { API_URL, loading, showcontent, isLoggedIn, name } from '../stores';
  import { get } from '$lib';
  import { onMount } from 'svelte';
  import { toSvg } from 'jdenticon';
  import { Banknote, Lock, Printer, Wallet, PrinterIcon, CalendarCheck } from 'lucide-svelte';

  let profilePictureUrl = '';
  let username = '';
  let balance = 0;
  let lockedBalance = 0;
  let pendingPrints = 0;
  let totalSpent = 0;
  let totalPrints = 0;
  let activeSince = 0;

  onMount(() => {
    get(`${$API_URL}/user/profile`)
      .then(response => {
        if (response.status === 200) {
          const result = response.result;
          username = result.username;
          $name = result.name;
          balance = result.currentBalance;
          lockedBalance = result.lockedBalance;
          pendingPrints = result.pendingPrints || 0;
          totalSpent = result.totalSpent || 0;
          totalPrints = result.totalPrints || 0;
          
          const date = new Date(result.createdAt * 1000);
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
          <Banknote class="w-7 h-7 transform rotate-[-10deg]" />
          Current Balance
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{balance}</p>
        </div>
      </div>
      <div class="card flex flex-col justify-between variant-glass-surface rounded-[20px] text-center sm:text-left">
        <h3 class="h5 mb-1 flex gap-3 items-center p-4">
          <Lock class="w-7 h-7 transform rotate-[-10deg]" />
          Locked Balance
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{lockedBalance}</p>
        </div>
      </div>
      <div class="card flex flex-col justify-between variant-glass-surface rounded-[20px] text-center sm:text-left">
        <h3 class="h5 mb-1 flex gap-3 items-center p-4">
          <Printer class="w-7 h-7 transform rotate-[-10deg]" />
          Pending Prints
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{pendingPrints}</p>
        </div>
      </div>
      <div class="card flex flex-col justify-between variant-glass-surface rounded-[20px] text-center sm:text-left">
        <h3 class="h5 mb-1 flex gap-3 items-center p-4">
          <Wallet class="w-7 h-7 transform rotate-[-10deg]" />
          Total Spent
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{totalSpent}</p>
        </div>
      </div>
      <div class="card flex flex-col justify-between variant-glass-surface rounded-[20px] text-center sm:text-left">
        <h3 class="h5 mb-1 flex gap-3 items-center p-4">
          <PrinterIcon class="w-7 h-7 transform rotate-[-10deg]" />
          Total Prints
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{totalPrints}</p>
        </div>
      </div>
      <div class="card flex flex-col justify-between variant-glass-surface rounded-[20px] text-center sm:text-left">
        <h3 class="h5 mb-1 flex gap-3 items-center p-4">
          <CalendarCheck class="w-7 h-7 transform rotate-[-10deg]" />
          Active Since
        </h3>
        <div class="flex w-[80%] self-end justify-end bg-gradient-to-br variant-gradient-tertiary-primary rounded-tr-[0px] rounded-tl-[20px] rounded-br-[20px] p-2">
          <p class="h3 px-2 rounded-full">{activeSince}</p>
        </div>
      </div>
    </div>
  </div>
</div>
