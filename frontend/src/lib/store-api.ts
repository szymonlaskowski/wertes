import { type } from "arktype";
import { cacheLife } from "next/cache";
import { decodeHtmlEntities } from "./html-entities";

const PRODUCTS_PER_PAGE = 24;

const textWithEntities = type("string").pipe(decodeHtmlEntities);

const image = type({ src: "string", alt: "string" });

const category = type({
  id: "number",
  name: textWithEntities,
  slug: "string",
  parent: "number",
  count: "number",
  permalink: "string",
});
export type Category = typeof category.infer;

const productSummary = type({
  id: "number",
  name: textWithEntities,
  slug: "string",
  permalink: "string",
  sku: "string",
  price_html: "string",
  is_in_stock: "boolean",
  images: image.array(),
});
export type ProductSummary = typeof productSummary.infer;

const product = productSummary.merge({
  description: "string",
  categories: type({ name: textWithEntities, link: "string" }).array(),
  attributes: type({
    name: textWithEntities,
    terms: type({ name: textWithEntities }).array(),
  }).array(),
});

export async function listCategories() {
  "use cache";
  cacheLife("default");

  const fields = "id,name,slug,parent,count,permalink";
  const response = await getFromStoreApi(`/products/categories?_fields=${fields}`);
  return category.array().assert(await response.json());
}

export async function listProductsInCategory(categoryId: number, page: number) {
  "use cache";
  cacheLife("default");

  const fields = "id,name,slug,permalink,sku,price_html,is_in_stock,images";
  const response = await getFromStoreApi(
    `/products?category=${categoryId}&page=${page}&per_page=${PRODUCTS_PER_PAGE}&_fields=${fields}`,
  );
  const products = productSummary.array().assert(await response.json());
  const totalPages = Number(response.headers.get("X-WP-TotalPages"));
  return { products, totalPages };
}

export async function findProductBySlug(slug: string) {
  "use cache";
  cacheLife("default");

  const response = await getFromStoreApi(`/products?slug=${encodeURIComponent(slug)}`);
  const matches = product.array().assert(await response.json());
  return matches.at(0);
}

export async function findAnyProductPermalink() {
  "use cache";
  cacheLife("default");

  const response = await getFromStoreApi("/products?per_page=1&_fields=permalink");
  const products = type({ permalink: "string" })
    .array()
    .assert(await response.json());
  const firstProduct = products.at(0);
  if (!firstProduct) {
    throw new Error("Store API returned no products");
  }
  return firstProduct.permalink;
}

async function getFromStoreApi(path: string) {
  const wordpressUrl = process.env.WP_URL;
  if (!wordpressUrl) {
    throw new Error("WP_URL is missing, copy .env.example to .env");
  }

  const response = await fetch(`${wordpressUrl}/wp-json/wc/store/v1${path}`);
  if (!response.ok) {
    throw new Error(`Store API ${path} responded with ${response.status}`);
  }
  return response;
}
