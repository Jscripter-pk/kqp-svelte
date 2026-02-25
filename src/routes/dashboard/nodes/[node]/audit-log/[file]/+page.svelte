<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fetcher, endpoints } from '$lib/api';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import { t } from '$lib/i18n';

  $: nodeId = $page.params.node;
  $: file = $page.params.file;

  let loading = true;
  let frameList: any[] = [];
  let maxFrame: number = 0;
  let desc: string = '';
  let fileSize: number = 0;
  let fileDate: string = '';
  let pagination = { current_page: 1, has_next_page: false, has_previous_page: false, total_pages: 1 };
  let pageNum = 1;
  let limit = 40;
  let offset = 0;
  let frameSeqInput = '';

  async function loadData() {
    loading = true;
    try {
      const res = await fetcher(endpoints.nodes.auditLog.frameList(nodeId), {
        params: { file, page: pageNum, limit, 'last-offset': offset, sort: 'desc' }
      }) as any;
      const d = res?.data;
      frameList = d?.frame_list ?? [];
      maxFrame = d?.max_frame ?? 0;
      desc = d?.desc ?? '';
      fileSize = d?.file_size ?? 0;
      fileDate = d?.date?.toString() ?? '';
      pagination = res?.meta ?? pagination;
    } catch (e) {
      console.error('Failed to load frame list:', e);
    }
    loading = false;
  }

  $: if (nodeId && file) { pageNum = 1; offset = 0; loadData(); }

  function handlePageChange(newPage: number) {
    pageNum = newPage + 1;
    if (newPage === 0) {
      offset = 0;
    } else {
      offset = maxFrame;
    }
    loadData();
  }

  function handleRowsPerPageChange(rows: number) {
    limit = rows;
    pageNum = 1;
    offset = 0;
    loadData();
  }

  function handleFrameClick(seq: number, head: string) {
    goto(`/dashboard/nodes/${nodeId}/audit-log/${file}/${seq}:${head}`);
  }

  function handleFrameSeqKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && frameSeqInput.trim()) {
      goto(`/dashboard/nodes/${nodeId}/audit-log/${file}/${frameSeqInput.trim()}`);
    }
  }

  function handleRefreshMaxFrame() {
    offset = 0;
    pageNum = 1;
    loadData();
  }

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
  { pageName: file }
]} />
<h1 class="page-title">{file}</h1>

