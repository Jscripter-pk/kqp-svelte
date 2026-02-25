<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { theme } from '$lib/stores/theme';
  import { nodesStore } from '$lib/stores/nodes';
  import { onMount } from 'svelte';

  let sidebarOpen = true;
  let expandedNodes = true;

  onMount(() => {
    if (!$auth) { goto('/auth/login'); return; }
    nodesStore.fetch();
  });

  function logout() {
    auth.logout();
    goto('/auth/login');
  }

  function isActive(path: string) {
    return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
  }

  $: isDark = $theme === 'dark';
  $: nodes = $nodesStore.nodes;
  $: currentPath = $page.url.pathname;

  // Determine active node from URL
  $: activeNodeMatch = currentPath.match(/\/dashboard\/nodes\/([^\/]+)/);
  $: activeNode = activeNodeMatch ? activeNodeMatch[1] : null;

  const nodeSubPages = [
    { key: 'node-dashboard', label: 'Node Dashboard' },
    { key: 'process', label: 'Process' },
    { key: 'memory', label: 'Memory' },
    { key: 'audit-log', label: 'Audit Log' },
    { key: 'channels-inbound', label: 'Channel Inbound' },
    { key: 'channels-outbound', label: 'Channel Outbound' },
    { key: 'rules', label: 'Rule List' },
    { key: 'action', label: 'Action List' },
    { key: 'layout', label: 'Layout List' },
    { key: 'spec', label: 'SPEC List' },
    { key: 'identify', label: 'Identifier List' },
    { key: 'function', label: 'Function List' },
    { key: 'daily-report-list', label: 'Daily Report List' },
    { key: 'alerts-list', label: 'Alerts List' },
    { key: 'status', label: 'Status' },
    { key: 'replay', label: 'Replay' },
  ];

  let expandedNodeId: string | null = null;
  $: if (activeNode && expandedNodeId !== activeNode) expandedNodeId = activeNode;
</script>

