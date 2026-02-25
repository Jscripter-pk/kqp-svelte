<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { fetcher, endpoints } from "$lib/api";
  import Breadcrumb from "$lib/components/common/Breadcrumb.svelte";

  $: nodeId = $page.params.node;
  $: specName = decodeURIComponent($page.params.name);

  let loading = true;
  let error = "";
  let detail: any = {};
  let identifiers: any[] = [];
  let frags: any[] = [];

  async function loadData() {
    loading = true;
    error = "";
    try {
      const res = (await fetcher(
        endpoints.spec.detail(nodeId, specName),
      )) as any;
      detail = res?.data?.detail ?? {};
      identifiers = detail.related_identifies ?? [];
      frags = Array.isArray(detail.spec_definition)
        ? detail.spec_definition
        : [];
    } catch (e) {
      error = String(e);
      console.error(e);
    }
    loading = false;
  }

  $: if (nodeId && specName) loadData();

  function navigateToIdentify(url: string) {
    const parts = url.split("/");
    const id = parts[parts.length - 1];
    goto(`/dashboard/nodes/${nodeId}/identify/${encodeURIComponent(id)}`);
  }
</script>

<Breadcrumb
  node={nodeId}
  pages={[
    { pageName: "SPEC List", link: `/dashboard/nodes/${nodeId}/spec` },
    { pageName: detail.name ?? specName },
  ]}
/>

<h1 class="page-title">SPEC: {detail.name ?? specName}</h1>

<!-- Top: Spec Summary Table -->
<div class="card summary-table-card">
  {#if loading}
    <div class="center-pad"><span class="loading-spinner"></span></div>
  {:else if error}
    <div class="center-pad error-text">Error Fetching Spec</div>
  {:else if !detail.name}
    <div class="center-pad muted-text">No Spec Found</div>
  {:else}
    <table>
      <thead>
        <tr>
          <th></th>
          <th>SPEC Name</th>
          <th>Path</th>
          <th>Timestamp</th>
          <th>Ref. Identifier</th>
          <th>Frags</th>
          <th>Size</th>
          <th>Description</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td></td>
          <td>{detail.name}</td>
          <td>{detail.path ?? ""}</td>
          <td>{detail.timestamp ?? ""}</td>
          <td>{detail.ref_identifies ?? ""}</td>
          <td>{detail.frags ?? ""}</td>
          <td>{detail.size ?? ""}</td>
          <td>{detail.desc ?? ""}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  {/if}
</div>

<!-- Bottom: Two-column layout -->
{#if !loading && !error && detail.name}
  <div class="bottom-grid">
    <!-- LEFT: Identifiers Table -->
    <div class="ident-panel">
      <div class="card" style="padding:0;overflow:auto;">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Identifier</th>
              <th>Ref. Frequency</th>
            </tr>
          </thead>
          <tbody>
            {#if identifiers.length === 0}
              <tr><td colspan="3" class="empty-cell">No data.</td></tr>
            {:else}
              {#each identifiers as ident, i}
                <tr>
                  <td>{i + 1}</td>
                  <td>
                    <button
                      class="ident-link"
                      on:click={() => navigateToIdentify(ident.url)}
                    >
                      {ident.name}
                    </button>
                  </td>
                  <td>{ident.ref_count}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <!-- RIGHT: Specification Definition -->
    <div class="spec-def-panel">
      <div class="spec-def-wrapper">
        <div class="spec-def-header">Specification Definition</div>
        <div class="spec-def-body">
          <table class="spec-def-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Offset</th>
                <th>Len</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {#if frags.length === 0}
                <tr><td colspan="5" class="empty-cell">No data.</td></tr>
              {:else}
                {#each frags as frag, i}
                  <tr class={i % 2 === 0 ? "row-even" : "row-odd"}>
                    <td>{frag.order}</td>
                    <td><span class="chip chip-offset">{frag.offset}</span></td>
                    <td><span class="chip chip-len">{frag.length}</span></td>
                    <td><span class="chip chip-type">{frag.type}</span></td>
                    <td>{frag.desc}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .summary-table-card {
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

  /* Bottom two-column grid */
  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  @media (min-width: 900px) {
    .bottom-grid {
      grid-template-columns: 5fr 7fr;
    }
  }

  /* Identifier link */
  .ident-link {
    background: none;
    border: none;
    padding: 0;
    color: #5e66ff;
    text-decoration: underline;
    cursor: pointer;
    font-size: 13px;
  }
  .ident-link:hover {
    color: #7b82ff;
  }

  /* ===== Spec Definition Panel ===== */
  .spec-def-wrapper {
    background: #202838;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-color, #2e3649);
  }
  .spec-def-header {
    background: #667085;
    padding: 12px 16px;
    font-weight: 600;
    font-size: 15px;
    color: #d4dcfa;
    border-radius: 8px 8px 0 0;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .spec-def-body {
    padding: 4px;
    max-height: 64vh;
    overflow-y: auto;
  }

  /* Spec definition table */
  .spec-def-table {
    width: 100%;
    border-collapse: collapse;
    border: none;
  }
  .spec-def-table thead tr {
    background: #212447;
  }
  .spec-def-table thead th {
    background: #212447;
    color: #d4dcfa;
    font-size: 13px;
    font-weight: 500;
    padding: 8px 12px;
    border: none;
  }
  .spec-def-table tbody td {
    padding: 10px 12px;
    font-size: 13px;
    color: #d4dcfa;
    border: none;
  }
  .spec-def-table .row-even {
    background: #202838;
  }
  .spec-def-table .row-odd {
    background: #141c2a;
  }

  /* Colored chips */
  .chip {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid transparent;
  }
  .chip-offset {
    background: #1d2f20;
    color: #7ee081;
    border-color: #1d2f20;
  }
  .chip-len {
    background: #1d2654;
    color: #7aa2ff;
    border-color: #1d2654;
  }
  .chip-type {
    background: #31291d;
    color: #ffc711;
    border-color: #31291d;
  }
</style>
