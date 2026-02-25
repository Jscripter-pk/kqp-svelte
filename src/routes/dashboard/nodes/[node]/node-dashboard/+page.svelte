<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { fetcher, endpoints } from "$lib/api";
  import { nodesStore } from "$lib/stores/nodes";
  import Breadcrumb from "$lib/components/common/Breadcrumb.svelte";
  import ChartArea from "$lib/components/dashboard/ChartArea.svelte";

  $: nodeId = $page.params.node;

  // Node info from store
  let nodeInfo: any = null;

  // API data
  let serviceStatus: any = null;
  let diskData: any = null;
  let graphData: any[] = [];
  let loading = true;

  // Inbound/Outbound tab state
  let inboundMetric: "inbound_count" | "inbound_bytes" = "inbound_count";
  let outboundMetric: "outbound_count" | "outbound_bytes" = "outbound_count";

  function processChartData(metrics: any[]) {
    return metrics.map((m: any) => ({
      timestamp: String(m.hhmmss).replace(/(\d{2})(\d{2})(\d{2})/, "$1:$2"),
      cpu: m.cpu,
      memory: m.memory,
      inbound_bytes: m.inbound_bytes,
      outbound_bytes: m.outbound_bytes,
      inbound_count: m.inbound_count,
      outbound_count: m.outbound_count,
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
      serviceStatus = s?.data?.service_status ?? null;
      diskData = d?.data ?? null;
      graphData = g?.data?.metrics ? processChartData(g.data.metrics) : [];
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  // Find node info from the store
  function findNodeInfo(nodes: any[], id: string) {
    return nodes.find((n: any) => n.id === id) ?? null;
  }

  $: nodeId, loadData();

  // Ensure nodes are fetched, then find info
  onMount(async () => {
    await nodesStore.fetch();
  });

  $: nodeInfo = findNodeInfo($nodesStore.nodes, nodeId);

  $: isOnline = serviceStatus?.okay ?? false;
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: "Node Dashboard" }]} />
<h1 class="page-title">Node Dashboard</h1>

{#if loading}
  <div class="loading-box"><span class="loading-spinner"></span></div>
{:else}
  <div class="nd-grid">
    <!-- LEFT: Status Panel -->
    <div class="nd-left">
      <!-- Online/Offline Header -->
      <div class="status-card">
        <div
          class="status-banner"
          class:banner-online={isOnline}
          class:banner-offline={!isOnline}
        >
          <span
            class="status-chip"
            class:chip-online={isOnline}
            class:chip-offline={!isOnline}
          >
            <span
              class="status-dot"
              class:dot-online={isOnline}
              class:dot-offline={!isOnline}
            ></span>
            {isOnline ? "Online" : "Offline"}
          </span>
          <div class="node-id-row">
            <span class="node-id-text">{nodeId}</span>
            {#if nodeInfo?.name}
              <span class="node-sep">|</span>
              <span class="node-name-text">{nodeInfo.name}</span>
            {/if}
          </div>
          {#if nodeInfo?.desc}
            <div class="node-desc">{nodeInfo.desc}</div>
          {/if}
        </div>

        <!-- Emittable & Emit Count -->
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">EMITABLE</span>
            <span
              class="info-badge"
              class:badge-ok={serviceStatus?.emittable || nodeInfo?.emittable}
              class:badge-fail={!(
                serviceStatus?.emittable || nodeInfo?.emittable
              )}
            >
              {serviceStatus?.emittable || nodeInfo?.emittable
                ? "True"
                : "False"}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Emit Count</span>
            <span class="info-value"
              >{(nodeInfo?.emit_count ?? 0).toLocaleString()}</span
            >
          </div>
        </div>

        <!-- Disk Section -->
        {#if diskData}
          <div class="disk-section">
            <div class="disk-label">Disk</div>
            <div class="disk-pct">{diskData.disk_usage}%</div>
            <div class="disk-used">
              <span class="disk-used-bold">{diskData.disk_used_size} GB</span>
              of {diskData.disk_total_size} GB
            </div>
            <div class="progress-track">
              <div
                class="progress-fill"
                style="width: {Math.min(diskData.disk_usage, 90)}%"
              ></div>
              <div class="progress-danger"></div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- RIGHT: Charts -->
    <div class="nd-right">
      <div class="charts-container">
        <div class="charts-grid">
          <!-- CPU -->
          <div class="chart-cell">
            <ChartArea
              title="CPU"
              data={graphData}
              metric="cpu"
              height="100%"
              color="#5E66FF"
            />
          </div>

          <!-- Memory -->
          <div class="chart-cell">
            <ChartArea
              title="Memory"
              data={graphData}
              metric="memory"
              height="100%"
              color="#FFC711"
            />
          </div>

          <!-- Inbound with tabs -->
          <div class="chart-cell">
            <div class="chart-with-tabs">
              <div class="tab-group">
                <button
                  class="tab-btn"
                  class:tab-active={inboundMetric === "inbound_count"}
                  on:click={() => (inboundMetric = "inbound_count")}
                  >count</button
                >
                <button
                  class="tab-btn"
                  class:tab-active={inboundMetric === "inbound_bytes"}
                  on:click={() => (inboundMetric = "inbound_bytes")}
                  >byte</button
                >
              </div>
              <ChartArea
                title="Inbound"
                data={graphData}
                metric={inboundMetric}
                height="100%"
                color="#41B899"
              />
            </div>
          </div>

          <!-- Outbound with tabs -->
          <div class="chart-cell">
            <div class="chart-with-tabs">
              <div class="tab-group">
                <button
                  class="tab-btn"
                  class:tab-active={outboundMetric === "outbound_count"}
                  on:click={() => (outboundMetric = "outbound_count")}
                  >count</button
                >
                <button
                  class="tab-btn"
                  class:tab-active={outboundMetric === "outbound_bytes"}
                  on:click={() => (outboundMetric = "outbound_bytes")}
                  >byte</button
                >
              </div>
              <ChartArea
                title="Outbound"
                data={graphData}
                metric={outboundMetric}
                height="100%"
                color="#059BB8"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .loading-box {
    display: flex;
    justify-content: center;
    padding: 60px;
  }

  /* Main grid: sidebar + charts */
  .nd-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    align-items: start;
  }
  @media (min-width: 900px) {
    .nd-grid {
      grid-template-columns: 280px 1fr;
    }
  }

  /* ===== LEFT: Status Panel ===== */
  .status-card {
    border-radius: 12px;
    overflow: hidden;
  }

  /* Banner */
  .status-banner {
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 12px;
  }
  .banner-online {
    background: radial-gradient(100% 100% at 0% 100%, #1f6b27 0%, #1d2f20 100%);
    border: 1px solid #36573c;
  }
  .banner-offline {
    background: radial-gradient(100% 100% at 0% 100%, #6b1f1f 0%, #331b1e 100%);
    border: 1px solid #4a2c31;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 17px;
    font-weight: 500;
  }
  .chip-online {
    background: #1d2f20;
    border: 1px solid #1d2f20;
    color: #36b37e;
    box-shadow: 2px 2px 8px 0 rgba(27, 240, 27, 0.5);
  }
  .chip-offline {
    background: #331b1e;
    border: 1px solid #331b1e;
    color: #ff5630;
    box-shadow: 2px 2px 8px 0 rgba(240, 27, 62, 0.5);
  }
  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .dot-online {
    background: #36b37e;
  }
  .dot-offline {
    background: #ff5630;
  }

  .node-id-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 12px 0 4px;
  }
  .node-id-text {
    font-size: 19px;
    font-weight: 500;
    color: white;
  }
  .node-sep {
    color: rgba(255, 255, 255, 0.3);
  }
  .node-name-text {
    font-size: 14px;
    color: white;
  }
  .node-desc {
    font-size: 14px;
    color: white;
    margin-top: 4px;
  }

  /* Info section */
  .info-section {
    background: var(--bg-card, #202838);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    min-height: 100px;
  }
  .info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .info-row:last-child {
    margin-bottom: 0;
  }
  .info-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary, #8892a4);
    width: 60%;
  }
  .info-value {
    font-size: 14px;
    color: var(--text-primary, #e0e4eb);
  }
  .info-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid;
  }
  .badge-ok {
    color: #36b37e;
    border-color: #36b37e;
    background: transparent;
  }
  .badge-fail {
    color: #ff5630;
    border-color: #ff5630;
    background: transparent;
  }

  /* Disk section */
  .disk-section {
    background: var(--bg-card, #202838);
    border-radius: 8px;
    padding: 16px;
  }
  .disk-label {
    font-size: 17px;
    font-weight: 500;
    color: #afb7c8;
  }
  .disk-pct {
    font-size: 28px;
    font-weight: 500;
    color: var(--text-primary, #e0e4eb);
  }
  .disk-used {
    font-size: 16px;
    color: #d1d6e0;
    margin-bottom: 8px;
  }
  .disk-used-bold {
    font-weight: 500;
    color: var(--text-primary, #e0e4eb);
  }
  .progress-track {
    position: relative;
    height: 10px;
    border-radius: 5px;
    background: #e0e0e0;
    overflow: hidden;
  }
  .progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: #4a3bff;
    border-radius: 5px;
    transition: width 0.3s ease;
  }
  .progress-danger {
    position: absolute;
    top: 0;
    left: 90%;
    width: 10%;
    height: 100%;
    background: #ffebee;
    border-radius: 0 5px 5px 0;
  }

  /* ===== RIGHT: Charts ===== */
  .charts-container {
    background: var(--bg-card, #202838);
    border-radius: 12px;
    padding: 12px;
    padding-right: 4px;
    min-height: calc(100vh - 187px);
  }
  .charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 900px) {
    .charts-grid {
      grid-template-columns: 1fr;
    }
  }
  .chart-cell {
    height: 300px;
  }
  @media (min-width: 900px) {
    .chart-cell {
      height: calc((100vh - 240px) / 2);
    }
  }

  /* Chart with tabs wrapper */
  .chart-with-tabs {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .chart-with-tabs :global(.chart-wrapper) {
    flex: 1;
    min-height: 0;
  }

  /* Tab group */
  .tab-group {
    position: absolute;
    top: 6px;
    right: 8px;
    display: flex;
    z-index: 2;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--border-color, #2e3649);
  }
  .tab-btn {
    background: var(--bg-card, #202838);
    border: none;
    padding: 2px 10px;
    font-size: 11px;
    color: var(--text-secondary, #8892a4);
    cursor: pointer;
    transition: all 0.15s;
  }
  .tab-btn:not(:last-child) {
    border-right: 1px solid var(--border-color, #2e3649);
  }
  .tab-btn.tab-active {
    background: var(--accent, #4a3bff);
    color: white;
  }
  .tab-btn:hover:not(.tab-active) {
    background: var(--row-hover, rgba(255, 255, 255, 0.04));
  }
</style>
