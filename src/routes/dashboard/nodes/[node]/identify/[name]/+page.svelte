<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";
  import { fetcher, endpoints } from "$lib/api";
  import Breadcrumb from "$lib/components/common/Breadcrumb.svelte";

  $: nodeId = $page.params.node;
  $: identName = decodeURIComponent($page.params.name);

  let loading = true;
  let error = "";
  let detail: any = {};
  let keys: string[] = [];
  let specList: any[] = [];
  let script = "";

  async function loadData() {
    loading = true;
    error = "";
    try {
      const res = (await fetcher(
        endpoints.identify.detail(nodeId, identName),
      )) as any;
      detail = res?.data?.item ?? {};
      keys = Array.isArray(detail.keys) ? detail.keys : [];
      specList = detail.related_specs ?? [];
      script = detail.spec_def ?? "";
    } catch (e) {
      error = String(e);
      console.error(e);
    }
    loading = false;
  }

  $: if (nodeId && identName) loadData();

  function navigateToSpec(url: string) {
    const parts = url.split("/");
    const id = parts[parts.length - 1];
    goto(`/dashboard/nodes/${nodeId}/spec/${encodeURIComponent(id)}`);
  }

  // Simple syntax highlighting for definition
  function highlightSyntax(text: string): string {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(#.*)/g, '<span class="hl-comment">$1</span>')
      .replace(/^(\[.*\])/gm, '<span class="hl-section">$1</span>')
      .replace(
        /^(\s*\w[\w_]*)(\s*=\s*)(.*)/gm,
        '<span class="hl-key">$1</span><span class="hl-eq">$2</span><span class="hl-val">$3</span>',
      );
  }

  // Bar chart
  let barCanvas: HTMLCanvasElement;
  let barChart: any;

  const barData = [
    { t: "0H", c: 10 },
    { t: "1H", c: 15 },
    { t: "2H", c: 20 },
    { t: "3H", c: 25 },
    { t: "4H", c: 30 },
    { t: "5H", c: 35 },
    { t: "6H", c: 40 },
    { t: "7H", c: 45 },
    { t: "8H", c: 50 },
    { t: "9H", c: 55 },
    { t: "10H", c: 200 },
    { t: "11H", c: 250 },
    { t: "12H", c: 60 },
    { t: "13H", c: 65 },
    { t: "14H", c: 70 },
    { t: "15H", c: 75 },
    { t: "16H", c: 80 },
    { t: "17H", c: 85 },
    { t: "18H", c: 90 },
    { t: "19H", c: 95 },
    { t: "20H", c: 40 },
    { t: "21H", c: 100 },
    { t: "22H", c: 105 },
    { t: "23H", c: 110 },
    { t: "24H", c: 115 },
  ];

  async function initBarChart() {
    if (!barCanvas) return;
    const mod = await import("chart.js");
    mod.Chart.register(...mod.registerables);

    if (barChart) {
      barChart.destroy();
      barChart = null;
    }

    barChart = new mod.Chart(barCanvas, {
      type: "bar",
      data: {
        labels: barData.map((d) => d.t),
        datasets: [
          {
            data: barData.map((d) => d.c),
            backgroundColor: "#DFEAFF",
            borderColor: "#5E66FF",
            borderWidth: { top: 2, right: 0, bottom: 0, left: 0 },
            borderRadius: 2,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#8892A4", font: { size: 10 } },
            border: { display: false },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.06)" },
            ticks: { color: "#8892A4", font: { size: 10 } },
            border: { display: false },
          },
        },
      },
    });
  }

  onMount(() => {
    // Delay to ensure canvas is in the DOM
    setTimeout(initBarChart, 100);
  });
  onDestroy(() => {
    if (barChart) barChart.destroy();
  });
</script>

<Breadcrumb
  node={nodeId}
  pages={[
    {
      pageName: "Identifier List",
      link: `/dashboard/nodes/${nodeId}/identify`,
    },
    { pageName: detail.name ?? identName },
  ]}
/>

<h1 class="page-title">IDENTIFIER: {detail.name ?? identName}</h1>

