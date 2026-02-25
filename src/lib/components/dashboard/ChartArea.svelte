<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';

  export let title: string = '';
  export let data: Array<{ timestamp: string; [key: string]: number | string }> = [];
  export let metric: string = 'cpu';
  export let height: string = '250px';
  export let loading: boolean = false;

  let canvas: HTMLCanvasElement;
  let chart: any;
  let ChartClass: any;

  function getColor(m: string) {
    switch(m) {
      case 'cpu': return '#4A3BFF';
      case 'memory': return '#00B8D9';
      case 'inbound_count':
      case 'inbound_bytes': return '#36B37E';
      case 'outbound_count':
      case 'outbound_bytes': return '#FF5630';
      default: return '#4A3BFF';
    }
  }

  async function initChart() {
    if (!canvas) return;
    if (!ChartClass) {
      const mod = await import('chart.js');
      mod.Chart.register(...mod.registerables);
      ChartClass = mod.Chart;
    }
    if (chart) { chart.destroy(); chart = null; }

    const c = getColor(metric);
    chart = new ChartClass(canvas, {
      type: 'line',
      data: {
        labels: data.map(d => d.timestamp),
        datasets: [{
          data: data.map(d => d[metric] as number),
          borderColor: c,
          backgroundColor: `${c}22`,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => `${ctx.parsed.y}` } }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#8892A4', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#8892A4', font: { size: 10 } }
          }
        }
      }
    });
  }

  function updateChart() {
    if (!chart) { initChart(); return; }
    const c = getColor(metric);
    chart.data.labels = data.map(d => d.timestamp);
    chart.data.datasets[0].data = data.map(d => d[metric] as number);
    chart.data.datasets[0].borderColor = c;
    chart.data.datasets[0].backgroundColor = `${c}22`;
    chart.update();
  }

  onMount(() => { initChart(); });
  onDestroy(() => { if (chart) chart.destroy(); });

  // When loading finishes and data is ready, render the chart
  $: if (!loading && data && canvas) updateChart();
</script>

<div class="chart-wrapper" style="height: {height}">
  <div class="chart-header">
    <span class="chart-title">{title}</span>
  </div>
  <!-- Always keep canvas in DOM so onMount can bind to it -->
  <div class="canvas-area">
    {#if loading}
      <div class="chart-loading"><span class="loading-spinner"></span></div>
    {/if}
    <canvas bind:this={canvas} style="display: {loading ? 'none' : 'block'}"></canvas>
  </div>
</div>

<style>
  .chart-wrapper {
    background: var(--bg-card);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    padding: 8px;
    display: flex; flex-direction: column;
    min-height: 100px;
    width: 100%;
  }
  .chart-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 4px;
  }
  .chart-title { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
  .canvas-area { flex: 1; min-height: 0; position: relative; }
  canvas { position: absolute; inset: 0; width: 100% !important; height: 100% !important; }
  .chart-loading {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 1;
  }
</style>
