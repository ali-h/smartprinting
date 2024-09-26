<script>
  import { post, getToken } from '$lib';
  import { goto } from '$app/navigation';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
	import { API_URL, loading, showcontent } from '../../stores';
  // Import Lucide icons
  import { SquareUserRound, Info, Eye, EyeOff } from 'lucide-svelte';

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
  let passwordVisible = false;
  let confirmPasswordVisible = false;

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
        throw new Error(response.result.message || 'Registration failed');
      }
    } catch (error) {
      toastStore.trigger({
        message: error.message || 'An error occurred during registration',
        background: 'variant-filled-error'
      });
    }
  }

  function togglePasswordVisibility(field) {
    if (field === 'password') {
      passwordVisible = !passwordVisible;
    } else if (field === 'confirm_password') {
      confirmPasswordVisible = !confirmPasswordVisible;
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

          <SquareUserRound size={28} />
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
                <Info size={16} />
              </button>
            </div>
          </div>

          <div>
						<label for="password" class="block text-sm font-medium ml-1">Password</label>
						<div class="relative mt-2">
							{#if passwordVisible}
								<input type="text" name="password" id="password-visible" bind:value={password} class="input pr-10" placeholder="Enter Password" required>
							{:else}
								<input type="password" name="password" id="password-hidden" bind:value={password} class="input pr-10" placeholder="Enter Password" required>
							{/if}
							<button type="button" class="absolute inset-y-0 end-0 flex items-center pe-3" on:click={() => togglePasswordVisibility('password')}>
								{#if passwordVisible}
									<EyeOff size={18} />
								{:else}
									<Eye size={18} />
								{/if}
							</button>
						</div>
					</div>

          <div>
						<label for="confirm_password" class="block text-sm font-medium ml-1">Confirm Password</label>
						<div class="relative mt-2">
							{#if confirmPasswordVisible}
								<input type="text" name="confirm_password" id="confirm_password-visible" bind:value={confirm_password} class="input pr-10" placeholder="Enter Confirm Password" required>
							{:else}
								<input type="password" name="confirm_password" id="confirm_password-hidden" bind:value={confirm_password} class="input pr-10" placeholder="Enter Confirm Password" required>
							{/if}
							<button type="button" class="absolute inset-y-0 end-0 flex items-center pe-3" on:click={() => togglePasswordVisibility('confirm_password')}>
								{#if confirmPasswordVisible}
									<EyeOff size={18} />
								{:else}
									<Eye size={18} />
								{/if}
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