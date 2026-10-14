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
