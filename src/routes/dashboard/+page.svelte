<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { nodesStore, type INodeItem } from '$lib/stores/nodes';
  import { fetcher, endpoints } from '$lib/api';
  import { t } from '$lib/i18n';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  import ChartArea from '$lib/components/dashboard/ChartArea.svelte';

  let selectedNode: INodeItem | null = null;
  let diskData: any = null;
  let graphData: any[] = [];
  let graphLoading = false;
  let layout = '2x2';

  $: nodes = $nodesStore.nodes;
  $: nodesLoading = $nodesStore.loading;
  $: totalNodes = nodes.length;
  $: onlineNodes = nodes.filter(n => n.online_status).length;

  function processChartData(metrics: any[]) {
    return metrics.map((m: any) => ({
      timestamp: m.hhmmss.toString().replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2'),
      cpu: m.cpu,
      memory: m.memory,
      inbound_bytes: m.inbound_bytes,
      outbound_bytes: m.outbound_bytes,
      inbound_count: m.inbound_count,
      outbound_count: m.outbound_count,
    }));
  }

  async function selectNode(node: INodeItem) {
    selectedNode = node;
    graphLoading = true;
    try {
      const [disk, graph] = await Promise.all([
        fetcher(endpoints.dashboard.diskMetrics(node.id)) as Promise<any>,
        fetcher(endpoints.dashboard.graph(node.id)) as Promise<any>,
      ]);
      diskData = disk?.data ?? null;
      graphData = graph?.data?.metrics ? processChartData(graph.data.metrics) : [];
    } catch {}
    graphLoading = false;
  }

  onMount(() => {
    nodesStore.fetch().then(() => {
      if ($nodesStore.nodes.length > 0) selectNode($nodesStore.nodes[0]);
    });
  });
</script>

<Breadcrumb />
<h1 class="page-title">{$t.dashboard.title}</h1>

<!-- Stats -->
<div class="stats-bar">
  <div class="stat-box total">
    <div class="stat-label">{$t.dashboard.total}</div>
    <div class="stat-divider"></div>
    <div class="stat-value">{totalNodes}</div>
  </div>
  <div class="stat-box online-box">
    <div>
      <span class="chip online">
        <span class="dot online"></span> ON
      </span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-value">{onlineNodes}</div>
  </div>
</div>

