<script lang="ts">
  export let currentPage = 1;
  export let totalPages = 1;
  export let hasNextPage = false;
  export let hasPreviousPage = false;
  export let rowsPerPage = 40;
  export let onPageChange: (p: number) => void = () => {};
  export let onRowsPerPageChange: (r: number) => void = () => {};
</script>

<div class="pagination">
  <span class="label">Rows per page:</span>
  <select value={rowsPerPage} on:change={e => onRowsPerPageChange(Number((e.target).value))}>
    {#each [20, 40, 60, 100] as r}
      <option value={r}>{r}</option>
    {/each}
  </select>

  <span class="page-info">Page {currentPage} of {totalPages}</span>

  <button disabled={!hasPreviousPage} on:click={() => onPageChange(currentPage - 2)}>‹</button>
  <button disabled={!hasNextPage} on:click={() => onPageChange(currentPage)}>›</button>
</div>

<style>
  .pagination {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--text-secondary);
  }
  .label { white-space: nowrap; }
  .page-info { white-space: nowrap; color: var(--text-secondary); }
  select { width: auto; padding: 3px 6px; }
  button {
    width: 26px; height: 26px; border-radius: 4px;
    border: 1px solid var(--border-color);
    background: var(--bg-card); color: var(--text-primary);
    font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  }
  button:disabled { opacity: 0.4; cursor: default; }
  button:not(:disabled):hover { background: var(--row-hover); }
</style>
