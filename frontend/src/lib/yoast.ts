import { type } from "arktype";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { decodeHtmlEntities } from "./html-entities";
import { getFromWordpress } from "./store-api";

const textWithEntities = type("string").pipe(decodeHtmlEntities);

export const yoastHead = type({ "title?": textWithEntities, "description?": textWithEntities });
type YoastHead = typeof yoastHead.infer;

export const YOAST_FIELDS = "yoast_head_json.title,yoast_head_json.description";

const categoryWithYoast = type({ "yoast_head_json?": yoastHead });

export async function findCategoryYoastHead(categoryId: number) {
  "use cache: remote";
  cacheLife("default");

  const path = `/wp-json/wp/v2/product_cat/${categoryId}?_fields=${YOAST_FIELDS}`;
  const response = await getFromWordpress(path);
  if (!response.ok) {
    throw new Error(`WordPress ${path} responded with ${response.status}`);
  }
  return categoryWithYoast.assert(await response.json()).yoast_head_json;
}

export function yoastMetadata(head: YoastHead | undefined, fallbackTitle: string): Metadata {
  if (head === undefined) {
    return { title: fallbackTitle };
  }
  const title = head.title === undefined ? fallbackTitle : { absolute: head.title };
  return { title, description: head.description };
}