<div class="grid-2">
  <!-- Node List -->
  <div>
    <h3 class="section-title">{$t.dashboard.nodes}</h3>
    <div class="card" style="padding: 0; overflow: auto; max-height: calc(100vh - 320px);">
      {#if nodesLoading}
        <div class="center-loading"><span class="loading-spinner"></span></div>
      {:else if nodes.length === 0}
        <div class="empty-msg">{$t.dashboard.noNodesFound}</div>
      {:else}
        <table>
          <thead>
            <tr>
              <th>{$t.dashboard.state}</th>
              <th>{$t.dashboard.id}</th>
              <th>{$t.dashboard.name}</th>
              <th>{$t.dashboard.description}</th>
              <th>{$t.dashboard.emittable}</th>
              <th style="text-align:right">{$t.dashboard.emitCount}</th>
            </tr>
          </thead>
          <tbody>
            {#each nodes as node}
              <tr class="clickable" class:selected-row={selectedNode?.id === node.id}
                  on:click={() => selectNode(node)}>
                <td>
                  <span class="chip {node.online_status ? 'online' : 'offline'}">
                    <span class="dot {node.online_status ? 'online' : 'offline'}"></span>
                    {node.online_status ? $t.dashboard.online : $t.dashboard.offline}
                  </span>
                </td>
                <td>{node.id}</td>
                <td>{node.name}</td>
                <td>{node.desc}</td>
                <td>
                  <span class="chip {node.emittable ? 'yes' : 'no'}">
                    {node.emittable ? $t.dashboard.yes : $t.dashboard.no}
                  </span>
                </td>
                <td style="text-align:right">{node.emit_count.toLocaleString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>

  <!-- Node Info -->
  <div>
    <div class="info-header">
      <h3 class="section-title">{$t.dashboard.info}</h3>
      <div class="layout-toggle">
        <button class:active={layout === '2x2'} on:click={() => layout = '2x2'}>2×2</button>
        <button class:active={layout === '1x4'} on:click={() => layout = '1x4'}>1×4</button>
      </div>
    </div>

    {#if !selectedNode}
      <div class="card empty-msg">{$t.dashboard.selectNode}</div>
    {:else}
      <div class="node-info-grid" class:layout-1x4={layout === '1x4'}>
        <!-- Status panel -->
        <div class="status-panel card">
          <div class="status-header" class:online-bg={selectedNode.online_status} class:offline-bg={!selectedNode.online_status}>
            <span class="chip {selectedNode.online_status ? 'online' : 'offline'}">
              <span class="dot {selectedNode.online_status ? 'online' : 'offline'}"></span>
              {selectedNode.online_status ? $t.dashboard.online : $t.dashboard.offline}
            </span>
            <div class="node-id-name">
              <span class="node-id">{selectedNode.id}</span>
              <span class="separator"></span>
              <span class="node-name-text">{selectedNode.name}</span>
            </div>
            <p class="node-desc">{selectedNode.desc}</p>
          </div>
          <div class="status-details">
            <div class="detail-row">
              <span class="detail-label">{$t.dashboard.emittable}</span>
              <span class="chip {selectedNode.emittable ? 'yes' : 'no'}">{selectedNode.emittable ? $t.dashboard.trueVal : $t.dashboard.falseVal}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{$t.dashboard.emitCount}</span>
              <span>{selectedNode.emit_count.toLocaleString()}</span>
            </div>
            {#if diskData}
              <div class="disk-section">
                <span class="detail-label">{$t.dashboard.disk}</span>
                <div class="disk-usage">{diskData.disk_usage}%</div>
                <div class="disk-info">{diskData.disk_used_size} GB {$t.dashboard.of} {diskData.disk_total_size} GB</div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: {diskData.disk_usage}%"></div>
                  <div class="progress-warning"></div>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid" class:layout-1x4={layout === '1x4'}>
          <ChartArea title="CPU" data={graphData} metric="cpu" height="180px" loading={graphLoading} />
          <ChartArea title="Memory" data={graphData} metric="memory" height="180px" loading={graphLoading} />
          <ChartArea title="Inbound" data={graphData} metric="inbound_count" height="180px" loading={graphLoading} />
          <ChartArea title="Outbound" data={graphData} metric="outbound_count" height="180px" loading={graphLoading} />
        </div>
      </div>

      <!-- Nav Boxes -->
      <div class="nav-boxes">
        <button class="nav-box" on:click={() => goto(`/dashboard/nodes/${selectedNode?.id}/process`)}>
          <span>{$t.dashboard.processList}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <button class="nav-box" on:click={() => goto(`/dashboard/nodes/${selectedNode?.id}/channels-inbound`)}>
          <span>{$t.dashboard.channelInbound}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .stats-bar {
    display: flex; gap: 4px;
    background: #1A2133; border-radius: 12px; padding: 4px;
    width: fit-content; margin-bottom: 24px;
  }

  .stat-box {
    width: 140px; height: 140px; border-radius: 8px;
    padding: 16px 12px;
    display: flex; flex-direction: column;
  }

  .total {
    background: radial-gradient(62% 21% at 50% 100%, #4A3BFF 0%, #202838 100%);
    color: white;
  }

  .online-box { background: #202838; }

  .stat-label { font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.8); }
  .stat-divider {
    height: 1px; margin: 12px 0;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent);
  }
  .stat-value { font-size: 28px; font-weight: 500; text-align: right; color: white; }

  .section-title { font-size: 17px; font-weight: 500; color: var(--text-primary); margin: 0 0 12px; }

  .grid-2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
    align-items: start;
  }

  @media (max-width: 1100px) {
    .grid-2 { grid-template-columns: 1fr; }
  }

  .info-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .info-header .section-title { margin: 0; }

  .layout-toggle {
    display: flex; gap: 4px;
    background: var(--bg-secondary); border-radius: 6px; padding: 2px;
    border: 1px solid var(--border-color);
  }

  .layout-toggle button {
    padding: 3px 10px; border-radius: 4px; border: none;
    background: transparent; color: var(--text-secondary);
    font-size: 12px; font-weight: 500;
  }

  .layout-toggle button.active {
    background: var(--accent); color: white;
  }

  .node-info-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; }
  .node-info-grid.layout-1x4 { grid-template-columns: 1fr; }

  .status-panel { padding: 0; overflow: hidden; }

  .status-header {
    padding: 16px; border-radius: 8px 8px 0 0;
  }

  .online-bg { background: radial-gradient(100% 100% at 0% 100%, #1F6B27 0%, #1D2F20 100%); border-bottom: 1px solid #36573C; }
  .offline-bg { background: radial-gradient(100% 100% at 0% 100%, #6B1F1F 0%, #331B1E 100%); border-bottom: 1px solid #4A2C31; }

  .node-id-name { display: flex; align-items: center; gap: 8px; margin: 10px 0 6px; }
  .node-id { font-size: 19px; font-weight: 500; color: white; }
  .separator { width: 1px; height: 12px; background: rgba(255,255,255,0.3); }
  .node-name-text { color: rgba(255,255,255,0.7); font-size: 13px; }
  .node-desc { color: rgba(255,255,255,0.6); font-size: 12px; margin: 0; }

  .status-details { padding: 12px; }
  .detail-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px; font-size: 13px;
  }
  .detail-label { color: var(--text-secondary); font-weight: 500; }

  .disk-section { margin-top: 12px; }
  .disk-usage { font-size: 24px; font-weight: 500; }
  .disk-info { font-size: 12px; color: var(--text-secondary); margin: 4px 0; }

  .progress-bar {
    position: relative; height: 8px; border-radius: 4px;
    background: var(--border-color); overflow: hidden;
  }
  .progress-fill {
    position: absolute; height: 100%; border-radius: 4px;
    background: var(--accent); transition: width 0.3s;
  }
  .progress-warning {
    position: absolute; right: 0; top: 0;
    width: 10%; height: 100%;
    background: rgba(255,86,48,0.2);
  }

  .charts-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  }
  .charts-grid.layout-1x4 { grid-template-columns: 1fr; }

  .nav-boxes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
  .nav-box {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-radius: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary); font-size: 14px; font-weight: 500;
    cursor: pointer; transition: background 0.15s;
  }
  .nav-box:hover { background: var(--row-hover); }

  .center-loading { display: flex; justify-content: center; padding: 40px; }
  .empty-msg { padding: 40px; text-align: center; color: var(--text-muted); font-size: 14px; }
</style>
