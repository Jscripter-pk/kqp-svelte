<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { fetcher, endpoints } from "$lib/api";
  import Breadcrumb from "$lib/components/common/Breadcrumb.svelte";

  $: nodeId = $page.params.node;

  let processes: any[] = [];
  let loading = true;
  let error = "";

  async function loadData() {
    loading = true;
    error = "";
    try {
      const res = (await fetcher(
        endpoints.dashboard.processList(nodeId),
      )) as any;
      const list = res?.data?.processList ?? [];
      processes = list
        .filter((p: any) => p.data && Object.keys(p.data).length > 0)
        .map((p: any) => (Array.isArray(p.data) ? p.data : []))
        .flat();
    } catch (e) {
      error = String(e);
    }
    loading = false;
  }

  $: nodeId, loadData();
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: "Process" }]} />
<h1 class="page-title">Process</h1>

<div class="card" style="padding: 0; overflow: auto;">
  {#if loading}
    <div style="display:flex;justify-content:center;padding:40px">
      <span class="loading-spinner"></span>
    </div>
  {:else if error}
    <div style="padding:20px;color:var(--error)">Error: {error}</div>
  {:else if processes.length === 0}
    <div style="padding:40px;text-align:center;color:var(--text-muted)">
      No processes found
    </div>
  {:else}
    <table>
      <thead>
        <tr>
          <th style="text-align:right">PID</th>
          <th>NAME</th><th>PARAM</th>
          <th style="text-align:right">CPU</th>
          <th style="text-align:right">MEM</th>
          <th style="text-align:right">PPID</th>
          <th style="text-align:right">COMMAND</th>
        </tr>
      </thead>
      <tbody>
        {#each processes as proc}
          <tr
            class="clickable"
            on:click={() =>
              goto(
                `/dashboard/nodes/${nodeId}/process/${encodeURIComponent(proc.NAME)}`,
              )}
          >
            <td style="text-align:right">{proc.PID}</td>
            <td>{proc.NAME}</td>
            <td>{proc.PARAM}</td>
            <td style="text-align:right">{proc.CPU}</td>
            <td style="text-align:right">{Number(proc.MEM).toLocaleString()}</td
            >
            <td style="text-align:right">{proc.PPID}</td>
            <td style="text-align:right">{proc.COMMAND}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
