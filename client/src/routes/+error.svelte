<script>
    import { page } from '$app/stores';
</script>

<div class="container h-full mx-auto flex justify-center items-center my-10">
    <div class="card p-4">
        <div class="card-body">
            <div class="mb-5">
                <span class="h3">
                    Error {$page.status}: {$page.error.message}
                </span>

                <p>
                    Oops! Something went wrong.
                </p>
            </div>
            <div class="flex justify-end">
                <a href="/" class="btn variant-glass-secondary">
                    Go Back
                </a>
            </div>
        </div>
    </div>
</div>
