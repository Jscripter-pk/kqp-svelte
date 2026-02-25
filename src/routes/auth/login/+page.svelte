<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { fetcher, endpoints } from '$lib/api';
  import { onMount } from 'svelte';

  let userId = '';
  let password = '';
  let error = '';
  let loading = false;

  onMount(() => {
    if ($auth) goto('/dashboard');
  });

  async function handleLogin() {
    if (!userId || !password) { error = 'Please enter ID and password'; return; }
    loading = true; error = '';
    try {
      await fetcher(endpoints.auth.login, {
  method: 'POST',
  body: {
    id: userId,
    password
  }
});
      auth.login(userId);
      goto('/dashboard');
    } catch (e) {
      error = 'Login failed. Please check your credentials.';
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }
</script>

<div class="login-page">
  <div class="login-bg">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
  </div>

  <div class="login-box">
    <div class="login-header">
      <div class="logo">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="#4A3BFF"/>
          <path d="M10 20L20 10L30 20L20 30L10 20Z" fill="white" opacity="0.9"/>
          <path d="M16 20L20 16L24 20L20 24L16 20Z" fill="#4A3BFF"/>
        </svg>
      </div>
      <h1>KQP Admin</h1>
      <p>Sign in to your account</p>
    </div>

    <div class="login-form">
      {#if error}
        <div class="error-msg">{error}</div>
      {/if}

      <div class="form-group">
        <label for="userId">User ID</label>
        <input
          id="userId"
          type="text"
          placeholder="Enter your ID"
          bind:value={userId}
          on:keydown={handleKeydown}
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          bind:value={password}
          on:keydown={handleKeydown}
          disabled={loading}
        />
      </div>

      <button class="login-btn" on:click={handleLogin} disabled={loading}>
        {#if loading}
          <span class="loading-spinner"></span> Signing in...
        {:else}
          Sign In
        {/if}
      </button>

      <p class="hint">Demo: any ID + any password (dummy mode)</p>
    </div>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    position: relative;
    overflow: hidden;
  }

  .login-bg {
    position: absolute; inset: 0; pointer-events: none;
  }

  .shape {
    position: absolute; border-radius: 50%;
    background: radial-gradient(circle, rgba(74,59,255,0.15), transparent 70%);
  }

  .shape-1 { width: 600px; height: 600px; top: -200px; left: -200px; }
  .shape-2 { width: 500px; height: 500px; bottom: -150px; right: -150px; }

  .login-box {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 40px;
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 1;
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .logo {
    display: inline-flex;
    margin-bottom: 16px;
  }

  .login-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px;
  }

  .login-header p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 14px;
  }

  .login-form { display: flex; flex-direction: column; gap: 16px; }

  .form-group { display: flex; flex-direction: column; gap: 6px; }

  label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  input {
    width: 100%;
    padding: 10px 14px;
    font-size: 14px;
    border-radius: 8px;
  }

  .login-btn {
    width: 100%;
    padding: 12px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    margin-top: 8px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: background 0.2s;
  }

  .login-btn:hover:not(:disabled) { background: #3D2FCC; }
  .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .error-msg {
    background: rgba(255,86,48,0.1);
    border: 1px solid rgba(255,86,48,0.3);
    border-radius: 8px;
    padding: 10px 14px;
    color: var(--error);
    font-size: 13px;
  }

  .hint {
    text-align: center;
    color: var(--text-muted);
    font-size: 12px;
    margin: 0;
  }

  .loading-spinner {
    width: 16px; height: 16px;
    border-width: 2px;
    border-color: rgba(255,255,255,0.3);
    border-top-color: white;
  }
</style>
