<script lang="ts">
  import { page } from '$app/stores';
  import { fetcher, endpoints } from '$lib/api';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  import { t } from '$lib/i18n';

  $: nodeId = $page.params.node;

  let channels: any[] = [];
  let loading = true;

  async function loadData() {
    loading = true;
    try {
      const res = await fetcher(endpoints.nodes.channelInbound.list(nodeId), {
        params : { kind: 'inbound' }
    }) as any;
      channels = res?.data?.list ?? [];
    } catch(e) { console.error(e); }
    loading = false;
  }

  $: nodeId, loadData();
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: $t.channel.inboundTitle }]} />
<h1 class="page-title">{$t.channel.inboundTitle}</h1>

<div class="card" style="padding:0;overflow:auto;">
  {#if loading}
    <div style="display:flex;justify-content:center;padding:40px"><span class="loading-spinner"></span></div>
  {:else if channels.length === 0}
    <div style="padding:40px;text-align:center;color:var(--text-muted)">{$t.channel.noInbound}</div>
  {:else}
    <table>
      <thead>
        <tr>
          <th style="text-align:right">{$t.common.id}</th>
          <th>{$t.common.name}</th><th>{$t.channel.topic}</th><th>{$t.common.type}</th><th>{$t.channel.utype}</th>
          <th style="text-align:right">{$t.channel.port}</th>
          <th style="text-align:right">{$t.channel.ip}</th>
          <th style="text-align:right">{$t.channel.nic}</th>
          <th style="text-align:right">{$t.channel.count}</th>
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
