<script lang="ts">
  import { goto } from '$app/navigation';
  import { nodesStore } from '$lib/stores/nodes';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  import { t } from '$lib/i18n';

  $: nodes = $nodesStore.nodes;
  $: loading = $nodesStore.loading;
</script>

<Breadcrumb pages={[{ pageName: $t.nav.nodes }]} />
<h1 class="page-title">{$t.nav.nodes}</h1>

<div class="card" style="padding: 0; overflow: auto;">
  {#if loading}
    <div style="display:flex;justify-content:center;padding:40px"><span class="loading-spinner"></span></div>
  {:else}
    <table>
      <thead>
        <tr>
          <th>{$t.dashboard.state}</th><th>{$t.dashboard.id}</th><th>{$t.dashboard.name}</th><th>{$t.dashboard.description}</th>
          <th>{$t.dashboard.emittable}</th><th style="text-align:right">{$t.dashboard.emitCount}</th>
        </tr>
      </thead>
      <tbody>
        {#each nodes as node}
          <tr class="clickable" on:click={() => goto(`/dashboard/nodes/${node.id}/node-dashboard`)}>
            <td>
              <span class="chip {node.online_status ? 'online' : 'offline'}">
                <span class="dot {node.online_status ? 'online' : 'offline'}"></span>
                {node.online_status ? $t.dashboard.online : $t.dashboard.offline}
              </span>
            </td>
            <td>{node.id}</td><td>{node.name}</td><td>{node.desc}</td>
            <td><span class="chip {node.emittable ? 'yes' : 'no'}">{node.emittable ? $t.dashboard.yes : $t.dashboard.no}</span></td>
            <td style="text-align:right">{node.emit_count.toLocaleString()}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
