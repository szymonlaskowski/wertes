import { type } from "arktype";
import { toLocalPath } from "../src/lib/catalog-paths";

const wordpressUrl = process.env.WP_URL;
const shopUrl = process.argv[2];
if (!wordpressUrl) {
  throw new Error("WP_URL is missing, copy .env.example to .env");
}
if (!shopUrl) {
  throw new Error("Pass the shop address, for example: bun run warm-cache https://sklep.wertes.pl");
}

const categories = await listCategoryPermalinks(wordpressUrl);
console.log(`Warming ${categories.length} categories on ${shopUrl}`);

for (const [index, permalink] of categories.entries()) {
  const path = toLocalPath(permalink);
  const startedAt = Date.now();
  const response = await fetch(`${shopUrl}${path}`);
  await response.text();
  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`${index + 1}/${categories.length} ${response.status} ${seconds}s ${path}`);
}

async function listCategoryPermalinks(siteUrl: string) {
  const response = await fetch(`${siteUrl}/wp-json/wc/store/v1/products/categories?_fields=permalink,count`);
  if (!response.ok) {
    throw new Error(`Category list responded with ${response.status}`);
  }
  const categoryList = type({ permalink: "string", count: "number" }).array().assert(await response.json());
  const nonEmptyCategories = categoryList.filter((category) => category.count > 0);
  return nonEmptyCategories.map((category) => category.permalink);
}
