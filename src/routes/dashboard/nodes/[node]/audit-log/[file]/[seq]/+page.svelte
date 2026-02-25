<script lang="ts">
  import { page } from '$app/stores';
  import { fetcher, endpoints } from '$lib/api';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  import { t } from '$lib/i18n';

  $: nodeId = $page.params.node;
  $: file = $page.params.file;
  $: seqParam = $page.params.seq;

  // Parse "seq:head" from URL param
  $: parsedSeq = seqParam?.split(':')[0] ?? '';
  $: parsedHead = decodeURIComponent(seqParam?.split(':')[1] ?? '');

  let loading = true;
  let frameData: any = null;
  let frags: any[] = [];
  let currentSeq: number = 0;
  let maxFrame: number = 0;

  async function loadFrame(seq: number | string) {
    loading = true;
    try {
      const params: Record<string, string | number> = { file, seq: Number(seq) };
      const res = await fetcher(endpoints.nodes.auditLog.frame(nodeId), { params }) as any;
      const d = res?.data;
      frameData = d ? { desc: d.desc, ...d.spec } : null;
      frags = frameData?.frags ?? [];
      currentSeq = frameData?.seq ?? Number(seq);
      maxFrame = frameData?.max_frame ?? 0;
    } catch (e) {
      console.error('Failed to load frame:', e);
      frameData = null;
      frags = [];
    }
    loading = false;
  }

  $: if (nodeId && file && parsedSeq) loadFrame(parsedSeq);

  function goToSeq(seq: number) {
    currentSeq = seq;
    loadFrame(seq);
  }

  function onFirst() { goToSeq(1); }
  function onPrev() { if (currentSeq > 1) goToSeq(currentSeq - 1); }
  function onNext() { goToSeq(currentSeq + 1); }
  function onLast() { goToSeq(0); }

  function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    if (/^\d{8}$/.test(dateStr)) {
      return `${dateStr.substring(0, 4)}/${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`;
    }
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
      }
    } catch { /* ignore */ }
    return dateStr;
  }
</script>

<Breadcrumb node={nodeId} pages={[
  { pageName: $t.auditLog.title, link: `/dashboard/nodes/${nodeId}/audit-log` },
  { pageName: file, link: `/dashboard/nodes/${nodeId}/audit-log/${file}` },
  { pageName: parsedHead || `${$t.auditLog.seq} ${parsedSeq}` }
]} />
<h1 class="page-title">{parsedHead || `${$t.auditLog.frameTitle}${parsedSeq}`}</h1>

