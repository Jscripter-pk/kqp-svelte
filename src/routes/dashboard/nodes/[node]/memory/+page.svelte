<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fetcher, endpoints } from '$lib/api';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import ChartArea from '$lib/components/dashboard/ChartArea.svelte';

  $: nodeId = $page.params.node;

  let issues: any = { max_issue_count: 0, compet_count: 0, issueList: [] };
  let pagination = { current_page: 1, has_next_page: false, has_previous_page: false, total_pages: 1 };
  let graphData: any[] = [];
  let loading = true;
  let offset = 1;
  let limit = 40;
  let searchCode = '';

  async function loadData() {
  loading = true;

  try {
    const url = searchCode
      ? endpoints.nodes.issues.search(nodeId)
      : endpoints.nodes.issues.list(nodeId);

    const queryParams: Record<string, string | number> = {
      offset,
      limit
    };

    if (searchCode) {
      queryParams.q = searchCode;
    }

    const [res, graphRes] = await Promise.all([
      fetcher(url, {
        method: 'GET',
        params: queryParams
      }) as Promise<any>,

      fetcher(endpoints.nodes.issues.graph(nodeId), {
        method: 'GET'
      }) as Promise<any>
    ]);

    issues = res?.data ?? issues;
    pagination = res?.meta ?? pagination;

    const metrics = graphRes?.data?.metrics ?? [];
    graphData = metrics.map((m: any) => ({
      timestamp: String(m.hhmmss)
        .slice(0, 4)
        .replace(/(\d{2})(\d{2})/, '$1:$2'),
      memory: m.memory
    }));

  } catch (e) {
    console.error(e);
  }

  loading = false;
}

  $: nodeId, loadData();

  let searchInput = '';
  function onSearch() { searchCode = searchInput; offset = 1; loadData(); }
  function onReset() { searchCode = ''; searchInput = ''; offset = 1; loadData(); }
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: 'Memory' }]} />
<h1 class="page-title">Memory</h1>

<div class="memory-layout">
  <!-- Left Stats -->
  <div class="left-panel">
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-lbl">Issues</div>
        <div class="stat-divider"></div>
        <div class="stat-val">{issues.max_issue_count}</div>
      </div>
      <div class="stat-box">
        <div class="stat-lbl">Compet</div>
        <div class="stat-divider"></div>
        <div class="stat-val">{issues.compet_count}</div>
      </div>
    </div>
    <div class="chart-box">
      <ChartArea title="Memory %" data={graphData} metric="memory" height="280px" {loading} />
    </div>
  </div>

  <!-- Right Table -->
  <div class="right-panel">
    <!-- Search -->
    <div class="search-bar card">
      <input placeholder="Search by code..." bind:value={searchInput}
        on:keydown={e => e.key === 'Enter' && onSearch()} />
      <button class="btn primary" on:click={onSearch}>Search</button>
      <button class="btn" on:click={onReset}>Reset</button>
    </div>

    <div class="pagination-bar">
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        hasNextPage={pagination.has_next_page}
        hasPreviousPage={pagination.has_previous_page}
        rowsPerPage={limit}
        onPageChange={p => { offset = limit * p + 1; loadData(); }}
        onRowsPerPageChange={r => { limit = r; offset = 1; loadData(); }}
      />
    </div>

    <div class="card" style="padding:0; overflow:auto;">
      {#if loading}
        <div style="display:flex;justify-content:center;padding:40px"><span class="loading-spinner"></span></div>
      {:else}
        <table>
          <thead>
            <tr>
              <th style="text-align:right">SEQ</th>
              <th>CODE</th><th>K.Name</th><th>Daily Info</th>
              <th style="text-align:right">Compet</th>
            </tr>
          </thead>
          <tbody>
            {#if issues.issueList.length === 0}
              <tr><td colspan="5" style="padding:40px;text-align:center;color:var(--text-muted)">No memory data found</td></tr>
            {:else}
              {#each issues.issueList as issue}
                <tr class="clickable" on:click={() => goto(`/dashboard/nodes/${nodeId}/memory/${issue.code}`)}>
                  <td style="text-align:right">{issue.seq}</td>
                  <td>{issue.code}</td>
                  <td>{issue.name}</td>
                  <td>[{issue.daily_info_dates.join(' / ')}]</td>
                  <td style="text-align:right">{issue.compet}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</div>

<style>
  .memory-layout { display: grid; grid-template-columns: 260px 1fr; gap: 16px; align-items: start; }
  @media (max-width: 900px) { .memory-layout { grid-template-columns: 1fr; } }

  .stats-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 4px;
    padding: 4px;
    background: #1A2133; border-radius: 12px; margin-bottom: 8px;
  }

  .stat-box {
    background: linear-gradient(180deg, #202838 80%, #373F4E 100%);
    border: 1px solid #4E576A;
    border-radius: 8px; padding: 12px;
  }

  .stat-lbl { font-size: 14px; font-weight: 500; color: white; }
  .stat-divider { height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent); margin: 10px 0; }
  .stat-val { font-size: 28px; font-weight: 400; color: white; text-align: right; }

  .chart-box { border-radius: 8px; overflow: hidden; }

  .search-bar { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
  .search-bar input { flex: 1; }

  .pagination-bar { margin-bottom: 8px; }
</style>
