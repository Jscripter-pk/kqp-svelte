<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  onMount(() => {
    if ($auth) {
      goto('/dashboard');
    } else {
      goto('/auth/login');
    }
  });
</script>
