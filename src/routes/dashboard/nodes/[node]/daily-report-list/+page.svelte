<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  $: nodeId = $page.params.node;
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: 'Daily Report List' }]} />
<h1 class="page-title">Daily Report List</h1>
<div class="card" style="padding:40px;text-align:center;color:var(--text-muted)">No daily reports available in demo mode.</div>