<!-- Top: Summary Table -->
<div class="card summary-card">
  {#if loading}
    <div class="center-pad"><span class="loading-spinner"></span></div>
  {:else if error}
    <div class="center-pad error-text">Error Fetching Identifier</div>
  {:else}
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Identifier Name</th>
          <th>Path</th>
          <th>Timestamp</th>
          <th>Ref. SPECs</th>
          <th></th><th></th><th></th><th></th>
          <th>Description</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td></td>
          <td>{detail.name ?? ""}</td>
          <td>{detail.path ?? ""}</td>
          <td>{detail.timestamp ?? ""}</td>
          <td>{detail.ref_specs ?? ""}</td>
          <td></td><td></td><td></td><td></td>
          <td>{detail.desc ?? ""}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  {/if}
</div>

<!-- Bottom: Two-column layout -->
{#if !loading && !error && detail.name}
  <div class="bottom-grid">
    <!-- LEFT (7/12) -->
    <div class="left-col">
      <!-- Key Box -->
      <div class="key-box">
        <div class="key-header">Key</div>
        <div class="key-body">
          {#if keys.length > 0}
            '{keys.join("', '")}'
          {:else}
            No keys
          {/if}
        </div>
      </div>

      <!-- Related SPECs Table -->
      <div class="card specs-table-card">
        <table>
          <thead>
            <tr>
              <th style="text-align:right">No</th>
              <th>Related SPEC</th>
              <th>Ref. Frequency</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#if specList.length === 0}
              <tr><td colspan="4" class="empty-cell">No identities</td></tr>
            {:else}
              {#each specList as spec, i}
                <tr>
                  <td style="text-align:right">{i + 1}</td>
                  <td>
                    <button
                      class="spec-link"
                      on:click={() => navigateToSpec(spec.url)}
                    >
                      {spec.name}
                    </button>
                  </td>
                  <td>{spec.ref_count}</td>
                  <td></td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      <!-- Bar Chart -->
      <div class="chart-card">
        <div class="chart-label">Today Count</div>
        <div class="chart-area">
          <canvas bind:this={barCanvas}></canvas>
        </div>
      </div>
    </div>

    <!-- RIGHT (5/12): Identifier Definition -->
    <div class="right-col">
      <div class="def-panel">
        <div class="def-header">Identifier Definition</div>
        <div class="def-body">
          {#if script}
            <pre class="def-code">{@html highlightSyntax(script)}</pre>
          {:else}
            <pre class="def-code muted-text">No definition available</pre>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .summary-card {
    padding: 0;
    overflow: auto;
    margin-bottom: 24px;
  }
  .center-pad {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
  }
  .error-text {
    color: var(--error, #ff5630);
  }
  .muted-text {
    color: var(--text-muted, #667085);
  }
  .empty-cell {
    padding: 20px;
    text-align: center;
    color: var(--text-muted, #667085);
  }

  /* Bottom grid: 7 + 5 columns */
  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  @media (min-width: 900px) {
    .bottom-grid {
      grid-template-columns: 7fr 5fr;
    }
  }

  /* ===== LEFT ===== */
  .left-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Key Box */
  .key-box {
    border-radius: 8px;
    overflow: hidden;
  }
  .key-header {
    background: #e0e4eb;
    padding: 4px 12px;
    font-size: 13px;
    color: #374151;
    border-radius: 8px 8px 0 0;
  }
  .key-body {
    background: #5e66ff;
    padding: 12px 16px;
    font-size: 14px;
    color: white;
    border-radius: 0 0 8px 8px;
  }

  /* Specs table */
  .specs-table-card {
    padding: 0;
    overflow: auto;
  }

  .spec-link {
    background: none;
    border: none;
    padding: 0;
    color: #5e66ff;
    text-decoration: underline;
    cursor: pointer;
    font-size: 13px;
  }
  .spec-link:hover {
    color: #7b82ff;
  }

  /* Bar Chart */
  .chart-card {
    background: #202838;
    border-radius: 8px;
    border: 1px solid var(--border-color, #2e3649);
    height: 264px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .chart-label {
    font-size: 15px;
    color: #d1d6e0;
    padding: 8px 12px 0;
  }
  .chart-area {
    flex: 1;
    min-height: 0;
    position: relative;
    padding: 0 4px 4px;
  }
  .chart-area canvas {
    position: absolute;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
  }

  /* ===== RIGHT: Definition ===== */
  .def-panel {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-color, #2e3649);
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .def-header {
    background: #667085;
    padding: 10px 16px;
    font-weight: 600;
    font-size: 14px;
    color: #d1d6e0;
    border-radius: 8px 8px 0 0;
    flex-shrink: 0;
  }
  .def-body {
    background: #202838;
    flex: 1;
    overflow-y: auto;
  }
  .def-code {
    margin: 0;
    padding: 16px;
    font-family: "Fira Code", "Consolas", "Monaco", monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #afb7c8;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  /* Syntax highlighting */
  .def-code :global(.hl-comment) {
    color: #6a737d;
    font-style: italic;
  }
  .def-code :global(.hl-section) {
    color: #79b8ff;
    font-weight: 600;
  }
  .def-code :global(.hl-key) {
    color: #b392f0;
  }
  .def-code :global(.hl-eq) {
    color: #6a737d;
  }
  .def-code :global(.hl-val) {
    color: #9ecbff;
  }
</style>
