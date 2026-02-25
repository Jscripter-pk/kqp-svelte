<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  $: nodeId = $page.params.node;
  onMount(() => { goto(`/dashboard/nodes/${nodeId}/node-dashboard`); });
</script>
