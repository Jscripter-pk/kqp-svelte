<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  import { t } from '$lib/i18n';
  $: nodeId = $page.params.node;
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: $t.dailyReport.title }]} />
<h1 class="page-title">{$t.dailyReport.title}</h1>
<div class="card" style="padding:40px;text-align:center;color:var(--text-muted)">{$t.dailyReport.noData}</div>
