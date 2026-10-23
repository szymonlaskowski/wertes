# Wertes front

Headless front for the Wertes WooCommerce shop. Next.js 16 (App Router, Cache Components), Tailwind, bun.

Data comes from the WooCommerce Store API (`/wp-json/wc/store/v1`), fetched on the server in `src/lib/store-api.ts` and cached for 15 minutes (`cacheLife("default")`). URLs mirror WordPress:

- `/produkty/<category path>/` and `/produkty/<category path>/page/<n>/`
- `/produkt/<category path>/<slug>/`

Shop pages use `ensureStatic = "navigation"`: the first visit to a URL renders the full page, every later visit is served from the cache.

```sh
cp .env.example .env
bun install
bun dev
bun test
```

`WP_URL` in `.env` points at the WordPress instance (staging by default, or a local DDEV site).

The cache lives in the server's memory, so it is empty after every deploy or restart, and WordPress lets through about two requests a second. Warm every category after a deploy, so no customer waits for the first render (about 10 minutes, roughly 1.5 s per category):

```sh
bun run warm-cache https://<shop address>
```

## Design rules

Tokens live in `src/app/globals.css`. Its `@theme` resets Tailwind's defaults, so only these exist: colors `ink mute paper surface accent in-stock`, text `display title body small`, an 8px spacing unit, radius `box`.

- Page column: `page-width`. A `<main>` adds `pt-3` when it opens with a breadcrumb, `pt-4` when it opens with a title, and always `pb-10`.
- Sections: `mt-10` inside a page, `py-10` for full-width home bands.
- Section heading: `text-title`, then `mt-2` to text and `mt-4` to a grid. A heading with a lede uses `mt-1 text-mute` for the lede.
- Sub-heading: `font-semibold`, then `mt-1` or `mb-1` to its content.
- Text links: `link-line` (underline grows on hover). Cards and buttons never underline.
- Buttons: `Button` from `src/components/button.tsx`, `mt-4` after a paragraph.
- Long-form HTML from WordPress: `article-body`.
