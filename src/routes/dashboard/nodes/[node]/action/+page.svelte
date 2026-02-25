<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fetcher, endpoints } from '$lib/api';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  import { t } from '$lib/i18n';

  $: nodeId = $page.params.node;
  let items: any[] = [];
  let loading = true;

  async function loadData() {
    loading = true;
    try {
      const res = await fetcher(endpoints.actions.list(nodeId)) as any;
      items = res?.data?.auditLogList ?? [];
    } catch(e) { console.error(e); }
    loading = false;
  }

  $: nodeId, loadData();
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: $t.action.title }]} />
<h1 class="page-title">{$t.action.title}</h1>

<div class="card" style="padding:0;overflow:auto;">
  {#if loading}
    <div style="display:flex;justify-content:center;padding:40px"><span class="loading-spinner"></span></div>
  {:else if items.length === 0}
    <div style="padding:40px;text-align:center;color:var(--text-muted)">{$t.action.noData}</div>
  {:else}
    <table>
      <thead><tr>
        <th style="text-align:right">{$t.common.id}</th><th>{$t.common.name}</th><th>{$t.common.path}</th>
        <th>{$t.common.timestamp}</th><th>{$t.action.refLayout}</th>
        <th style="text-align:right">{$t.common.refProcess}</th><th>{$t.common.description}</th>
      </tr></thead>
      <tbody>
        {#each items as item, i}
          <tr class="clickable" on:click={() => goto(`/dashboard/nodes/${nodeId}/action/${item.name}`)}>
            <td style="text-align:right">{i+1}</td>
            <td>{item.name}</td><td>{item.path}</td><td>{item.timestamp}</td>
            <td>{item.ref_layout}</td>
            <td style="text-align:right">{Number(item.ref_process).toLocaleString()}</td>
            <td>{item.desc}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