{#if loading}
  <div class="loading-box"><span class="loading-spinner"></span></div>
{:else if !frameData}
  <div class="card" style="padding:40px;text-align:center;color:var(--text-muted)">{$t.auditLog.noFrameData}</div>
{:else}
  <div class="detail-layout">
    <!-- Left: Frame Content -->
    <div class="detail-content">
      {#if frags && frags.length > 0}
        <!-- Navigation -->
        <div class="nav-bar">
          <button class="nav-btn" on:click={onFirst} disabled={currentSeq === 1} title="First">⟨⟨</button>
          <button class="nav-btn" on:click={onPrev} disabled={currentSeq === 1} title="Previous">⟨</button>
          <span class="nav-seq">{$t.auditLog.seq}: {currentSeq}</span>
          <button class="nav-btn" on:click={onNext} disabled={currentSeq === 0 || currentSeq === maxFrame} title="Next">⟩</button>
          <button class="nav-btn" on:click={onLast} title="Last">⟩⟩</button>
          <span class="nav-total">/ {maxFrame}</span>
        </div>

        <!-- Frags Table -->
        <div class="card" style="padding:0;overflow:auto;">
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style="text-align:right">{$t.auditLog.id}</th>
                  <th style="text-align:right">{$t.auditLog.len}</th>
                  <th style="text-align:right">
                    {$t.auditLog.data}
                    <span class="data-star">*</span>
                    <div class="data-underline"></div>
                  </th>
                  <th>{$t.common.description}</th>
                </tr>
              </thead>
              <tbody>
                {#each frags as frag}
                  <tr>
                    <td style="text-align:right">
                      <span class="badge badge-green">{frag.id}</span>
                    </td>
                    <td style="text-align:right">
                      <span class="badge badge-blue">{frag.len}</span>
                    </td>
                    <td style="text-align:right">
                      <span class="badge badge-yellow">{frag.data}</span>
                    </td>
                    <td>{frag.desc || '-'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {:else}
        <!-- Raw data display (no frags, show spec data) -->
        <div class="raw-data-section">
          <div class="raw-data-header">{$t.auditLog.dataDef}</div>
          <div class="raw-data-content">
            <pre>{frameData?.data || $t.auditLog.noDataAvailable}</pre>
          </div>
        </div>
      {/if}
    </div>

    <!-- Right: Sidebar Info -->
    <div class="detail-sidebar">
      <div class="sidebar-card">
        <!-- Filename -->
        <div class="sidebar-header">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.607 3.32C8.788 3.32 8.961 3.393 9.087 3.522L10.279 4.749H16.832C17.661 4.749 18.332 5.42 18.332 6.249V15.166C18.332 15.994 17.661 16.666 16.832 16.666H3.164C2.336 16.666 1.664 15.994 1.664 15.166L1.663 4.831C1.663 4.003 2.333 3.332 3.16 3.331L8.607 3.32Z" fill="#E0E4EB"/>
          </svg>
          <span class="sidebar-label">{$t.auditLog.filename}</span>
        </div>
        <div class="sidebar-value-large">{file}</div>

        <div class="fading-divider"></div>

        <div class="sidebar-section-title">{$t.auditLog.auditLogList}</div>

        <!-- Desc -->
        <div class="info-box">
          <span class="info-label">{$t.auditLog.desc}</span>
          <span class="info-value">{frameData?.desc || '-'}</span>
        </div>

        <!-- Max Frame Seq -->
        <div class="info-box">
          <div class="info-box-header">
            <span class="info-label">{$t.auditLog.maxFrameSeq}</span>
            <button class="refresh-icon-btn" on:click={onLast} title="Refresh">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.798 7.001C1.798 4.132 4.138 1.801 7.03 1.801C8.995 1.801 10.706 2.877 11.601 4.468H9.533C9.238 4.468 9 4.707 9 5.001C9 5.296 9.238 5.534 9.533 5.534H12.866C13.161 5.534 13.4 5.296 13.4 5.001V1.668C13.4 1.373 13.161 1.134 12.866 1.134C12.572 1.134 12.333 1.373 12.333 1.668V3.618C11.213 1.883 9.256 0.734 7.03 0.734C3.554 0.734 0.731 3.537 0.731 7.001C0.731 10.465 3.554 13.268 7.03 13.268C10.186 13.268 12.802 10.958 13.259 7.941C13.303 7.65 13.103 7.378 12.811 7.334C12.52 7.29 12.248 7.49 12.204 7.781C11.826 10.281 9.655 12.201 7.03 12.201C4.138 12.201 1.798 9.87 1.798 7.001Z" fill="#D1D6E0"/></svg>
            </button>
          </div>
          <span class="info-value">{frameData?.max_frame ?? maxFrame}</span>
        </div>

        <!-- File Size -->
        <div class="info-box">
          <span class="info-label">{$t.common.size}</span>
          <span class="info-value">{frameData?.file_size?.toLocaleString() ?? '-'}</span>
        </div>

        <!-- Date -->
        <div class="info-box">
          <span class="info-label">{$t.auditLog.date}</span>
          <span class="info-value">{formatDate(frameData?.date?.toString() ?? '')}</span>
        </div>

        <!-- Frame Detail Panel -->
        <div class="frame-detail-panel">
          <span class="sidebar-section-title" style="padding:0;margin-bottom:8px">{$t.auditLog.auditLogFrameDetail}</span>

          <!-- Seq (highlighted) -->
          <div class="info-box info-box-primary">
            <span class="info-label">{$t.auditLog.seq}</span>
            <span class="info-value">{frameData?.seq ?? currentSeq}</span>
          </div>

          <!-- Time -->
          <div class="info-box">
            <span class="info-label">{$t.auditLog.time}</span>
            <span class="info-value">
              {frameData?.time ?? '-'}
              {#if frameData?.time_ms}
                &nbsp;{frameData.time_ms}<span class="unit">ms</span>
              {/if}
              {#if frameData?.time_us}
                &nbsp;{frameData.time_us}<span class="unit">us</span>
              {/if}
            </span>
          </div>

          <!-- Size -->
          <div class="info-box">
            <span class="info-label">{$t.common.size}</span>
            <span class="info-value">{frameData?.size ?? '-'}</span>
          </div>

          <!-- Head & RID -->
          <div class="info-row">
            <div class="info-box info-box-half">
              <span class="info-label">{$t.auditLog.head}</span>
              <span class="info-value">{frameData?.head ?? '-'}</span>
            </div>
            <div class="info-box info-box-half">
              <span class="info-label">{$t.auditLog.rid}</span>
              <span class="info-value">{frameData?.rid ?? '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .loading-box { display: flex; justify-content: center; padding: 60px; }

  .detail-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (min-width: 1200px) {
    .detail-layout { grid-template-columns: 3fr 1fr; }
  }

  .detail-content { min-width: 0; }
  .detail-sidebar { min-width: 0; }

  /* Navigation bar */
  .nav-bar {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 12px; padding: 8px 0;
  }
  .nav-btn {
    background: var(--bg-card); border: 1px solid var(--border-color);
    border-radius: 4px; padding: 4px 10px;
    color: var(--text-primary); font-size: 14px; cursor: pointer;
  }
  .nav-btn:disabled { opacity: 0.4; cursor: default; }
  .nav-btn:not(:disabled):hover { background: var(--row-hover); }
  .nav-seq { color: var(--text-primary); font-size: 15px; font-weight: 600; }
  .nav-total { color: var(--text-secondary); font-size: 14px; }

  /* Table */
  .table-scroll { overflow: auto; max-height: calc(100vh - 300px); }

  /* Badges */
  .badge {
    display: inline-block; padding: 1px 6px;
    border-radius: 4px; font-size: 13px; font-family: monospace;
  }
  .badge-green { background: #1D2F20; border: 1px solid #36573C; color: #7EE081; }
  .badge-blue { background: #1D2654; border: 1px solid #212447; color: #7AA2FF; }
  .badge-yellow { background: #31291D; border: 1px solid #49381F; color: #FFC711; }

  .data-star { font-size: 22px; margin-left: 4px; color: #FFC711; }
  .data-underline {
    width: 40px; height: 4px; background: #FFC711;
    border-radius: 2px 2px 0 0; margin-left: auto; margin-top: 6px;
  }

  /* Raw data display */
  .raw-data-section { border-radius: 8px; overflow: hidden; }
  .raw-data-header {
    background: #667085; padding: 12px;
    color: #D1D6E0; font-weight: 600;
    border-radius: 4px 4px 0 0;
  }
  .raw-data-content {
    background: #202838;
    max-height: calc(100vh - 244px); overflow: auto;
    padding: 12px;
  }
  .raw-data-content pre {
    white-space: pre-wrap; word-break: break-all;
    font-family: monospace; font-size: 13px; color: #AFB7C8;
    margin: 0;
  }

  /* Sidebar */
  .sidebar-card {
    background: #0A0E15; border-radius: 12px; padding: 12px;
  }
  .sidebar-header {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 8px 0;
  }
  .sidebar-label { color: #D1D6E0; font-size: 15px; }
  .sidebar-value-large {
    color: #FFFFFF; font-size: 20px; font-weight: 500;
    padding: 4px 8px 8px;
  }
  .fading-divider {
    height: 1px; margin: 12px 0;
    background: linear-gradient(to right, transparent 0%, #667085 50%, transparent 100%);
  }
  .sidebar-section-title {
    color: #D1D6E0; font-size: 15px; padding: 0 8px; margin-bottom: 8px;
  }

  .info-box {
    background: #373F4E; border-radius: 8px;
    padding: 8px; margin: 0 0 8px;
    display: flex; flex-direction: column; gap: 2px;
  }
  .info-box-primary { background: #5E66FF; }
  .info-box-header {
    display: flex; justify-content: space-between; align-items: center;
  }
  .info-label { color: #D1D6E0; font-size: 15px; }
  .info-box-primary .info-label { color: #D1D6E0; }
  .info-value { color: #FFFFFF; font-size: 17px; font-weight: 500; }
  .unit { font-size: 12px; color: #FFFFFF; }

  .info-row { display: flex; gap: 8px; }
  .info-box-half { flex: 1; }

  .refresh-icon-btn {
    background: #4E576A; border: none; border-radius: 4px;
    width: 24px; height: 24px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  }
  .refresh-icon-btn:hover { background: #667085; }

  /* Frame Detail Panel */
  .frame-detail-panel {
    background: linear-gradient(180deg, #202838 80%, #373F4E 100%);
    border-radius: 12px; padding: 12px; margin-top: 8px;
    max-height: calc(100vh - 610px); overflow-y: auto;
  }
</style>
