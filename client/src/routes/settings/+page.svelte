<script>
  import { API_URL, name, loading, showcontent, isLoggedIn } from '../../stores';
  import { get, post, getToken } from '$lib';
  import { onMount } from 'svelte';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';
  import { goto } from '$app/navigation';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import { toSvg } from 'jdenticon';
  import { User, AtSign, CreditCard } from 'lucide-svelte';

  const toastStore = getToastStore();

  let activeTab = 0;
  let userInfo = {
    name: '',
    email: '',
    mobile: '',
    username: '',
    rfid: '',
  };
  let newPassword = '';
  let confirmPassword = '';
  let promptForPrints = false;
  let profilePictureUrl = '';

  $showcontent = false;
  $loading = true;

  onMount(async () => {
    const token = getToken();
    if (!token) {
      goto('/login');
      return;
    } else {
      $loading = false;
      $showcontent = true;
      $isLoggedIn = true;
    }

    try {
      const response = await get(`${$API_URL}/user/profile`);
      if (response.status === 200) {
        const result = response.result;
        userInfo = {
          name: result.name,
          email: result.email,
          mobile: result.mobile || '',
          username: result.username,
          rfid: result.rfid || 'Not set',
        };
        $name = result.name;
        promptForPrints = result.promptForPrints || false;

        // Generate profile picture
        const newProfilePicture = toSvg(userInfo.name, 200);
        profilePictureUrl = `data:image/svg+xml;base64,${btoa(newProfilePicture)}`;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('authToken');
      toastStore.trigger({
        message: 'Session expired. Please log in again.',
        background: 'variant-filled-error'
      });
      goto('/login');
    }
  });

  async function updateUserInfo() {
    try {
      const response = await post(`${$API_URL}/user/profile`, userInfo);
      if (response.status === 200) {
        $name = userInfo.name;
        toastStore.trigger({
          message: 'User information updated successfully',
          background: 'variant-filled-success'
        });
      }
    } catch (error) {
      console.error('Error updating user information:', error);
      toastStore.trigger({
        message: 'Failed to update user information',
        background: 'variant-filled-error'
      });
    }
  }

  async function updatePassword() {
    if (newPassword !== confirmPassword) {
      toastStore.trigger({
        message: 'Passwords do not match',
        background: 'variant-filled-error'
      });
      return;
    }

    try {
      const response = await post(`${$API_URL}/user/password`, { password: newPassword });
      if (response.status === 200) {
        toastStore.trigger({
          message: 'Password updated successfully',
          background: 'variant-filled-success'
        });
        newPassword = '';
        confirmPassword = '';
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toastStore.trigger({
        message: 'Failed to update password',
        background: 'variant-filled-error'
      });
    }
  }

  async function updatePrintPrompt() {
    try {
      const response = await post(`${$API_URL}/user/settings`, { promptForPrints });
      if (response.status === 200) {
        toastStore.trigger({
          message: 'Print prompt setting updated successfully',
          background: 'variant-filled-success'
        });
      }
    } catch (error) {
      console.error('Error updating print prompt setting:', error);
      toastStore.trigger({
        message: 'Failed to update print prompt setting',
        background: 'variant-filled-error'
      });
    }
  }
</script>

{#if $showcontent}
<div class="container mx-auto p-4">
  <h1 class="h1 mb-4">Settings</h1>

  <TabGroup>
    <Tab bind:group={activeTab} name="tab1" value={0}>User Information</Tab>
    <Tab bind:group={activeTab} name="tab2" value={1}>Change Password</Tab>
    <Tab bind:group={activeTab} name="tab3" value={2}>Additional Settings</Tab>

    <!-- User Information Tab -->
    <svelte:fragment slot="panel">
      {#if activeTab === 0}
        <div class="card p-4 mt-4">
          <h2 class="h2 mb-4">User Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="card variant-glass-surface p-4 rounded-lg flex items-center">
              <img src={profilePictureUrl} alt="Profile" class="w-16 h-16 rounded-full mr-4" />
              <div>
                <h3 class="h4">{userInfo.name}</h3>
                <p class="text-sm text-gray-500">Profile Picture</p>
              </div>
            </div>
            <div class="card variant-glass-surface p-4 rounded-lg flex items-center">
              <User class="w-8 h-8 mr-4" />
              <div>
                <h3 class="h4">{userInfo.username}</h3>
                <p class="text-sm text-gray-500">Username</p>
              </div>
            </div>
            <div class="card variant-glass-surface p-4 rounded-lg flex items-center">
              <AtSign class="w-8 h-8 mr-4" />
              <div>
                <h3 class="h4">{userInfo.email}</h3>
                <p class="text-sm text-gray-500">Email</p>
              </div>
            </div>
            <div class="card variant-glass-surface p-4 rounded-lg flex items-center">
              <CreditCard class="w-8 h-8 mr-4" />
              <div>
                <h3 class="h4">{userInfo.rfid}</h3>
                <p class="text-sm text-gray-500">RFID</p>
              </div>
            </div>
          </div>
          <form on:submit|preventDefault={updateUserInfo}>
            <label class="label">
              <span>Name</span>
              <input class="input" type="text" bind:value={userInfo.name} required />
            </label>
            <label class="label">
              <span>Email</span>
              <input class="input" type="email" bind:value={userInfo.email} required />
            </label>
            <label class="label">
              <span>Mobile</span>
              <input class="input" type="tel" bind:value={userInfo.mobile} />
            </label>
            <button type="submit" class="btn variant-filled-primary mt-4">Update Information</button>
          </form>
        </div>
      {/if}

      <!-- Change Password Tab -->
      {#if activeTab === 1}
        <div class="card p-4 mt-4">
          <h2 class="h2 mb-4">Change Password</h2>
          <form on:submit|preventDefault={updatePassword}>
            <label class="label">
              <span>New Password</span>
              <input class="input" type="password" bind:value={newPassword} required />
            </label>
            <label class="label">
              <span>Confirm Password</span>
              <input class="input" type="password" bind:value={confirmPassword} required />
            </label>
            <button type="submit" class="btn variant-filled-primary mt-4">Change Password</button>
          </form>
        </div>
      {/if}

      <!-- Additional Settings Tab -->
      {#if activeTab === 2}
        <div class="card p-4 mt-4">
          <h2 class="h2 mb-4">Additional Settings</h2>
          <div class="flex items-center space-x-2">
            <SlideToggle name="prompt-for-prints" id="prompt-for-prints" bind:checked={promptForPrints} on:change={updatePrintPrompt} />
            <label for="prompt-for-prints" class="cursor-pointer">Prompt for prints</label>
          </div>
          <p class="text-sm text-gray-500 mt-2">
            When enabled, you'll be prompted to accept prints in the app when your card is scanned on the terminal.
          </p>
        </div>
      {/if}
    </svelte:fragment>
  </TabGroup>
</div>
{/if}
