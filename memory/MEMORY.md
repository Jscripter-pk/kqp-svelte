# KQP Svelte Project Memory

## Project Structure
- SvelteKit app at `/Users/islam/Desktop/billycrew/kqp-svelte`
- Source: `src/routes/` (pages) and `src/lib/` (stores, components, i18n)
- Main layout: `src/routes/dashboard/+layout.svelte` (sidebar + topbar)

## Key Files
- `src/lib/stores/theme.ts` – dark/light theme store (persists to localStorage as `kqp_theme`)
- `src/lib/stores/locale.ts` – EN/KO language store (persists to localStorage as `kqp_locale`)
- `src/lib/i18n/index.ts` – all translations (en + ko), exports derived `t` store
- `src/lib/stores/auth.ts` – auth store
- `src/lib/stores/nodes.ts` – nodes store
- `src/lib/api.ts` – API fetcher

## i18n Pattern
- Import `{ t } from '$lib/i18n'` and use `$t.section.key` in templates
- Import `{ locale } from '$lib/stores/locale'` to toggle language
- Language toggle button in dashboard topbar shows "EN" / "한국어"
- Language toggle also available in Settings page

## Pages Translated
- Login page, main Dashboard, Node Dashboard, Settings
- Breadcrumb component, dashboard layout sidebar

## CSS Variables (from app.css)
- `--bg-primary`, `--bg-sidebar`, `--bg-card`, `--bg-secondary`
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--border-color`, `--border-color-light`
- `--accent` (#4A3BFF), `--error`, `--row-hover`
