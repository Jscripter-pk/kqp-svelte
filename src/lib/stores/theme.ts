import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'dark' | 'light';

function createThemeStore() {
  const initial: Theme = browser
    ? (localStorage.getItem('kqp_theme') as Theme) ?? 'dark'
    : 'dark';

  const { subscribe, set, update } = writable<Theme>(initial);

  return {
    subscribe,
    toggle: () => update(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      if (browser) localStorage.setItem('kqp_theme', next);
      return next;
    }),
    set: (t: Theme) => {
      if (browser) localStorage.setItem('kqp_theme', t);
      set(t);
    }
  };
}

export const theme = createThemeStore();
