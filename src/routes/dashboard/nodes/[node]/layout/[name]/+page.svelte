<script lang="ts">
  import { page } from "$app/stores";
  import { fetcher, endpoints } from "$lib/api";
  import Breadcrumb from "$lib/components/common/Breadcrumb.svelte";
  import { t } from "$lib/i18n";

  $: nodeId = $page.params.node;
  $: layoutName = decodeURIComponent($page.params.name);

  let loading = true;
  let error = "";
  let detail: any = {};
  let layoutDef = "";

  async function loadData() {
    loading = true;
    error = "";
    try {
      const res = (await fetcher(
        endpoints.layouts.detail(nodeId, layoutName),
      )) as any;
      detail = res?.data?.detail ?? {};
      layoutDef = res?.data?.layout_definition ?? "";
    } catch (e) {
      error = String(e);
      console.error(e);
    }
    loading = false;
  }

  $: if (nodeId && layoutName) loadData();

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
</script>

<Breadcrumb
  node={nodeId}
  pages={[
    { pageName: $t.layout.title, link: `/dashboard/nodes/${nodeId}/layout` },
    { pageName: layoutName },
  ]}
/>

<h1 class="page-title">{$t.layout.detailTitle}{layoutName}</h1>

<!-- Top: Summary Table -->
<div class="card summary-card">
  {#if loading}
    <div class="center-pad"><span class="loading-spinner"></span></div>
  {:else if error}
    <div class="center-pad error-text">{$t.layout.errorFetching}</div>
  {:else if !detail.name}
    <div class="center-pad muted-text">{$t.layout.notFound}</div>
  {:else}
    <table>
      <thead>
        <tr>
          <th></th>
          <th>{$t.layout.layoutName}</th>
          <th>{$t.common.path}</th>
          <th>{$t.common.timestamp}</th>
          <th>{$t.layout.process}</th>
          <th>{$t.layout.channelIn}</th>
          <th></th>
          <th></th>
          <th>{$t.common.description}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td></td>
          <td>{detail.name}</td>
          <td>{detail.path ?? ""}</td>
          <td>{detail.timestamp ?? ""}</td>
          <td>{detail.process ?? ""}</td>
          <td>{detail.channel_in ?? ""}</td>
          <td></td>
          <td></td>
          <td>{detail.desc ?? ""}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  {/if}
</div>

<!-- Layout Definition (full width) -->
{#if !loading && !error}
  <div class="def-panel">
    <div class="def-header">{$t.layout.definition}</div>
    <div class="def-body">
      {#if layoutDef}
        <pre class="def-code">{@html highlightSyntax(layoutDef)}</pre>
      {:else}
        <pre class="def-code muted-text">{$t.layout.noDefinition}</pre>
      {/if}
    </div>
  </div>
{/if}

<style>
  .summary-card {
    padding: 0;
    overflow: auto;
    margin-bottom: 16px;
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

  /* Definition panel */
  .def-panel {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-color, #2e3649);
  }
  .def-header {
    background: #667085;
    padding: 12px 16px;
    font-weight: 600;
    font-size: 15px;
    color: #d1d6e0;
    border-radius: 8px 8px 0 0;
  }
  .def-body {
    background: #202838;
    max-height: calc(100vh - 48px);
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
