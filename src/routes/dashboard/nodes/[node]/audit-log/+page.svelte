<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fetcher, endpoints } from '$lib/api';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';

  $: nodeId = $page.params.node;

  let auditLogs: any[] = [];
  let pagination = { current_page: 1, has_next_page: false, has_previous_page: false, total_pages: 1 };
  let loading = true;
  let type = 'inbound';
  let page_num = 1;
  let limit = 40;

  const types = [
    { value: 'inbound', label: 'Inbound' },
    { value: 'outbound', label: 'Outbound' },
    { value: 'other', label: 'Other' },
    { value: 'all', label: 'ALL' },
  ];

  async function loadData() {
    loading = true;
    try {
      const res = await fetcher(endpoints.nodes.auditLog.list(nodeId), {params : { kind: type, page: page_num, limit }}) as any;
      auditLogs = res?.data?.auditLogList ?? [];
      pagination = res?.meta ?? pagination;
    } catch(e) { console.error(e); }
    loading = false;
  }

  $: nodeId, type, loadData();
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: 'Audit Log' }]} />
<h1 class="page-title">Audit Log</h1>

<div class="card" style="padding: 12px;">
  <div class="toolbar">
    <select bind:value={type} on:change={() => { page_num = 1; loadData(); }}>
      {#each types as t}
        <option value={t.value}>{t.label}</option>
      {/each}
    </select>
    <Pagination
      currentPage={pagination.current_page}
      totalPages={pagination.total_pages}
      hasNextPage={pagination.has_next_page}
      hasPreviousPage={pagination.has_previous_page}
      rowsPerPage={limit}
      onPageChange={p => { page_num = p + 1; loadData(); }}
      onRowsPerPageChange={r => { limit = r; page_num = 1; loadData(); }}
    />
  </div>

  <div style="overflow:auto;">
    {#if loading}
      <div style="display:flex;justify-content:center;padding:40px"><span class="loading-spinner"></span></div>
    {:else if auditLogs.length === 0}
      <div style="padding:40px;text-align:center;color:var(--text-muted)">No audit logs found</div>
    {:else}
      <table>
        <thead>
          <tr>
            <th style="text-align:right">No</th>
            <th style="text-align:right">Date</th>
            <th>Type</th>
            <th style="text-align:right">Description</th>
            <th style="text-align:right">Size</th>
          </tr>
        </thead>
        <tbody>
          {#each auditLogs as log}
            <tr class="clickable" on:click={() => goto(`/dashboard/nodes/${nodeId}/audit-log/${log.fname}`)}>
              <td style="text-align:right">{log.id}</td>
              <td style="text-align:right">{log.date}</td>
              <td>{log.kind}</td>
              <td style="text-align:right">{log.desc || '-'}</td>
              <td style="text-align:right">{log.size.toLocaleString()}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

<style>
  .toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
</style>
