<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fetcher, endpoints } from '$lib/api';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  import ChartArea from '$lib/components/dashboard/ChartArea.svelte';

  $: nodeId = $page.params.node;

  let status: any = null;
  let diskData: any = null;
  let graphData: any[] = [];
  let loading = true;

  function processChartData(metrics: any[]) {
    return metrics.map((m: any) => ({
      timestamp: String(m.hhmmss).replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2'),
      cpu: m.cpu, memory: m.memory,
      inbound_bytes: m.inbound_bytes, outbound_bytes: m.outbound_bytes,
      inbound_count: m.inbound_count, outbound_count: m.outbound_count,
    }));
  }

  async function loadData() {
    loading = true;
    try {
      const [s, d, g] = await Promise.all([
        fetcher(endpoints.dashboard.serviceStatus(nodeId)) as Promise<any>,
        fetcher(endpoints.dashboard.diskMetrics(nodeId)) as Promise<any>,
        fetcher(endpoints.dashboard.graph(nodeId)) as Promise<any>,
      ]);
      status = s?.data?.service_status ?? null;
      diskData = d?.data ?? null;
      graphData = g?.data?.metrics ? processChartData(g.data.metrics) : [];
    } catch(e) { console.error(e); }
    loading = false;
  }

  $: nodeId, loadData();
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: 'Node Dashboard' }]} />
<h1 class="page-title">Node Dashboard</h1>

{#if loading}
  <div style="display:flex;justify-content:center;padding:60px"><span class="loading-spinner"></span></div>
{:else}
  <div class="node-dash-grid">
    <!-- Status Panel -->
    <div class="status-col">
      {#if status}
        <div class="status-card card">
          <div class="status-header-badge" class:online={status.okay} class:offline={!status.okay}>
            <span class="chip {status.okay ? 'online' : 'offline'}">
              <span class="dot {status.okay ? 'online' : 'offline'}"></span>
              {status.okay ? 'Online' : 'Offline'}
            </span>
            <div class="node-title">
              <span class="nid">{nodeId}</span>
            </div>
            <div class="meta">
              <span>{status.date}</span>
              <span>{status.wday}</span>
              <span>Emittable: {status.emittable ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div class="verify-section">
            <h4>Verify</h4>
            {#each Object.entries(status.verify) as [key, val]}
              <div class="verify-row">
                <span>{key.replace(/_/g, ' ')}</span>
                <span class="chip {val ? 'yes' : 'no'}">{val ? 'OK' : 'FAIL'}</span>
              </div>
            {/each}
          </div>

          {#if diskData}
            <div class="disk-card">
              <div class="disk-header">
                <span>Disk</span>
                <span class="disk-pct">{diskData.disk_usage}%</span>
              </div>
              <div class="disk-used">{diskData.disk_used_size} GB of {diskData.disk_total_size} GB</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: {diskData.disk_usage}%"></div>
              </div>
            </div>
          {/if}

          {#if status.audit?.masters}
            <div class="masters-section">
              <h4>Masters</h4>
              <div class="master-row"><span>KRX Count</span><span>{status.audit.masters.krx_count}</span></div>
              <div class="master-row"><span>NXT Count</span><span>{status.audit.masters.nxt_count}</span></div>
              <div class="master-row"><span>Common Count</span><span>{status.audit.masters.common_count}</span></div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="card">No status data available</div>
      {/if}
    </div>

    <!-- Charts -->
    <div class="charts-col">
      <div class="charts-grid">
        <ChartArea title="CPU" data={graphData} metric="cpu" height="220px" />
        <ChartArea title="Memory" data={graphData} metric="memory" height="220px" />
        <ChartArea title="Inbound Count" data={graphData} metric="inbound_count" height="220px" />
        <ChartArea title="Outbound Count" data={graphData} metric="outbound_count" height="220px" />
      </div>
    </div>
  </div>
{/if}

<style>
  .node-dash-grid { display: grid; grid-template-columns: 300px 1fr; gap: 16px; align-items: start; }
  @media (max-width: 900px) { .node-dash-grid { grid-template-columns: 1fr; } }

  .status-col .card { padding: 0; overflow: hidden; }

  .status-header-badge {
    padding: 16px;
  }
  .online { background: radial-gradient(100% 100% at 0% 100%, #1F6B27 0%, #1D2F20 100%); border-bottom: 1px solid #36573C; }
  .offline { background: radial-gradient(100% 100% at 0% 100%, #6B1F1F 0%, #331B1E 100%); border-bottom: 1px solid #4A2C31; }

  .node-title { margin: 10px 0 6px; }
  .nid { font-size: 22px; font-weight: 600; color: white; }
  .meta { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 6px; }

  .verify-section, .masters-section { padding: 12px 16px; border-bottom: 1px solid var(--border-color); }
  .verify-section h4, .masters-section h4 { font-size: 13px; color: var(--text-secondary); margin: 0 0 8px; }
  .verify-row, .master-row {
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; margin-bottom: 6px; color: var(--text-primary);
  }

  .disk-card { padding: 12px 16px; border-bottom: 1px solid var(--border-color); }
  .disk-header { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 600; }
  .disk-pct { font-size: 24px; font-weight: 500; }
  .disk-used { font-size: 12px; color: var(--text-secondary); margin: 4px 0; }
  .progress-bar { height: 8px; border-radius: 4px; background: var(--border-color); overflow: hidden; margin-top: 6px; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 4px; }

  .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 700px) { .charts-grid { grid-template-columns: 1fr; } }
</style>
