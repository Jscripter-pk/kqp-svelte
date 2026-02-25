<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { fetcher, endpoints } from "$lib/api";
  import Breadcrumb from "$lib/components/common/Breadcrumb.svelte";
  import { t } from "$lib/i18n";

  $: nodeId = $page.params.node;
  $: funcName = decodeURIComponent($page.params.name);

  let loading = true;
  let error = "";
  let detail: any = {};
  let funcInfo: any = {};
  let identList: any[] = [];
  let script = "";

  async function loadData() {
    loading = true;
    error = "";
    try {
      const res = (await fetcher(
        endpoints.function.detail(nodeId, funcName),
      )) as any;
      detail = res?.data ?? {};
      funcInfo = detail.function ?? {};
      identList = detail.related_identifies ?? [];
      script = detail.definition ?? "";
    } catch (e) {
      error = String(e);
      console.error(e);
    }
    loading = false;
  }

  $: if (nodeId && funcName) loadData();

  function navToIdentify(url: string) {
    const parts = url.split("/");
    const id = parts[parts.length - 1];
    goto(`/dashboard/nodes/${nodeId}/identify/${encodeURIComponent(id)}`);
  }

  function highlightSyntax(text: string): string {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(--.*|#.*)/g, '<span class="hl-comment">$1</span>')
      .replace(/^(\[.*\])/gm, '<span class="hl-section">$1</span>')
      .replace(
        /\b(function|local|if|then|end|return|for|do|or|and|not|nil)\b/g,
        '<span class="hl-keyword">$1</span>',
      )
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="hl-string">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>');
  }
</script>

<Breadcrumb
  node={nodeId}
  pages={[
    { pageName: $t.func.title, link: `/dashboard/nodes/${nodeId}/function` },
    { pageName: funcInfo.name ?? funcName },
  ]}
/>

<h1 class="page-title">{$t.func.detailTitle}{funcInfo.name ?? funcName}</h1>

<!-- Top: Summary Table -->
<div class="card summary-card">
  {#if loading}
    <div class="center-pad"><span class="loading-spinner"></span></div>
  {:else if error}
    <div class="center-pad error-text">{$t.func.errorFetching}</div>
  {:else}
    <table>
      <thead>
        <tr>
          <th></th>
          <th>{$t.func.functionName}</th>
          <th>{$t.common.path}</th>
          <th>{$t.common.timestamp}</th>
          <th>{$t.func.refIdentifier}</th>
          <th></th>
          <th></th>
          <th></th>
          <th>{$t.common.description}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td></td>
          <td>{funcInfo.name ?? ""}</td>
          <td>{funcInfo.path ?? ""}</td>
          <td>{funcInfo.timestamp ?? ""}</td>
          <td>{funcInfo.ref_identifies ?? ""}</td>
          <td></td>
          <td></td>
          <td></td>
          <td>{funcInfo.desc ?? ""}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  {/if}
</div>

<!-- Bottom: Two-column layout -->
{#if !loading && !error}
  <div class="bottom-grid">
    <!-- LEFT (7/12): Related Identifiers table -->
    <div class="left-col">
      <div class="card" style="padding:0;overflow:auto;">
        <table>
          <thead>
            <tr>
              <th></th>
              <th style="text-align:right">No</th>
              <th>{$t.func.relatedIdentifier}</th>
              <th>{$t.func.refFrequency}</th>
            </tr>
          </thead>
          <tbody>
            {#if identList.length === 0}
              <tr><td colspan="4" class="empty-cell">{$t.identify.noIdentities}</td></tr>
            {:else}
              {#each identList as item, i}
                <tr>
                  <td></td>
                  <td style="text-align:right">{i + 1}</td>
                  <td>
                    <button
                      class="nav-link"
                      on:click={() => navToIdentify(item.url)}
                      >{item.name}</button
                    >
                  </td>
                  <td>{item.ref_count}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <!-- RIGHT (5/12): User Function Definition -->
    <div class="right-col">
      <div class="def-panel">
        <div class="def-header">{$t.func.definition}</div>
        <div class="def-body">
          {#if script}
            <pre class="def-code">{@html highlightSyntax(script)}</pre>
          {:else}
            <pre class="def-code muted-text">{$t.func.noDefinition}</pre>
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

  /* Bottom grid */
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

  .nav-link {
    background: none;
    border: none;
    padding: 0;
    color: #5e66ff;
    text-decoration: underline;
    cursor: pointer;
    font-size: 13px;
  }
  .nav-link:hover {
    color: #7b82ff;
  }

  /* Definition panel */
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

  .def-code :global(.hl-comment) {
    color: #6a737d;
    font-style: italic;
  }
  .def-code :global(.hl-section) {
    color: #79b8ff;
    font-weight: 600;
  }
  .def-code :global(.hl-keyword) {
    color: #ff7b72;
  }
  .def-code :global(.hl-string) {
    color: #a5d6ff;
  }
  .def-code :global(.hl-number) {
    color: #79c0ff;
  }
</style>
