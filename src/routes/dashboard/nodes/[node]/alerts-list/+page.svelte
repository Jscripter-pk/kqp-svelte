<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  $: nodeId = $page.params.node;
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: 'Alerts List' }]} />
<h1 class="page-title">Alerts List</h1>
<div class="card" style="padding:40px;text-align:center;color:var(--text-muted)">No alerts available in demo mode.</div>
