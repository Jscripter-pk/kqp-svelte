<script lang="ts">
  import { page } from "$app/stores";
  import { fetcher, endpoints } from "$lib/api";
  import Breadcrumb from "$lib/components/common/Breadcrumb.svelte";
  import { t } from "$lib/i18n";

  $: nodeId = $page.params.node;

  let loading = true;
  let serviceSummary: any = null;
  let traffics: any = { inbound: [], outbound: [] };

  async function loadData(id: string) {
    if (!id) return;
    loading = true;
    try {
      const res = (await fetcher(endpoints.dashboard.serviceStatus(id))) as any;
      const status = res?.data?.service_status;

      serviceSummary = status?.summary ?? null;
      traffics = status?.traffics ?? { inbound: [], outbound: [] };
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  $: if (nodeId) loadData(nodeId);

  $: table1Data = serviceSummary
    ? [
        { label: $t.status.process, data: serviceSummary.process },
        { label: $t.status.queue, data: serviceSummary.queue },
        { label: $t.status.chInbound, data: serviceSummary.recv_channel },
        { label: $t.status.chOutbound, data: serviceSummary.send_channel },
      ]
    : [];
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: $t.status.title }]} />

<div class="header-row">
  <h1 class="page-title">{$t.status.title}</h1>
  <button class="refresh-btn" on:click={() => loadData(nodeId)}
    >{$t.status.refresh}</button
  >
</div>

{#if loading}
  <div class="loading-box"><span class="loading-spinner"></span></div>
{:else if !serviceSummary}
  <div class="card empty-msg">{$t.status.noData}</div>
{:else}
  <div class="status-grid">
    <div class="card full-width">
      <h3 class="section-title">{$t.status.serviceSummary}</h3>
      <table>
        <thead>
          <tr>
            <th>{$t.status.item}</th>
            <th class="text-right">{$t.status.max}</th>
            <th class="text-right">{$t.status.cur}</th>
            <th class="text-right">{$t.status.odd}</th>
            <th class="text-right">{$t.status.title}</th>
          </tr>
        </thead>
        <tbody>
          {#each table1Data as row}
            <tr>
              <td>{row.label}</td>
              <td class="text-right">{row.data?.max ?? "-"}</td>
              <td class="text-right">{row.data?.cur ?? "-"}</td>
              <td class="text-right">{row.data?.odd > 0 ? row.data.odd : ""}</td
              >
              <td class="text-right">
                {#if row.data?.odd > 0 || row.data?.note}
                  <span class="chip no"
                    >{row.data?.note || $t.status.abnormal}</span
                  >
                {:else}{/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3 class="section-title">{$t.status.inboundTraffic}</h3>
      <table>
        <thead>
          <tr>
            <th>{$t.status.time}</th>
            <th>{$t.status.channel}</th>
            <th class="text-right">{$t.status.count}</th>
          </tr>
        </thead>
        <tbody>
          {#each traffics.inbound as row}
            <tr>
              <td>{row.time}</td>
              <td>{row.channel}</td>
              <td class="text-right">{row.count}</td>
            </tr>
          {:else}
            <tr
              ><td colspan="3" class="empty-cell">{$t.status.noInbound}</td></tr
            >
          {/each}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3 class="section-title">{$t.status.outboundTraffic}</h3>
      <table>
        <thead>
          <tr>
            <th>{$t.status.time}</th>
            <th>{$t.status.channel}</th>
            <th class="text-right">{$t.status.count}</th>
          </tr>
        </thead>
        <tbody>
          {#each traffics.outbound as row}
            <tr>
              <td>{row.time}</td>
              <td>{row.channel}</td>
              <td class="text-right">{row.count}</td>
            </tr>
          {:else}
            <tr
              ><td colspan="3" class="empty-cell">{$t.status.noOutbound}</td
              ></tr
            >
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

<style>
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .page-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }

  .refresh-btn {
    background: #f0f2f5;
    border: 1px solid #dcdfe6;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  }

  .status-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .full-width {
    grid-column: span 2;
  }
  @media (max-width: 768px) {
    .status-grid {
      grid-template-columns: 1fr;
    }
    .full-width {
      grid-column: span 1;
    }
  }

  .card {
    border-radius: 8px;
    padding: 16px;
  }
  .empty-msg {
    padding: 40px;
    text-align: center;
    color: #999;
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  th {
    text-align: left;
    padding: 10px 8px;
    color: #666;
    font-weight: 500;
  }
  td {
    padding: 10px 8px;
  }

  .text-right {
    text-align: right;
  }
  .empty-cell {
    text-align: center;
    padding: 20px;
    color: #999;
  }

  .chip {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
  }
  .chip.yes {
    background: #e6f4ea;
    color: #1e7e34;
  }
  .chip.no {
    background: #fff2f4;
    color: #d32f2f;
    border: 1px solid #ffd8d8;
  }

  .loading-box {
    display: flex;
    justify-content: center;
    padding: 60px;
  }
  .loading-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #1d2654;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
