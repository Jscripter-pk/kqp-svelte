<script lang="ts">
  import { page } from '$app/stores';
  import { fetcher, endpoints } from '$lib/api';
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';

  $: nodeId = $page.params.node;
  $: name = $page.params.name;

  let item: any = null;
  let loading = true;

  async function loadData() {
    loading = true;
    try {
      const res = await fetcher(endpoints.actions.detail(nodeId, name)) as any;
      item = res?.data ?? null;
    } catch(e) { console.error(e); }
    loading = false;
  }

  $: name, loadData();
</script>

<Breadcrumb node={nodeId} pages={[
  { pageName: 'Action List', href: `/dashboard/nodes/${nodeId}/action` },
  { pageName: name }
]} />
<h1 class="page-title">Action: {name}</h1>

{#if loading}
  <div class="card" style="display:flex;justify-content:center;padding:60px"><span class="loading-spinner"></span></div>
{:else if !item}
  <div class="card" style="padding:40px;text-align:center;color:var(--text-muted)">Action not found</div>
{:else}
  <div class="detail-grid">
    <div class="card detail-card">
      <h3 class="section-title">Basic Info</h3>
      <div class="field-list">
        <div class="field-row"><span class="field-label">Name</span><span class="field-value">{item.name ?? name}</span></div>
        <div class="field-row"><span class="field-label">Path</span><span class="field-value">{item.path ?? '—'}</span></div>
        <div class="field-row"><span class="field-label">Timestamp</span><span class="field-value">{item.timestamp ?? '—'}</span></div>
        <div class="field-row"><span class="field-label">Ref. Layout</span><span class="field-value">{item.ref_layout ?? '—'}</span></div>
        <div class="field-row"><span class="field-label">Ref. Process</span><span class="field-value">{item.ref_process !== undefined ? Number(item.ref_process).toLocaleString() : '—'}</span></div>
        <div class="field-row"><span class="field-label">Description</span><span class="field-value">{item.desc ?? '—'}</span></div>
      </div>
    </div>

    {#if item.content !== undefined}
    <div class="card detail-card">
      <h3 class="section-title">Content</h3>
      <pre class="code-block">{typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2)}</pre>
    </div>
    {/if}

    <div class="card detail-card">
      <h3 class="section-title">Raw Data</h3>
      <pre class="code-block">{JSON.stringify(item, null, 2)}</pre>
    </div>
  </div>
{/if}

<style>
  .detail-grid { display: flex; flex-direction: column; gap: 16px; }
  .detail-card h3.section-title { font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
  .field-list { display: flex; flex-direction: column; gap: 10px; }
  .field-row { display: flex; gap: 12px; align-items: flex-start; }
  .field-label { min-width: 120px; font-size: 13px; color: var(--text-muted); flex-shrink: 0; }
  .field-value { font-size: 13px; color: var(--text-primary); word-break: break-all; }
  .code-block { background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; font-size: 12px; color: var(--text-secondary); overflow-x: auto; white-space: pre-wrap; word-break: break-all; margin: 0; }
</style>
