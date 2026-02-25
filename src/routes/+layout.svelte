<script lang="ts">
  import '../app.css';
  import { theme } from '$lib/stores/theme';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  onMount(() => {
    const applyTheme = (t: string) => {
      document.body.classList.remove('dark', 'light');
      document.body.classList.add(t);
    };
    applyTheme($theme);
    const unsub = theme.subscribe(applyTheme);
    return unsub;
  });
</script>

<slot />