{#if loading}
  <div class="loading-box"><span class="loading-spinner"></span></div>
{:else}
  <div class="frame-layout">
    <!-- Left: Frame List Table -->
    <div class="frame-table-section">
      <div class="card" style="padding: 12px;">
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          hasNextPage={pagination.has_next_page}
          hasPreviousPage={pagination.has_previous_page}
          rowsPerPage={limit}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th style="text-align:right">{$t.auditLog.frameSeq}</th>
                <th style="text-align:right">{$t.auditLog.head}</th>
                <th style="text-align:right">{$t.auditLog.rid}</th>
                <th style="text-align:right">{$t.common.size}</th>
              </tr>
            </thead>
            <tbody>
              {#if frameList.length === 0}
                <tr><td colspan="4" class="empty-cell">{$t.auditLog.noFrames}</td></tr>
              {:else}
                {#each frameList as frame}
                  <tr class="clickable" on:click={() => handleFrameClick(frame.seq, frame.head)}>
                    <td style="text-align:right">{frame.seq}</td>
                    <td style="text-align:right">{frame.head}</td>
                    <td style="text-align:right">{frame.rid}</td>
                    <td style="text-align:right">{frame.size}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Right: Sidebar Info -->
    <div class="frame-sidebar">
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
          <span class="info-value">{desc || '-'}</span>
        </div>

        <!-- Max Frame Seq -->
        <div class="info-box">
          <div class="info-box-header">
            <span class="info-label">{$t.auditLog.maxFrameSeq}</span>
            <button class="refresh-icon-btn" on:click={handleRefreshMaxFrame} title="Refresh">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.798 7.001C1.798 4.132 4.138 1.801 7.03 1.801C8.995 1.801 10.706 2.877 11.601 4.468H9.533C9.238 4.468 9 4.707 9 5.001C9 5.296 9.238 5.534 9.533 5.534H12.866C13.161 5.534 13.4 5.296 13.4 5.001V1.668C13.4 1.373 13.161 1.134 12.866 1.134C12.572 1.134 12.333 1.373 12.333 1.668V3.618C11.213 1.883 9.256 0.734 7.03 0.734C3.554 0.734 0.731 3.537 0.731 7.001C0.731 10.465 3.554 13.268 7.03 13.268C10.186 13.268 12.802 10.958 13.259 7.941C13.303 7.65 13.103 7.378 12.811 7.334C12.52 7.29 12.248 7.49 12.204 7.781C11.826 10.281 9.655 12.201 7.03 12.201C4.138 12.201 1.798 9.87 1.798 7.001Z" fill="#D1D6E0"/></svg>
            </button>
          </div>
          <span class="info-value">{maxFrame}</span>
        </div>

        <!-- File Size -->
        <div class="info-box">
          <span class="info-label">{$t.auditLog.fileSize}</span>
          <span class="info-value">{fileSize.toLocaleString()}</span>
        </div>

        <!-- Date -->
        <div class="info-box">
          <span class="info-label">{$t.auditLog.date}</span>
          <span class="info-value">{formatDate(fileDate)}</span>
        </div>

        <!-- Frame Seq Navigator -->
        <div class="frame-nav-panel">
          <span class="sidebar-section-title" style="margin-bottom:8px">{$t.auditLog.auditLogFrameDetail}</span>
          <div class="frame-seq-input-group">
            <label class="field-label">{$t.auditLog.frameSeq}</label>
            <input
              type="number"
              class="frame-seq-input"
              bind:value={frameSeqInput}
              on:keydown={handleFrameSeqKeydown}
              placeholder={$t.auditLog.enterSeq}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .loading-box { display: flex; justify-content: center; padding: 60px; }

  .frame-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (min-width: 1200px) {
    .frame-layout { grid-template-columns: 2.5fr 1fr; }
  }

  .frame-table-section { min-width: 0; }
  .table-scroll { overflow: auto; max-height: 660px; }
  .empty-cell { text-align: center; padding: 40px; color: var(--text-muted); }

  /* Sidebar */
  .frame-sidebar { min-width: 0; }
  .sidebar-card {
    background: #0A0E15;
    border-radius: 12px;
    padding: 12px;
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
    color: #D1D6E0; font-size: 15px;
    padding: 0 8px; margin-bottom: 8px;
  }

  .info-box {
    background: #373F4E; border-radius: 8px;
    padding: 8px; margin: 0 0 8px;
    display: flex; flex-direction: column; gap: 2px;
  }
  .info-box-header {
    display: flex; justify-content: space-between; align-items: center;
  }
  .info-label { color: #D1D6E0; font-size: 15px; }
  .info-value { color: #FFFFFF; font-size: 17px; font-weight: 500; }

  .refresh-icon-btn {
    background: #4E576A; border: none; border-radius: 4px;
    width: 24px; height: 24px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  }
  .refresh-icon-btn:hover { background: #667085; }

  /* Frame Navigator Panel */
  .frame-nav-panel {
    background: linear-gradient(180deg, #202838 80%, #373F4E 100%);
    border-radius: 12px;
    padding: 12px; margin-top: 8px;
    display: flex; flex-direction: column;
    min-height: 120px;
  }
  .frame-seq-input-group {
    display: flex; flex-direction: column; gap: 4px;
  }
  .field-label { color: #D1D6E0; font-size: 14px; }
  .frame-seq-input {
    background: #161C25; border: 1px solid #4E576A;
    border-radius: 6px; padding: 8px 12px;
    color: #F0F1F5; font-size: 15px; outline: none;
    width: 100%;
  }
  .frame-seq-input:focus { border-color: #5E66FF; }
  .frame-seq-input::placeholder { color: #667085; }
</style>
