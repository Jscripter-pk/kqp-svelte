<script lang="ts">
  import { page } from '$app/stores';
  import { fetcher, endpoints } from '$lib/api';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';

  $: nodeId = $page.params.node;

  let channels: any[] = [];
  let loading = true;

  async function loadData() {
    loading = true;
    try {
      const res = await fetcher(endpoints.nodes.channelInbound.list(nodeId), {
        params : { kind: 'outbound' }
    }) as any;
      channels = res?.data?.list ?? [];
    } catch(e) { console.error(e); }
    loading = false;
  }

  $: nodeId, loadData();
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: 'Channel Outbound' }]} />
<h1 class="page-title">Channel Outbound</h1>

<div class="card" style="padding:0;overflow:auto;">
  {#if loading}
    <div style="display:flex;justify-content:center;padding:40px"><span class="loading-spinner"></span></div>
  {:else if channels.length === 0}
    <div style="padding:40px;text-align:center;color:var(--text-muted)">No outbound channels found</div>
  {:else}
    <table>
      <thead>
        <tr>
          <th style="text-align:right">ID</th>
          <th>Name</th><th>Topic</th><th>Type</th><th>UType</th>
          <th style="text-align:right">Port</th>
          <th style="text-align:right">IP</th>
          <th style="text-align:right">NIC</th>
          <th style="text-align:right">Count</th>
        </tr>
      </thead>
      <tbody>
        {#each channels as ch}
          <tr>
            <td style="text-align:right">{ch.id}</td>
            <td>{ch.name}</td><td>{ch.topic}</td><td>{ch.type}</td><td>{ch.utype}</td>
            <td style="text-align:right">{ch.port}</td>
            <td style="text-align:right">{ch.mip}</td>
            <td style="text-align:right">{ch.nic}</td>
            <td style="text-align:right">{ch.count}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
