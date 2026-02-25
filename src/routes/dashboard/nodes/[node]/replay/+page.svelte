<script lang="ts">
  import { page } from '$app/stores';
  import { fetcher, endpoints } from '$lib/api';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';

  $: nodeId = $page.params.node;

  // --- Data Loading ---
  let loading = true;
  let processData: any[] = [];
  let logTypeList: any[] = [];
  let fileTree: any = {};

  async function loadData() {
    loading = true;
    try {
      const res = await fetcher(endpoints.replay.info(nodeId)) as any;
      const d = res?.data;
      processData = Array.isArray(d?.replay_status?.process_list) ? d.replay_status.process_list : [];
      logTypeList = d?.replay_interface?.log_type_list ?? [];
      fileTree = d?.replay_interface?.file_tree ?? {};
    } catch (e) {
      console.error('Failed to load replay info:', e);
    }
    loading = false;
  }

  $: if (nodeId) loadData();

  // --- Form State ---
  let logType = '';
  let file = '';
  let date = '0000-00-00';
  let startTime = '00:00:00';
  let endTime = '00:00:00';
  let head = 'All';
  let channel = 'All';
  let toolPid = '';
  let outboundExpression = '';
  let currentSpeed = '1.0';

  // --- Dialog State ---
  let killDialogOpen = false;
  let replayDialogOpen = false;
  let replaying = false;

  // --- Filter Dialog State ---
  let filterDialogOpen = false;
  let filterTarget: 'HEAD' | 'CHANNEL' | null = null;
  let dialogExpression = '';
  let filterError = '';

  // --- Outbound Input ---
  let outboundInput = '';

  // --- Computed ---
  $: canReplay =
    logType !== '' &&
    file !== '' &&
    date !== '0000-00-00' && date !== '' &&
    startTime !== '00:00:00' && startTime !== '' &&
    endTime !== '00:00:00' && endTime !== '' &&
    head !== '' &&
    channel !== '' &&
    outboundExpression !== '';

  // Reset file/date when logType changes
  $: if (!logType) { date = ''; file = ''; }

  // Derived options for file select
  $: fileOptions = getKeysFromSelectedValue(fileTree, logTypeList, logType);
  $: dateOptions = getDatesFromSelectedValue(fileTree, logTypeList, logType, file);

  // --- Helper functions ---
  function getKeysFromSelectedValue(ft: any, logTree: any[], selectedKey: string): {label: string; key: string}[] {
    const filtered = logTree.filter((item: any) => item.label === selectedKey);
    if (!ft || typeof ft !== 'object' || !filtered[0]?.key || !ft[filtered[0].key]) return [];
    return Object.keys(ft[filtered[0].key]).map((k) => ({ label: k, key: k }));
  }

  function getDatesFromSelectedValue(ft: any, logTree: any[], selectedKey: string, selectedFile: string): {label: string; key: string}[] {
    const filtered = logTree.filter((item: any) => item.label === selectedKey);
    const ftKey = filtered[0]?.key;
    if (!ft || !ftKey || !ft[ftKey] || !ft[ftKey][selectedFile]) return [];
    return ft[ftKey][selectedFile].map((ds: string) => {
      const formatted = `${ds.substring(0, 4)}-${ds.substring(4, 6)}-${ds.substring(6, 8)}`;
      return { label: formatted, key: formatted };
    });
  }

  // --- Filter Dialog Handlers ---
  function handleOpenFilterDialog(target: 'HEAD' | 'CHANNEL') {
    if (filterDialogOpen && filterTarget === target) {
      handleCloseFilterDialog();
      return;
    }
    filterTarget = target;
    filterDialogOpen = true;
    filterError = '';
    const savedValue = target === 'HEAD' ? head : channel;
    dialogExpression = savedValue === 'All' ? '' : savedValue;
  }

  function handleCloseFilterDialog() {
    filterDialogOpen = false;
    filterTarget = null;
    filterError = '';
  }

  function handleFilterConfirm() {
    const trimmed = dialogExpression.trim();
    const finalValue = !trimmed ? 'All' : trimmed;
    if (filterTarget === 'HEAD') head = finalValue;
    else if (filterTarget === 'CHANNEL') channel = finalValue;
    filterError = '';
    handleCloseFilterDialog();
  }

  function handleFilterReset() {
    dialogExpression = '';
    filterError = '';
    if (filterTarget === 'HEAD') head = 'All';
    else if (filterTarget === 'CHANNEL') channel = 'All';
  }

  // --- Speed Controls ---
  const STEP_VALUE = 0.25;
  function handleSpeedInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) currentSpeed = val;
  }
  function incrementSpeed() {
    const v = parseFloat(currentSpeed) || 0;
    currentSpeed = (v + STEP_VALUE).toFixed(2).replace(/\.00$/, '');
  }
  function decrementSpeed() {
    const v = parseFloat(currentSpeed) || 0;
    currentSpeed = Math.max(0.1, v - STEP_VALUE).toFixed(2).replace(/\.00$/, '');
  }

  // --- Kill Process ---
  let isTerminating = false;
  async function handleTerminate() {
    isTerminating = true;
    try {
      await fetcher(endpoints.replay.terminate(nodeId), {
        method: 'DELETE',
        body: { pid: toolPid },
      });
      killDialogOpen = false;
      toolPid = '';
      loadData();
    } catch (e) {
      console.error('Termination failed:', e);
      alert('Failed to terminate process. Please try again.');
    } finally {
      isTerminating = false;
    }
  }

  // --- Replay ---
  async function handleReplayConfirm() {
    replaying = true;
    try {
      const params: Record<string, string> = {
        name: file,
        date: date.replaceAll('-', ''),
        start_hhmmss: startTime.replaceAll(':', ''),
        end_hhmmss: endTime.replaceAll(':', ''),
        throw_to: outboundExpression,
        head,
        speed: currentSpeed,
      };
      await fetcher(endpoints.replay.start(nodeId), { params });
      replayDialogOpen = false;
    } catch (e) {
      console.error('Replay request failed:', e);
    } finally {
      loadData();
      logType = '';
      date = '0000-00-00';
      startTime = '00:00:00';
      endTime = '00:00:00';
      outboundExpression = '';
      outboundInput = '';
      file = '';
      replaying = false;
    }
  }

  // Audit log collapsed state (for mobile/responsive view)
  let auditCollapsed = false;
