import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Locale = 'en' | 'ko';

function createLocaleStore() {
  const initial: Locale = browser
    ? (localStorage.getItem('kqp_locale') as Locale) ?? 'en'
    : 'en';

  const { subscribe, set, update } = writable<Locale>(initial);

  return {
    subscribe,
    toggle: () => update(l => {
      const next = l === 'en' ? 'ko' : 'en';
      if (browser) localStorage.setItem('kqp_locale', next);
      return next;
    }),
    set: (l: Locale) => {
      if (browser) localStorage.setItem('kqp_locale', l);
      set(l);
    }
  };
}

export const locale = createLocaleStore();
