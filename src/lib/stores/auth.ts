import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'kqp_auth_user';

function createAuthStore() {
  const initial = browser ? localStorage.getItem(STORAGE_KEY) : null;
  const { subscribe, set, update } = writable<string | null>(initial);

  return {
    subscribe,
    login: (userId: string) => {
      if (browser) localStorage.setItem(STORAGE_KEY, userId);
      set(userId);
    },
    logout: () => {
      if (browser) localStorage.removeItem(STORAGE_KEY);
      set(null);
    },
    isAuthenticated: () => {
      if (!browser) return false;
      return !!localStorage.getItem(STORAGE_KEY);
    }
  };
}

export const auth = createAuthStore();
