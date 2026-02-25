<script lang="ts">
  import Breadcrumb from '$lib/components/common/Breadcrumb.svelte';
  import { theme } from '$lib/stores/theme';

  $: isDark = $theme === 'dark';
</script>

<Breadcrumb pages={[{ pageName: 'Settings' }]} />
<h1 class="page-title">Settings</h1>

<div class="settings-grid">
  <div class="card">
    <h3 class="section-title">Display</h3>

    <div class="setting-row">
      <div>
        <div class="setting-label">Theme</div>
        <div class="setting-desc">Switch between dark and light mode</div>
      </div>
      <div class="theme-toggle">
        <button class:active={isDark} on:click={() => theme.set('dark')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          Dark
        </button>
        <button class:active={!isDark} on:click={() => theme.set('light')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          </svg>
          Light
        </button>
      </div>
    </div>
  </div>

  <div class="card">
    <h3 class="section-title">About</h3>
    <div class="info-row"><span>Application</span><span>KQP Admin</span></div>
    <div class="info-row"><span>Version</span><span>1.0.0</span></div>
    <div class="info-row"><span>Framework</span><span>SvelteKit</span></div>
    <div class="info-row"><span>API Mode</span>
      <span class="chip {import.meta.env.PUBLIC_API_DATA_TYPE === 'dummy' ? 'online' : 'offline'}">
        {import.meta.env.PUBLIC_API_DATA_TYPE === 'dummy' ? 'Demo Mode' : 'Live'}
      </span>
    </div>
  </div>
</div>

<style>
  .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } }

  .section-title { font-size: 15px; font-weight: 600; margin: 0 0 16px; }

  .setting-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px;
  }

  .setting-label { font-size: 14px; font-weight: 500; color: var(--text-primary); }
  .setting-desc { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

  .theme-toggle {
    display: flex; gap: 4px;
    background: var(--bg-primary); border-radius: 8px; padding: 3px;
    border: 1px solid var(--border-color);
  }

  .theme-toggle button {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 6px; border: none;
    background: transparent; color: var(--text-secondary);
    font-size: 13px; cursor: pointer; transition: all 0.15s;
  }

  .theme-toggle button.active {
    background: var(--accent); color: white;
  }

  .info-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px solid var(--border-color-light);
    font-size: 13px;
  }

  .info-row span:first-child { color: var(--text-secondary); }
</style>