<div class="layout" class:dark={isDark} class:light={!isDark}>
  <!-- Sidebar -->
  <aside class="sidebar" class:collapsed={!sidebarOpen}>
    <div class="sidebar-logo">
      <div class="logo-icon">
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#4A3BFF"/>
          <path d="M10 20L20 10L30 20L20 30L10 20Z" fill="white" opacity="0.9"/>
          <path d="M16 20L20 16L24 20L20 24L16 20Z" fill="#4A3BFF"/>
        </svg>
      </div>
      {#if sidebarOpen}
        <span class="logo-text">KQP Admin</span>
      {/if}
    </div>

    <nav class="sidebar-nav">
      <!-- Dashboard -->
      <a href="/dashboard"
         class="nav-item"
         class:active={currentPath === '/dashboard'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        {#if sidebarOpen}<span>Dashboard</span>{/if}
      </a>

      <!-- Nodes -->
      <div class="nav-section">
        <button class="nav-item nav-parent"
          class:active={currentPath.startsWith('/dashboard/nodes')}
          on:click={() => expandedNodes = !expandedNodes}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
            <line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/>
          </svg>
          {#if sidebarOpen}
            <span>Nodes</span>
            <svg class="chevron" class:rotated={expandedNodes} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          {/if}
        </button>

        {#if sidebarOpen && expandedNodes && nodes.length > 0}
          <div class="nav-children">
            {#each nodes as node}
              <div class="node-group">
                <button class="nav-item nav-node"
                  class:active={activeNode === node.id}
                  on:click={() => {
                    expandedNodeId = expandedNodeId === node.id ? null : node.id;
                    goto(`/dashboard/nodes/${node.id}/node-dashboard`);
                  }}>
                  <span class="dot {node.online_status ? 'online' : 'offline'}"></span>
                  <span>{node.id}</span>
                  <svg class="chevron" class:rotated={expandedNodeId === node.id} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {#if expandedNodeId === node.id}
                  <div class="nav-sub-children">
                    {#each nodeSubPages as sub}
                      <a href="/dashboard/nodes/{node.id}/{sub.key}"
                         class="nav-sub-item"
                         class:active={currentPath === `/dashboard/nodes/${node.id}/${sub.key}`}>
                        {sub.label}
                      </a>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </nav>

    <div class="sidebar-bottom">
      <a href="/dashboard/settings" class="nav-item" class:active={currentPath === '/dashboard/settings'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        {#if sidebarOpen}<span>Settings</span>{/if}
      </a>

      <button class="nav-item" on:click={logout}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        {#if sidebarOpen}<span>Logout</span>{/if}
      </button>
    </div>
  </aside>

  <!-- Main Content -->
  <div class="main-wrapper">
    <!-- Top Header -->
    <header class="topbar">
      <button class="icon-btn" on:click={() => sidebarOpen = !sidebarOpen}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div class="topbar-right">
        <button class="icon-btn" on:click={() => theme.toggle()} title="Toggle theme">
          {#if isDark}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          {:else}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          {/if}
        </button>

        <div class="user-info">
          <div class="user-avatar">{($auth ?? 'U')[0].toUpperCase()}</div>
          <span>{$auth ?? 'User'}</span>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="content">
      <slot />
    </main>
  </div>
</div>

<style>
  .layout {
    display: flex;
    min-height: 100vh;
    background: var(--bg-primary);
  }

  .sidebar {
    width: 240px;
    min-width: 240px;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: width 0.2s, min-width 0.2s;
    overflow: hidden;
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .sidebar.collapsed { width: 60px; min-width: 60px; }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 14px;
    border-bottom: 1px solid var(--border-color);
    min-height: 60px;
  }

  .logo-text { font-size: 15px; font-weight: 700; color: var(--text-primary); white-space: nowrap; }

  .sidebar-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 8px 0; }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 8px 14px;
    color: var(--text-secondary);
    border-radius: 6px;
    margin: 1px 4px;
    width: calc(100% - 8px);
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    border: none;
    text-align: left;
    transition: color 0.15s, background 0.15s;
    cursor: pointer;
    white-space: nowrap;
    text-decoration: none;
  }

  .nav-item:hover { color: var(--text-primary); background: var(--row-hover); }
  .nav-item.active { color: white; background: rgba(74,59,255,0.15); }
  .nav-item.active svg { stroke: var(--accent); }

  .nav-parent { justify-content: flex-start; }
  .chevron { margin-left: auto; transition: transform 0.2s; }
  .chevron.rotated { transform: rotate(180deg); }

  .nav-children { padding-left: 8px; }
  .nav-node { padding: 5px 10px; font-size: 12px; }
  .nav-node .dot { min-width: 8px; }

  .nav-sub-children { padding-left: 20px; }
  .nav-sub-item {
    display: block;
    padding: 4px 10px;
    font-size: 12px;
    color: var(--text-muted);
    border-radius: 4px;
    margin: 1px 0;
    transition: color 0.15s, background 0.15s;
    text-decoration: none;
  }
  .nav-sub-item:hover { color: var(--text-primary); background: var(--row-hover); }
  .nav-sub-item.active { color: var(--accent); background: rgba(74,59,255,0.1); }

  .sidebar-bottom {
    border-top: 1px solid var(--border-color);
    padding: 8px 0;
  }

  .main-wrapper { flex: 1; display: flex; flex-direction: column; min-width: 0; }

  .topbar {
    display: flex; align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 20px;
    background: var(--bg-sidebar);
    border-bottom: 1px solid var(--border-color);
    position: sticky; top: 0; z-index: 10;
  }

  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .icon-btn {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px; border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }
  .icon-btn:hover { color: var(--text-primary); background: var(--row-hover); }

  .user-info {
    display: flex; align-items: center; gap: 8px;
    color: var(--text-primary); font-size: 13px;
  }

  .user-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--accent);
    color: white; font-size: 13px; font-weight: 600;
    display: flex; align-items: center; justify-content: center;
  }

  .content { flex: 1; padding: 24px; overflow: auto; }

  @media (max-width: 768px) {
    .sidebar { position: fixed; z-index: 100; height: 100vh; }
  }
</style>
