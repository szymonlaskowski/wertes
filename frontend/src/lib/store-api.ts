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
  categories: type({ id: "number" }).array(),
  attributes: type({
    name: textWithEntities,
    has_variations: "boolean",
    terms: type({ name: textWithEntities, slug: "string" }).array(),
  }).array(),
  variations: type({
    id: "number",
    attributes: type({ name: textWithEntities, value: "string | null" }).array(),
  }).array(),
});
export type Product = typeof product.infer;

const categoryDescription = type({ description: "string" });

export async function getCategoryDescription(categoryId: number) {
  "use cache";
  cacheLife("default");

  const response = await getFromStoreApi(`/products/categories/${categoryId}?_fields=description`);
  return categoryDescription.assert(await response.json()).description;
}

export async function listCategories() {
  "use cache";
  cacheLife("default");

  const fields = "id,name,slug,parent,count,permalink";
  const response = await getFromStoreApi(`/products/categories?_fields=${fields}`);
  return category.array().assert(await response.json());
}

export type ProductSort = { orderby: "popularity" | "date" | "price"; order: "asc" | "desc" };
export type AttributeFilter = { taxonomy: string; slugs: string[] };

export async function listProductsInCategory(
  categoryId: number,
  filters: AttributeFilter[],
  inStockOnly: boolean,
  sort: ProductSort,
  page: number,
) {
  "use cache: remote";
  cacheLife("default");

  const params = new URLSearchParams({
    category: String(categoryId),
    orderby: sort.orderby,
    order: sort.order,
    page: String(page),
    per_page: String(PRODUCTS_PER_PAGE),
    _fields: PRODUCT_SUMMARY_FIELDS,
  });
  filters.forEach((filter, index) => {
    params.append(`attributes[${index}][attribute]`, filter.taxonomy);
    params.append(`attributes[${index}][operator]`, "in");
    for (const slug of filter.slugs) {
      params.append(`attributes[${index}][slug][]`, slug);
    }
  });
  params.set("attribute_relation", "and");
  if (inStockOnly) {
    params.set("stock_status", "instock");
  }

  const response = await getFromStoreApi(`/products?${params}`);
  const products = productSummary.array().assert(await response.json());
  const total = Number(response.headers.get("X-WP-Total"));
  return { products, total, perPage: PRODUCTS_PER_PAGE };
}

const attributeCounts = type({
  attribute_counts: type({ term: "number", count: "number" }).array(),
});
export type AttributeTermCount = (typeof attributeCounts.infer)["attribute_counts"][number];

export async function countAttributeTermsInCategory(categoryId: number, taxonomies: string[]) {
  "use cache: remote";
  cacheLife("default");

  const params = new URLSearchParams({ category: String(categoryId) });
  taxonomies.forEach((taxonomy, index) => {
    params.append(`calculate_attribute_counts[${index}][taxonomy]`, taxonomy);
    params.append(`calculate_attribute_counts[${index}][query_type]`, "or");
  });
  const response = await getFromStoreApi(`/products/collection-data?${params}`);
  return attributeCounts.assert(await response.json()).attribute_counts;
}

const ATTRIBUTE_TERMS_PER_PAGE = 1000;
const attributeTerm = type({ id: "number", name: textWithEntities, slug: "string" });
export type AttributeTerm = typeof attributeTerm.infer;

async function listAttributes() {
  "use cache";
  cacheLife("default");

  const response = await getFromStoreApi("/products/attributes");
  return type({ id: "number", taxonomy: "string" })
    .array()
    .assert(await response.json());
}

export async function listAttributeTerms(taxonomy: string) {
  "use cache: remote";
  cacheLife("default");

  const attributes = await listAttributes();
  const attribute = attributes.find((candidate) => candidate.taxonomy === taxonomy);
  if (!attribute) {
    throw new Error(`Attribute ${taxonomy} is missing in the Store API`);
  }

  const terms: AttributeTerm[] = [];
  for (let page = 1; ; page++) {
    const response = await getFromStoreApi(
      `/products/attributes/${attribute.id}/terms?per_page=${ATTRIBUTE_TERMS_PER_PAGE}&page=${page}`,
    );
    const pageTerms = attributeTerm.array().assert(await response.json());
    terms.push(...pageTerms);
    const isLastPage = pageTerms.length < ATTRIBUTE_TERMS_PER_PAGE;
    if (isLastPage) {
      return terms;
    }
  }
}

export async function listBestsellersInStock(categoryId: number, count: number) {
  "use cache";
  cacheLife("default");

  const response = await getFromStoreApi(
    `/products?category=${categoryId}&orderby=popularity&stock_status=instock&per_page=${count}&_fields=${PRODUCT_SUMMARY_FIELDS}`,
  );
  return productSummary.array().assert(await response.json());
}

export async function searchProducts(query: string, categoryId: number | undefined, page: number) {
  "use cache: remote";
  cacheLife("default");

  let path = `/products?search=${encodeURIComponent(query)}&page=${page}&per_page=${PRODUCTS_PER_PAGE}&_fields=${PRODUCT_SUMMARY_FIELDS}`;
  if (categoryId !== undefined) {
    path += `&category=${categoryId}`;
  }
  const response = await getFromStoreApi(path);
  const products = productSummary.array().assert(await response.json());
  const total = Number(response.headers.get("X-WP-Total"));
  return { products, total, perPage: PRODUCTS_PER_PAGE };
}

const searchCategoryCounts = type({
  taxonomy_counts: type({ term: "number", count: "number" }).array(),
});
export type SearchCategoryCount = (typeof searchCategoryCounts.infer)["taxonomy_counts"][number];

export async function countSearchResultsByCategory(query: string) {
  "use cache: remote";
  cacheLife("default");

  const response = await getFromStoreApi(
    `/products/collection-data?search=${encodeURIComponent(query)}&calculate_taxonomy_counts%5B%5D=product_cat`,
  );
  return searchCategoryCounts.assert(await response.json()).taxonomy_counts;
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

const RATE_LIMIT_RETRIES = 5;
const RATE_LIMIT_WAIT_MS = 1000;

let previousRequest: Promise<unknown> = Promise.resolve();

async function getFromStoreApi(path: string) {
  const response = await getFromWordpress(`/wp-json/wc/store/v1${path}`);
  if (!response.ok) {
    throw new Error(`Store API ${path} responded with ${response.status}`);
  }
  return response;
}

export function getFromWordpress(path: string) {
  const afterPreviousRequest = previousRequest.catch(() => undefined);
  const request = afterPreviousRequest.then(() => fetchWithRateLimitRetry(path));
  previousRequest = request;
  return request;
}

async function fetchWithRateLimitRetry(path: string) {
  const url = wordpressUrl(path);
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, { signal: new AbortController().signal });
    const isRateLimited = response.status === 429;
    if (!isRateLimited) {
      return response;
    }
    const hasRetriesLeft = attempt < RATE_LIMIT_RETRIES;
    if (!hasRetriesLeft) {
      throw new Error(`WordPress ${path} is still rate limited after ${RATE_LIMIT_RETRIES} retries`);
    }
    await sleep(RATE_LIMIT_WAIT_MS);
  }
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
