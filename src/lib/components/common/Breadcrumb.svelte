<script lang="ts">
  export let node: string | null = null;
  export let pages: { pageName: string }[] = [];
</script>

<div class="breadcrumb">
  <a href="/dashboard">Dashboard</a>
  {#if node}
    <span>›</span>
    <a href="/dashboard/nodes">Nodes</a>
    <span>›</span>
    <a href="/dashboard/nodes/{node}/node-dashboard">{node}</a>
  {/if}
  {#each pages as p}
    <span>›</span>
    <span class="current">{p.pageName}</span>
  {/each}
</div>

<style>
  .breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--text-secondary);
  }
  a { color: var(--text-secondary); transition: color 0.15s; }
  a:hover { color: var(--text-primary); }
  span { color: var(--text-muted); }
  .current { color: var(--text-primary); }
</style>
