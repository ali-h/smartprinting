<script>
  import { togglePasswordVisibility, post, getToken } from '$lib';
  import { goto } from '$app/navigation';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
	import { API_URL, loading, showcontent } from '../../stores';

  const toastStore = getToastStore();

  $showcontent = false;
  $loading = true;

  let name = '';
  let username = '';
  let email = '';
  let mobile = '';
  let rfid = '';
  let password = '';
  let confirm_password = '';

  async function handleRegister(e) {
    e.preventDefault();

    if (username === '' || name === '' || email === '' || mobile === '' || rfid === '' || password === '' || confirm_password === '') {
      toastStore.trigger({
        message: 'All fields are required',
        background: 'variant-filled-error'
      });
      return;
    }
    
    if (password !== confirm_password) {
      toastStore.trigger({
        message: 'Passwords do not match',
        background: 'variant-filled-error'
      });
      return;
    }

    try {
      const response = await post(`${$API_URL}/user/register`, {
        name,
        username,
        email,
        mobile,
        rfid,
        password
      }, false);

      if (response.status === 201) {
        toastStore.trigger({
          message: 'Registration successful!',
          background: 'variant-filled-success'
        });
        goto('/login'); // Redirect to login
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      toastStore.trigger({
        message: error.message || 'An error occurred during registration',
        background: 'variant-filled-error'
      });
    }
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
			<div class="card-body">
				<div class="mb-5 flex justify-between items-center">
					<span class="h2">
						Register
					</span>

          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-7 h-7 bi bi-person-bounding-box" viewBox="0 0 16 16">
            <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5"/>
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
          </svg>
				</div>

        <hr class="!border-t-3 mb-5" />

				<form class="space-y-4">
          <div>
						<label for="name" class="block text-sm font-medium ml-1">Name</label>
						<input type="text" name="name" id="name" bind:value={name} class="mt-2 input" placeholder="Enter Name" required>
					</div>

					<div>
						<label for="username" class="block text-sm font-medium ml-1">Username</label>
						<input type="text" name="username" id="username" bind:value={username} class="mt-2 input" placeholder="Enter Username (Reg No.)" required>
					</div>

          <div> 
						<label for="email" class="block text-sm font-medium ml-1">Email</label>
						<input type="email" name="email" id="email" bind:value={email} class="mt-2 input" placeholder="Enter Email" required>
					</div>
          
          <div>
            <label for="mobile" class="block text-sm font-medium ml-1">Mobile No.</label>
            <div class="relative mt-2 flex">
              <span class="btn variant-filled-primary px-3 py-2 rounded-r-none">
                +92
              </span>
              <input type="text" name="mobile" id="mobile" bind:value={mobile} class="input rounded-l-none" placeholder="Enter Mobile No. (3XXXXXXXXX)" required>
            </div>
          </div>
          

          <div>
            <label for="rfid" class="block text-sm font-medium ml-1">RFID No.</label>
            <div class="relative mt-2">
              <input type="text" name="rfid" id="rfid" bind:value={rfid} class="input pr-10" placeholder="Enter RFID No." required>
            
              <button type="button" class="absolute inset-y-0 end-0 flex items-center pe-3">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                </svg>
            </button>
            </div>
          </div>

          <div>
						<label for="password" class="block text-sm font-medium ml-1">Password</label>
						<div class="relative mt-2">
							<input type="password" name="password" id="password" bind:value={password} class="input pr-10" placeholder="Enter Password" required>
							<button type="button" class="absolute inset-y-0 end-0 flex items-center pe-3" data-toggle="password" on:click={togglePasswordVisibility}>
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" data-toggle="password" class="bi bi-eye" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                </svg>
							</button>
						</div>
					</div>

          <div>
						<label for="confirm_password" class="block text-sm font-medium ml-1">Confirm Password</label>
						<div class="relative mt-2">
							<input type="password" name="confirm_password" id="confirm_password" bind:value={confirm_password} class="input pr-10" placeholder="Enter Confirm Password" required>
							<button type="button" class="absolute inset-y-0 end-0 flex items-center pe-3" data-toggle="confirm_password" on:click={togglePasswordVisibility}>
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" data-toggle="confirm_password" class="bi bi-eye" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                </svg>
							</button>
						</div>
					</div>

          <button type="submit" class="mt-2 mb-2 btn variant-filled-primary w-full" on:click={handleRegister}>Register</button>

          <div class="text-center">
            <p class="text-sm text-gray-500">Already have an account? <a href="/login" class="text-blue-500">Login</a></p>
          </div>
				</form>
			</div>
		</div>
	</div>
</div>
{/if}