</script>

<Breadcrumb node={nodeId} pages={[{ pageName: 'Replay' }]} />
<h1 class="page-title">Replay</h1>

{#if loading}
  <div class="loading-box"><span class="loading-spinner"></span></div>
{:else}
  <!-- Top section: Process Table + Tool Box -->
  <div class="top-grid">
    <!-- Process Table -->
    <div class="process-table-container">
      <div class="table-wrapper">
        <table class="dark-table">
          <thead>
            <tr>
              <th></th>
              <th>PID</th>
              <th>Command</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#if processData.length === 0}
              <tr><td colspan="4" class="empty-cell">No Processes Found</td></tr>
            {:else}
              {#each processData as row, index}
                <tr
                  class="process-row"
                  class:row-even={index % 2 === 0}
                  class:row-odd={index % 2 !== 0}
                  on:click={() => (toolPid = row.pid)}
                >
                  <td>
                    <span class="chip play-chip">
                      <span class="dot-green"></span>
                      Play
                    </span>
                  </td>
                  <td class="text-muted-cell">{row.pid}</td>
                  <td class="text-muted-cell command-cell">{row.command}</td>
                  <td></td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tool Box -->
    <div class="tool-box">
      <div class="tool-header">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.293 2.707a1 1 0 0 0-1.414 0L8.5 6.086 6.914 4.5l3.379-3.379a1 1 0 0 0-1.414-1.414L5.5 3.086 4.207 1.793a1 1 0 0 0-1.414 0L1.086 3.5a1 1 0 0 0 0 1.414L2.379 6.207.707 7.879a1 1 0 0 0 0 1.414l5 5a1 1 0 0 0 1.414 0l1.672-1.672 1.293 1.293a1 1 0 0 0 1.414 0l1.707-1.707a1 1 0 0 0 0-1.414L11.914 9.5l3.379-3.379a1 1 0 0 0 0-1.414l-2-2z" fill="#F0F1F5"/>
        </svg>
        <span>Tool</span>
      </div>
      <div class="tool-input-row">
        <div class="pid-input-wrapper">
          <span class="pid-label">PID |</span>
          <input
            type="text"
            class="pid-input"
            placeholder="Tab the list"
            bind:value={toolPid}
          />
          {#if toolPid}
            <button class="clear-btn" on:click={() => (toolPid = '')}>✕</button>
          {/if}
        </div>
        <button
          class="kill-btn"
          class:kill-active={!!toolPid}
          disabled={!toolPid}
          on:click={() => (killDialogOpen = true)}
        >
          Kill
        </button>
      </div>
    </div>
  </div>

  <!-- Main Replay Section -->
  <div class="replay-main">
    <!-- Audit Log Header (desktop xl) -->
    <div class="audit-section">
      <div class="audit-header desktop-only-xl">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v2h8V4H4zm0 4v1h5V8H4zm0 3v1h3v-1H4z" fill="#F0F1F5"/></svg>
        <span>Audit Log</span>
      </div>

      <!-- Audit Log Summary (desktop xl) -->
      <div class="audit-summary desktop-only-xl">
        <div class="audit-col">
          <div class="audit-value-large">{logType || '-'} : {file || '-'}</div>
          <div class="audit-row bordered">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="#F4F4F8" stroke-width="1.2" fill="none"/><path d="M5 1v2M11 1v2M2 6h12" stroke="#F4F4F8" stroke-width="1.2"/></svg>
            <span class="audit-label">Date</span>
            <span class="audit-text">{date || '0000-00-00'}</span>
          </div>
        </div>
        <div class="audit-col">
          <div class="audit-row bordered">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#F4F4F8" stroke-width="1.2" fill="none"/><path d="M8 4v4l3 2" stroke="#F4F4F8" stroke-width="1.2" stroke-linecap="round"/></svg>
            <span class="audit-label">Start Time</span>
            <span class="audit-text">{startTime || '00:00:00'}</span>
          </div>
          <div class="audit-row bordered">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#F4F4F8" stroke-width="1.2" fill="none"/><path d="M8 4v4l3 2" stroke="#F4F4F8" stroke-width="1.2" stroke-linecap="round"/></svg>
            <span class="audit-label">End Time</span>
            <span class="audit-text">{endTime || '00:00:00'}</span>
          </div>
        </div>
        <div class="audit-col">
          <div class="audit-row bordered">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3h10v2H3zM5 7h6v6H5z" stroke="#F4F4F8" stroke-width="1.2" fill="none"/></svg>
            <span class="audit-label">Head</span>
            <span class="audit-text">{head || '-'}</span>
          </div>
          <div class="audit-row bordered">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3h10v2H3zM5 7h6v6H5z" stroke="#F4F4F8" stroke-width="1.2" fill="none"/></svg>
            <span class="audit-label">Channel Number</span>
            <span class="audit-text">{channel || '-'}</span>
          </div>
        </div>
        <div class="audit-col audit-col-wide">
          <div class="audit-row bordered">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.333C5.285 1.333 3.238 2.357 3.238 3.714V12.286C3.238 13.643 5.285 14.667 8 14.667C10.715 14.667 12.762 13.643 12.762 12.286V3.714C12.762 2.357 10.715 1.333 8 1.333Z" fill="#F4F4F8"/></svg>
            <span class="audit-label">Destination To</span>
            <span class="audit-text">{outboundExpression || '-'}</span>
          </div>
          <div class="audit-row bordered">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l6 5-6 5V3z" fill="#F4F4F8"/></svg>
            <span class="audit-label">Speed</span>
            <span class="audit-text">{currentSpeed || '-'}</span>
          </div>
          <div class="audit-replay-btn-wrapper desktop-only-xl">
            <button
              class="replay-btn"
              class:replay-active={canReplay}
              disabled={!canReplay}
              on:click={() => (replayDialogOpen = true)}
            >
              Replay <span class="chevron">›</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Audit Log Collapsible (mobile/tablet) -->
      <div class="audit-collapsible mobile-only-xl">
        <div class="audit-collapse-header">
          <div class="audit-collapse-left">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v2h8V4H4zm0 4v1h5V8H4zm0 3v1h3v-1H4z" fill="#F0F1F5"/></svg>
            <span>Audit Log</span>
          </div>
          <div class="audit-collapse-right">
            <button class="replay-btn replay-btn-sm" class:replay-active={canReplay} disabled={!canReplay} on:click={() => (replayDialogOpen = true)}>
              Replay <span class="chevron">›</span>
            </button>
            <button class="collapse-toggle" on:click={() => (auditCollapsed = !auditCollapsed)}>
              {#if auditCollapsed}▲{:else}▼{/if}
            </button>
          </div>
        </div>
        <div class="audit-compact-row">
          <span class="audit-value-large">{logType || '-'} : {file || '-'}</span>
          <span class="audit-row-inline">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="#F4F4F8" stroke-width="1.2" fill="none"/><path d="M5 1v2M11 1v2M2 6h12" stroke="#F4F4F8" stroke-width="1.2"/></svg>
            Date {date || '0000-00-00'}
          </span>
        </div>
        {#if auditCollapsed}
          <div class="audit-expanded-rows">
            <div class="audit-detail-row">
              <span>Start Time: {startTime || '00:00:00'}</span>
              <span>End Time: {endTime || '00:00:00'}</span>
            </div>
            <div class="audit-detail-row">
              <span>Head: {head || '-'}</span>
              <span>Channel: {channel || '-'}</span>
            </div>
            <div class="audit-detail-row">
              <span>Destination To: {outboundExpression || '-'}</span>
              <span>Speed: {currentSpeed || '-'}</span>
            </div>
          </div>
          <div class="mobile-replay-btn">
            <button class="replay-btn replay-btn-full" class:replay-active={canReplay} disabled={!canReplay} on:click={() => (replayDialogOpen = true)}>
              Replay <span class="chevron">›</span>
            </button>
          </div>
        {/if}
      </div>

      <!-- Replay Interface -->
      <div class="interface-section">
        <div class="interface-header">Replay Interface</div>
        <div class="interface-grid">

          <!-- Panel 1: Log Type + File -->
          <div class="panel">
            <div class="field-group">
              <label class="field-label">Log Type</label>
              {#if logType === ''}
                <select class="dark-select" bind:value={logType}>
                  <option value="" disabled>Select</option>
                  {#each logTypeList as opt}
                    <option value={opt.label}>{opt.label}</option>
                  {/each}
                </select>
              {:else}
                <span class="log-tag">
                  {logType}
                  <button class="tag-close" on:click={() => (logType = '')}>✕</button>
                </span>
              {/if}
            </div>
            <div class="field-group">
              <label class="field-label">File</label>
              {#if file === ''}
                <select class="dark-select" bind:value={file}>
                  <option value="" disabled>Select</option>
                  {#each fileOptions as opt}
                    <option value={opt.label}>{opt.label}</option>
                  {/each}
                </select>
              {:else}
                <span class="log-tag">
                  {file}
                  <button class="tag-close" on:click={() => (file = '')}>✕</button>
                </span>
              {/if}
            </div>
          </div>

          <!-- Panel 2: Date + Start/End Time -->
          <div class="panel">
            <div class="field-group">
              <label class="field-label">Date</label>
              {#if date === '' || date === '0000-00-00'}
                <select class="dark-select dark-select-wide" bind:value={date}>
                  <option value="0000-00-00" disabled>0000-00-00</option>
                  {#each dateOptions as opt}
                    <option value={opt.label}>{opt.label}</option>
                  {/each}
                </select>
              {:else}
                <span class="log-tag">
                  {date}
                  <button class="tag-close" on:click={() => (date = '0000-00-00')}>✕</button>
                </span>
              {/if}
            </div>
            <div class="field-group">
              <label class="field-label">Start Time</label>
              {#if startTime !== ''}
                <input type="time" step="1" class="dark-input time-input" bind:value={startTime} />
              {:else}
                <span class="log-tag">
                  {startTime}
                  <button class="tag-close" on:click={() => (startTime = '00:00:00')}>✕</button>
                </span>
              {/if}
            </div>
            <div class="field-group">
              <label class="field-label">End Time</label>
              {#if endTime !== ''}
                <input type="time" step="1" class="dark-input time-input" bind:value={endTime} />
              {:else}
                <span class="log-tag">
                  {endTime}
                  <button class="tag-close" on:click={() => (endTime = '00:00:00')}>✕</button>
                </span>
              {/if}
            </div>
          </div>

          <!-- Panel 3: Head + Channel -->
          <div class="panel">
            <div class="field-group">
              <label class="field-label">Head</label>
              {#if head === 'All' || head === ''}
                <button class="all-btn" on:click={() => handleOpenFilterDialog('HEAD')}>
                  All
                  <span class="all-arrows">▲▼</span>
                </button>
              {:else}
                <span class="log-tag">
                  {head}
                  <button class="tag-close" on:click={() => (head = '')}>✕</button>
                </span>
              {/if}
              {#if filterDialogOpen && filterTarget === 'HEAD'}
                <div class="filter-dialog">
                  <div class="filter-input-row">
                    <span class="filter-prefix">Typing |</span>
                    <input class="filter-input" bind:value={dialogExpression} placeholder="" />
                    {#if dialogExpression}
                      <button class="clear-btn-sm" on:click={() => (dialogExpression = '')}>✕</button>
                    {/if}
                  </div>
                  {#if filterError}
                    <div class="filter-error">{filterError}</div>
                  {/if}
                  <div class="filter-actions">
                    <button class="btn-secondary" on:click={() => { handleFilterReset(); handleCloseFilterDialog(); }}>Cancel</button>
                    <button class="btn-primary" on:click={handleFilterConfirm}>Apply</button>
                  </div>
                </div>
              {/if}
            </div>

            <div class="field-group">
              <label class="field-label">Channel Number</label>
              {#if channel === 'All' || channel === ''}
                <button class="all-btn" on:click={() => handleOpenFilterDialog('CHANNEL')}>
                  All
                  <span class="all-arrows">▲▼</span>
                </button>
              {:else}
                <span class="log-tag">
                  {channel}
                  <button class="tag-close" on:click={() => (channel = '')}>✕</button>
                </span>
              {/if}
              {#if filterDialogOpen && filterTarget === 'CHANNEL'}
                <div class="filter-dialog">
                  <div class="filter-input-row">
                    <span class="filter-prefix">Typing |</span>
                    <input class="filter-input" bind:value={dialogExpression} placeholder="" />
                    {#if dialogExpression}
                      <button class="clear-btn-sm" on:click={() => (dialogExpression = '')}>✕</button>
                    {/if}
                  </div>
                  {#if filterError}
                    <div class="filter-error">{filterError}</div>
                  {/if}
                  <div class="filter-actions">
                    <button class="btn-secondary" on:click={() => { handleFilterReset(); handleCloseFilterDialog(); }}>Cancel</button>
                    <button class="btn-primary" on:click={handleFilterConfirm}>Apply</button>
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- Panel 4: Destination + Speed -->
          <div class="panel">
            <div class="field-group">
              <label class="field-label">Destination To</label>
              {#if outboundExpression === ''}
                <div class="outbound-input-group">
                  <div class="outbound-field">
                    <span class="outbound-prefix">Typing |</span>
                    <input class="outbound-input" bind:value={outboundInput} placeholder="<app>.<inst>" />
                    {#if outboundInput}
                      <button class="clear-btn-sm" on:click={() => (outboundInput = '')}>✕</button>
                    {/if}
                  </div>
                  <button class="btn-primary apply-btn" on:click={() => (outboundExpression = outboundInput)}>Apply</button>
                </div>
              {:else}
                <span class="log-tag">
                  {outboundExpression}
                  <button class="tag-close" on:click={() => { outboundExpression = ''; outboundInput = ''; }}>✕</button>
                </span>
              {/if}
            </div>
            <div class="field-group">
              <label class="field-label">Speed</label>
              <div class="speed-control">
                <input
                  type="text"
                  class="speed-input"
                  value={currentSpeed}
                  on:input={handleSpeedInput}
                />
                <div class="speed-arrows">
                  <button class="arrow-btn" on:click={incrementSpeed}>▲</button>
                  <button class="arrow-btn" on:click={decrementSpeed}>▼</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Kill Dialog -->
{#if killDialogOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="dialog-overlay" on:click={() => (killDialogOpen = false)}>
    <div class="dialog-box" on:click|stopPropagation>
      <div class="dialog-title">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#F0F1F5" stroke-width="1.5" fill="none"/><path d="M10 6v5M10 13v1" stroke="#F0F1F5" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span>confirm</span>
      </div>
      <div class="dialog-content">
        <div class="dialog-pid-row">
          <span class="dialog-pid-label">PID</span>
          <span class="dialog-divider"></span>
          <span class="dialog-pid-value">{toolPid}</span>
        </div>
        <div class="dialog-message">Would you like to quit?</div>
      </div>
      <div class="dialog-actions">
        <button class="btn-primary" disabled={isTerminating} on:click={handleTerminate}>
          {isTerminating ? 'Terminating...' : 'Yes'}
        </button>
        <button class="btn-cancel" disabled={isTerminating} on:click={() => (killDialogOpen = false)}>No</button>
      </div>
    </div>
  </div>
{/if}

<!-- Replay Dialog -->
{#if replayDialogOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="dialog-overlay" on:click={() => (replayDialogOpen = false)}>
    <div class="dialog-box" on:click|stopPropagation>
      <div class="dialog-title">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#F0F1F5" stroke-width="1.5" fill="none"/><path d="M10 7v0M10 9v4" stroke="#F0F1F5" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span>confirm</span>
      </div>
      <div class="dialog-content">
        <div class="dialog-message">Replay?</div>
      </div>
      <div class="dialog-actions">
        <button class="btn-primary" disabled={replaying} on:click={handleReplayConfirm}>
          {replaying ? 'Replaying...' : 'Yes'}
        </button>
        <button class="btn-cancel" on:click={() => (replayDialogOpen = false)}>No</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ===== Layout ===== */
  .loading-box { display: flex; justify-content: center; padding: 60px; }

  .top-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  @media (min-width: 1200px) {
    .top-grid { grid-template-columns: 2fr 1fr; }
  }

  /* ===== Process Table ===== */
  .process-table-container {
    border-radius: 8px;
    overflow: hidden;
    max-height: 174px;
    overflow-y: auto;
  }
  .table-wrapper { width: 100%; }
  .dark-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .dark-table thead th {
    padding: 8px 12px;
    text-align: left;
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    color: #667085;
    border-bottom: 1px solid #2E3649;
  }
  .dark-table tbody td { padding: 8px 12px; border: none; }
  .process-row { cursor: pointer; transition: background 0.15s; }
  .process-row:hover { background: rgba(255,255,255,0.06) !important; }
  .row-even { background: #202838; }
  .row-odd { background: #141C2A; }
  .text-muted-cell { color: #D1D6E0; font-size: 15px; }
  .command-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
  .empty-cell { text-align: center; padding: 20px; color: #D1D6E0; }
  .play-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 2px 10px; border-radius: 12px;
    font-size: 12px; font-weight: 600;
    background: #1D2F20; color: #7EE081;
    border: 1px solid #36573C;
  }
  .dot-green { width: 8px; height: 8px; border-radius: 50%; background: #7EE081; }

  /* ===== Tool Box ===== */
  .tool-box {
    border-radius: 8px;
    border: 1px solid #4E576A;
    padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .tool-header { display: flex; align-items: center; gap: 8px; color: #F0F1F5; font-size: 15px; }
  .tool-input-row { display: flex; align-items: center; gap: 8px; }
  .pid-input-wrapper {
    flex: 1;
    display: flex; align-items: center;
    height: 32px;
    border: 1px solid #4E576A;
    border-radius: 4px;
    padding: 0 8px;
    background: #161C25;
  }
  .pid-label { color: #D1D6E0; font-size: 14px; white-space: nowrap; margin-right: 4px; }
  .pid-input {
    flex: 1; border: none; outline: none; background: transparent;
    color: #D1D6E0; font-size: 14px; padding: 0;
  }
  .pid-input::placeholder { color: #667085; }
  .clear-btn {
    background: none; border: none; color: #999; font-size: 14px; cursor: pointer; padding: 0 2px;
  }
  .clear-btn:hover { color: #fff; }
  .kill-btn {
    height: 32px; padding: 4px 12px;
    background: #331B1E; border: 2px solid #4A2C31;
    color: #4A2C31; border-radius: 4px;
    font-size: 14px; font-weight: 400;
    cursor: not-allowed;
  }
  .kill-btn.kill-active {
    background: #4A2C31; border-color: #FF3D4A; color: #FF3D4A; cursor: pointer;
  }
  .kill-btn.kill-active:hover {
    background: #5E66FF; border-color: #4E57E5; color: #FFFFFF;
  }

  /* ===== Main Replay Area ===== */
  .replay-main { display: flex; flex-direction: column; gap: 0; }
  .audit-section {
    background: #0A0E15;
    border-radius: 12px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.05);
    padding: 20px 16px;
    display: flex; flex-direction: column; gap: 12px;
  }

  /* ===== Audit Header ===== */
  .audit-header { display: flex; align-items: center; gap: 8px; color: #F0F1F5; font-size: 15px; }

  /* ===== Audit Summary (XL only) ===== */
  .audit-summary {
    display: grid;
    grid-template-columns: 2.5fr 2.5fr 3.2fr 3.7fr;
    gap: 16px;
    margin-top: 12px;
  }
  .audit-col { display: flex; flex-direction: column; gap: 12px; }
  .audit-col-wide { display: flex; flex-direction: column; gap: 12px; min-width: 257px; }
  .audit-value-large { color: #F0F1F5; font-weight: 900; font-size: 20px; }
  .audit-row {
    display: flex; align-items: center; gap: 12px; padding-bottom: 12px;
  }
  .audit-row.bordered {
    border-bottom: 0.5px solid transparent;
    border-image: linear-gradient(to right, #1b1c1dff 0%, #667085 50%, #1b1c1dff 100%) 1;
  }
  .audit-label { color: #F0F1F5; font-weight: 600; font-size: 15px; white-space: nowrap; }
  .audit-text { color: #F0F1F5; font-size: 15px; }
  .audit-replay-btn-wrapper { display: flex; justify-content: flex-end; margin-top: auto; }

  /* ===== Audit Collapsible (< XL) ===== */
  .audit-collapsible { display: flex; flex-direction: column; gap: 8px; }
  .audit-collapse-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; }
  .audit-collapse-left { display: flex; align-items: center; gap: 8px; color: #F0F1F5; font-size: 15px; }
  .audit-collapse-right { display: flex; align-items: center; gap: 8px; }
  .collapse-toggle { background: none; border: none; color: #373F4E; font-size: 16px; cursor: pointer; }
  .audit-compact-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-bottom: 8px; border-bottom: 1px solid; border-image: linear-gradient(to right, #181819 0%, #667085 50%, #181819 100%) 1; }
  .audit-row-inline { display: flex; align-items: center; gap: 4px; color: #F0F1F5; font-size: 14px; }
  .audit-expanded-rows { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .audit-detail-row { display: flex; justify-content: space-between; color: #F0F1F5; font-size: 14px; padding: 4px 0; border-bottom: 0.5px solid; border-image: linear-gradient(to right, #181819 0%, #667085 50%, #181819 100%) 1; }
  .mobile-replay-btn { margin-top: 12px; }

  /* Responsive visibility */
  .desktop-only-xl { display: none; }
  .mobile-only-xl { display: block; }
  @media (min-width: 1440px) {
    .desktop-only-xl { display: flex; }
    .mobile-only-xl { display: none; }
  }

  /* ===== Replay Interface ===== */
  .interface-section { margin-top: 16px; }
  .interface-header { color: #F0F1F5; font-size: 15px; margin-bottom: 12px; }
  .interface-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }
  @media (min-width: 768px) {
    .interface-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (min-width: 1200px) {
    .interface-grid { grid-template-columns: 2.5fr 2.5fr 3.2fr 3.7fr; }
  }

  .panel {
    padding: 12px;
    border-radius: 8px;
    display: flex; flex-direction: column; gap: 8px;
    background: linear-gradient(180deg, #202838 80%, #373F4E 100%);
    min-height: 280px;
  }
  @media (min-width: 1200px) {
    .panel { min-height: 340px; }
  }

  .field-group { display: flex; flex-direction: column; gap: 4px; }
  .field-label { color: #D1D6E0; font-size: 15px; font-weight: 400; line-height: 32px; }

  /* ===== Dark Select ===== */
  .dark-select {
    height: 32px; max-width: 94px;
    padding: 4px 8px;
    background: transparent;
    border: 1px solid #4E576A;
    border-radius: 4px;
    color: #D1D6E0; font-size: 15px;
    cursor: pointer;
    appearance: auto;
  }
  .dark-select:focus { border-color: #E0E4EB; }
  .dark-select-wide { max-width: 120px; }

  /* ===== Dark Input ===== */
  .dark-input {
    height: 32px; max-width: 110px;
    padding: 4px 8px;
    background: transparent;
    border: 1px solid #4E576A;
    border-radius: 4px;
    color: #D1D6E0; font-size: 15px;
  }
  .dark-input:focus { border-color: #E0E4EB; }
  .time-input { color: #D1D6E0; }
  .time-input::-webkit-calendar-picker-indicator { filter: invert(0.7); }

  /* ===== Log Tag ===== */
  .log-tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 8px;
    background: #212447; border: 1px solid #1D2654;
    border-radius: 4px; color: #7AA2FF;
    font-size: 15px; width: fit-content;
  }
  .tag-close {
    background: none; border: none; color: #6B89FF;
    cursor: pointer; font-size: 12px; padding: 0;
    line-height: 1;
  }
  .tag-close:hover { color: #fff; }

  /* ===== All Button ===== */
  .all-btn {
    display: inline-flex; align-items: center; gap: 4px;
    height: 32px; padding: 4px 12px;
    background: #212447; border: 1px solid #1D2654;
    border-radius: 4px;
    color: #7AA2FF; font-size: 15px; cursor: pointer;
    width: fit-content;
  }
  .all-btn:hover { background: #2a2d5a; }
  .all-arrows { font-size: 8px; display: flex; flex-direction: column; line-height: 1; gap: 0; }

  /* ===== Filter Dialog ===== */
  .filter-dialog {
    background: #202838;
    border-radius: 4px;
    padding: 8px;
    box-shadow: 0px 4px 20px #373F4E;
    display: flex; flex-direction: column; gap: 12px;
    max-width: 400px;
  }
  .filter-input-row {
    display: flex; align-items: center;
    height: 42px;
    background: #202838;
    border: 1px solid #4E576A;
    border-radius: 8px;
    padding: 0 8px 0 12px;
  }
  .filter-prefix { color: #D1D6E0; font-size: 15px; white-space: nowrap; margin-right: 8px; }
  .filter-input {
    flex: 1; border: none; outline: none; background: transparent;
    color: #7AA2FF; font-size: 15px;
  }
  .clear-btn-sm { background: none; border: none; color: #D1D6E0; cursor: pointer; font-size: 14px; }
  .filter-error { color: #FF5630; font-size: 12px; padding: 0 4px; }
  .filter-actions { display: flex; justify-content: flex-end; gap: 8px; }

  /* ===== Outbound Input ===== */
  .outbound-input-group { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .outbound-field {
    display: flex; align-items: center;
    height: 42px;
    background: #202838;
    border: 1px solid #4E576A;
    border-radius: 8px;
    padding: 0 8px 0 12px;
    flex: 1; min-width: 180px;
  }
  .outbound-prefix { color: #D1D6E0; font-size: 15px; white-space: nowrap; margin-right: 8px; }
  .outbound-input {
    flex: 1; border: none; outline: none; background: transparent;
    color: #7AA2FF; font-size: 15px;
  }
  .outbound-input::placeholder { color: #667085; }
  .apply-btn { height: 42px; padding: 8px 16px; border-radius: 8px; font-size: 17px; }

  /* ===== Speed Control ===== */
  .speed-control { display: flex; align-items: center; width: fit-content; }
  .speed-input {
    width: 50px; height: 32px;
    text-align: center;
    background: transparent;
    border: 1px solid #4E576A;
    border-radius: 4px 0 0 4px;
    color: #F0F1F5; font-size: 15px;
    outline: none;
  }
  .speed-input:focus { border-color: #E0E4EB; }
  .speed-arrows {
    display: flex; flex-direction: column;
    height: 32px;
    border: 1px solid #4E576A;
    border-left: none;
    border-radius: 0 4px 4px 0;
  }
  .arrow-btn {
    background: transparent; border: none; color: white;
    font-size: 8px; cursor: pointer;
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 0 4px;
  }
  .arrow-btn:hover { opacity: 0.8; }

  /* ===== Buttons ===== */
  .btn-primary {
    padding: 4px 12px;
    background: #5E66FF; color: white;
    border: none; border-radius: 4px;
    font-size: 15px; cursor: pointer;
  }
  .btn-primary:hover { background: #4E57E5; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary {
    padding: 4px 12px;
    background: #373F4E; color: #F0F1F5;
    border: 1px solid #F0F1F5; border-radius: 4px;
    font-size: 15px; cursor: pointer;
  }
  .btn-secondary:hover { background: #47505F; }

  /* ===== Replay Button ===== */
  .replay-btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 8px 16px;
    background: transparent; color: #667085;
    border: none; border-radius: 4px;
    font-size: 17px; cursor: not-allowed;
  }
  .replay-btn.replay-active {
    background: #5E66FF; color: #F0F1F5; cursor: pointer;
  }
  .replay-btn.replay-active:hover { background: #4E57E5; }
  .replay-btn:disabled { cursor: not-allowed; }
  .replay-btn-sm { font-size: 14px; padding: 4px 12px; }
  .replay-btn-full { width: 100%; justify-content: center; }
  .chevron { font-size: 20px; }

  /* ===== Dialog ===== */
  .dialog-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
  }
  .dialog-box {
    background: #0A0E15;
    border: 1px solid #4E576A;
    border-radius: 8px;
    padding: 12px;
    min-width: 400px;
    color: #F0F1F5;
  }
  .dialog-title { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .dialog-content {
    background: #161C25;
    border: 1px solid #4E576A;
    border-radius: 8px;
    padding: 24px;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center; gap: 8px;
    min-height: 108px;
  }
  .dialog-pid-row { display: flex; align-items: center; gap: 8px; }
  .dialog-pid-label { font-size: 18px; font-weight: 600; }
  .dialog-divider { width: 1px; height: 12px; background: #4E576A; }
  .dialog-pid-value { font-size: 18px; font-weight: 600; }
  .dialog-message { font-size: 15px; text-align: center; }
  .dialog-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 20px 0; }
  .btn-cancel {
    padding: 4px 12px;
    background: #EFF6FF; color: #6B89FF;
    border: 1px solid #DFEAFF; border-radius: 4px;
    font-size: 15px; cursor: pointer;
  }
  .btn-cancel:hover { background: #E0E8FF; }
  .btn-cancel:disabled { opacity: 0.5; }
</style>