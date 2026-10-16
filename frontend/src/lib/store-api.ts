import { type } from "arktype";
import { cacheLife } from "next/cache";
import { decodeHtmlEntities } from "./html-entities";

const PRODUCTS_PER_PAGE = 24;
const PRODUCT_SUMMARY_FIELDS = "id,name,slug,permalink,type,sku,price_html,is_in_stock,images";

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
  type: "string",
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

const departmentProfile = type({
  id: "number",
  name: textWithEntities,
  permalink: "string",
  count: "number",
  description: "string",
  image: image.or("null"),
});
export type DepartmentProfile = typeof departmentProfile.infer;

export async function getDepartmentProfile(categoryId: number) {
  "use cache";
  cacheLife("default");

  const fields = "id,name,permalink,count,description,image";
  const response = await getFromStoreApi(`/products/categories/${categoryId}?_fields=${fields}`);
  return departmentProfile.assert(await response.json());
}

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

  const response = await getFromStoreApi(
    `/products?category=${categoryId}&page=${page}&per_page=${PRODUCTS_PER_PAGE}&_fields=${PRODUCT_SUMMARY_FIELDS}`,
  );
  const products = productSummary.array().assert(await response.json());
  const totalPages = Number(response.headers.get("X-WP-TotalPages"));
  return { products, totalPages };
}

export async function listBestsellersInStock(categoryId: number, count: number) {
  "use cache";
  cacheLife("default");

  const response = await getFromStoreApi(
    `/products?category=${categoryId}&orderby=popularity&stock_status=instock&per_page=${count}&_fields=${PRODUCT_SUMMARY_FIELDS}`,
  );
  return productSummary.array().assert(await response.json());
}

export async function searchProducts(query: string) {
  "use cache";
  cacheLife("default");

  const response = await getFromStoreApi(
    `/products?search=${encodeURIComponent(query)}&per_page=${PRODUCTS_PER_PAGE}&_fields=${PRODUCT_SUMMARY_FIELDS}`,
  );
  const products = productSummary.array().assert(await response.json());
  const total = Number(response.headers.get("X-WP-Total"));
  return { products, total };
}

export async function countProducts() {
  "use cache";
  cacheLife("default");

  const response = await getFromStoreApi("/products?per_page=1&_fields=id");
  return Number(response.headers.get("X-WP-Total"));
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

export function wordpressUrl(path: string) {
  const siteUrl = process.env.WP_URL;
  if (!siteUrl) {
    throw new Error("WP_URL is missing, copy .env.example to .env");
  }
  return `${siteUrl}${path}`;
}

const RATE_LIMIT_RETRIES = 3;
const RATE_LIMIT_WAIT_MS = 5000;

let previousRequest: Promise<unknown> = Promise.resolve();

function getFromStoreApi(path: string) {
  const afterPreviousRequest = previousRequest.catch(() => undefined);
  const request = afterPreviousRequest.then(() => fetchWithRateLimitRetry(path));
  previousRequest = request;
  return request;
}

async function fetchWithRateLimitRetry(path: string) {
  const url = wordpressUrl(`/wp-json/wc/store/v1${path}`);
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url);
    if (response.ok) {
      return response;
    }
    const isRateLimited = response.status === 429;
    const hasRetriesLeft = attempt < RATE_LIMIT_RETRIES;
    if (!isRateLimited || !hasRetriesLeft) {
      throw new Error(`Store API ${path} responded with ${response.status}`);
    }
    await sleep(rateLimitWaitMs(response));
  }
}

function rateLimitWaitMs(response: Response) {
  const retryAfterSeconds = Number(response.headers.get("retry-after"));
  if (retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }
  return RATE_LIMIT_WAIT_MS;
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
