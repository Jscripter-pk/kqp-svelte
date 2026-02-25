<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { fetcher, endpoints } from "$lib/api";
  import Breadcrumb from "$lib/components/common/Breadcrumb.svelte";

  $: nodeId = $page.params.node;
  $: actionName = decodeURIComponent($page.params.name);

  let loading = true;
  let error = "";
  let actionItem: any = {};
  let layoutList: any[] = [];
  let processList: any[] = [];
  let script = "";

  async function loadData() {
    loading = true;
    error = "";
    try {
      const res = (await fetcher(
        endpoints.actions.detail(nodeId, actionName),
      )) as any;
      actionItem = res?.data ?? {};
      layoutList = res?.data?.layouts ?? [];
      processList = res?.data?.processes ?? [];
      script = res?.data?.definition ?? "";
    } catch (e) {
      error = String(e);
      console.error(e);
    }
    loading = false;
  }

  $: if (nodeId && actionName) loadData();

  function navTo(type: string, url: string) {
    const parts = url.split("/");
    const id = parts[parts.length - 1];
    goto(`/dashboard/nodes/${nodeId}/${type}/${encodeURIComponent(id)}`);
  }

  function highlightSyntax(text: string): string {
    if (!text) return "";
    return (
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Comments (-- and #)
        .replace(/(--.*|#.*)/g, '<span class="hl-comment">$1</span>')
        // Section headers [...]
        .replace(/^(\[.*\])/gm, '<span class="hl-section">$1</span>')
        // Keywords
        .replace(
          /\b(function|local|if|then|end|return|for|do|or|and|not)\b/g,
          '<span class="hl-keyword">$1</span>',
        )
        // Strings
        .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="hl-string">$1</span>')
        // Numbers
        .replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>')
    );
  }
</script>

<Breadcrumb
  node={nodeId}
  pages={[
    { pageName: "Action List", link: `/dashboard/nodes/${nodeId}/action` },
    { pageName: actionName },
  ]}
/>

<h1 class="page-title">{actionName}</h1>

<!-- Top: Summary Table -->
<div class="card summary-card">
  {#if loading}
    <div class="center-pad"><span class="loading-spinner"></span></div>
  {:else if error}
    <div class="center-pad error-text">Error Fetching Action</div>
  {:else if !actionItem.name}
    <div class="center-pad muted-text">No Process Found</div>
  {:else}
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Action Name</th>
          <th>Path</th>
          <th>Timestamp</th>
          <th>Ref. Layout</th>
          <th>Ref. Process</th>
          <th></th>
          <th></th>
          <th>Description</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td></td>
          <td>{actionItem.name}</td>
          <td>{actionItem.path ?? ""}</td>
          <td>{actionItem.timestamp ?? ""}</td>
          <td>{actionItem.ref_layout ?? ""}</td>
          <td>{actionItem.ref_process ?? ""}</td>
          <td></td>
          <td></td>
          <td>{actionItem.desc ?? ""}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  {/if}
</div>

<!-- Bottom: Two-column layout -->
{#if !loading && !error && actionItem.name}
  <div class="bottom-grid">
    <!-- LEFT (7/12): Two stacked tables -->
    <div class="left-col">
      <!-- Related Layouts -->
      <div class="card stacked-table">
        <table>
          <thead>
            <tr>
              <th></th>
              <th style="text-align:right">No</th>
              <th>Related Layout</th>
              <th>Ref. Frequency</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#if layoutList.length === 0}
              <tr><td colspan="5" class="empty-cell">No actions found</td></tr>
            {:else}
              {#each layoutList as item, i}
                <tr>
                  <td></td>
                  <td style="text-align:right">{i + 1}</td>
                  <td>
                    <button
                      class="nav-link"
                      on:click={() => navTo("layout", item.url)}
                      >{item.name}</button
                    >
                  </td>
                  <td>{item.ref_count}</td>
                  <td></td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      <!-- Related Processes -->
      <div class="card stacked-table">
        <table>
          <thead>
            <tr>
              <th></th>
              <th style="text-align:right">No</th>
              <th>Related Process</th>
              <th>Usage Frequency</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#if processList.length === 0}
              <tr><td colspan="5" class="empty-cell">No actions found</td></tr>
            {:else}
              {#each processList as item, i}
                <tr>
                  <td></td>
                  <td style="text-align:right">{i + 1}</td>
                  <td>
                    <button
                      class="nav-link"
                      on:click={() => navTo("process", item.url)}
                      >{item.name}</button
                    >
                  </td>
                  <td>{item.ref_count}</td>
                  <td></td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <!-- RIGHT (5/12): Action Definition -->
    <div class="right-col">
      <div class="def-panel">
        <div class="def-header">Action Definition</div>
        <div class="def-body">
          {#if script}
            <pre class="def-code">{@html highlightSyntax(script)}</pre>
          {:else}
            <pre
              class="def-code muted-text">Action details will appear here.</pre>
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

  /* Left column tables */
  .left-col {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .stacked-table {
    padding: 0;
    overflow: auto;
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

  /* Right: Definition panel */
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
    padding: 12px 16px;
    font-weight: 600;
    font-size: 15px;
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
