"use server";

import { type } from "arktype";
import { toLocalPath } from "@/lib/catalog-paths";
import { MAX_QUERY_LENGTH, MIN_SUGGESTION_QUERY_LENGTH } from "@/lib/search-suggestions";
import { searchProducts } from "@/lib/store-api";

const PRODUCT_SUGGESTIONS = 5;

const suggestionQuery = type("string")
  .pipe((text) => text.trim())
  .to(`${MIN_SUGGESTION_QUERY_LENGTH} <= string <= ${MAX_QUERY_LENGTH}`);

export async function suggestProducts(untrustedQuery: string) {
  const query = suggestionQuery.assert(untrustedQuery);
  const { products, total } = await searchProducts(query, undefined, 1);

  const suggestions = products.slice(0, PRODUCT_SUGGESTIONS).map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    priceHtml: product.price_html,
    image: product.images.at(0),
    path: toLocalPath(product.permalink),
  }));
  return { query, total, products: suggestions };
}
