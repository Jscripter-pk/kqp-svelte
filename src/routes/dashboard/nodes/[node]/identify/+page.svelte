<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { fetcher, endpoints } from "$lib/api";
  import Breadcrumb from "$lib/components/common/Breadcrumb.svelte";
  import { t } from "$lib/i18n";

  $: nodeId = $page.params.node;
  let items: any[] = [];
  let loading = true;

  async function loadData() {
    loading = true;
    try {
      const res = (await fetcher(endpoints.identify.list(nodeId))) as any;
      items = res?.data?.list ?? [];
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  $: nodeId, loadData();
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: $t.identify.title }]} />
<h1 class="page-title">{$t.identify.title}</h1>

<div class="card" style="padding:0;overflow:auto;">
  {#if loading}
    <div style="display:flex;justify-content:center;padding:40px">
      <span class="loading-spinner"></span>
    </div>
  {:else if items.length === 0}
    <div style="padding:40px;text-align:center;color:var(--text-muted)">
      {$t.identify.noData}
    </div>
  {:else}
    <table>
      <thead
        ><tr>
          <th></th>
          <th>{$t.common.id}</th>
          <th>{$t.identify.identifierName}</th>
          <th>{$t.common.path}</th>
          <th>{$t.common.timestamp}</th>
          <th>{$t.identify.refSpecs}</th>
          <th>{$t.common.description}</th>
          <th></th>
        </tr></thead
      >
      <tbody>
        {#each items as item, i}
          <tr
            class="clickable"
            on:click={() =>
              goto(
                `/dashboard/nodes/${nodeId}/identify/${encodeURIComponent(item.name)}`,
              )}
          >
            <td></td>
            <td>{i + 1}</td>
            <td>{item.name}</td>
            <td>{item.path ?? ""}</td>
            <td>{item.timestamp}</td>
            <td>{item.ref_specs ?? ""}</td>
            <td>{item.desc}</td>
            <td></td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
