import { type } from "arktype";
import { cacheLife } from "next/cache";
import { decodeHtmlEntities } from "./html-entities";
import { wordpressUrl } from "./store-api";

const article = type({
  date: "string",
  link: "string",
  title: { rendered: type("string").pipe(decodeHtmlEntities) },
});
export type Article = typeof article.infer;

export async function listLatestArticles(count: number) {
  "use cache";
  cacheLife("default");

  const path = `/wp-json/wp/v2/posts?per_page=${count}&_fields=date,link,title`;
  const response = await fetch(wordpressUrl(path));
  if (!response.ok) {
    throw new Error(`WordPress ${path} responded with ${response.status}`);
  }
  return article.array().assert(await response.json());
}
