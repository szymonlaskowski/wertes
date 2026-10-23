import { type } from "arktype";
import { cacheLife } from "next/cache";
import { decodeHtmlEntities } from "./html-entities";
import { getFromWordpress } from "./store-api";

export const ARTICLES_PER_PAGE = 7;
const LIVE_SHOP_URL = "https://wertes.pl";
const WORDS_READ_PER_MINUTE = 200;

const textWithEntities = type("string").pipe(decodeHtmlEntities);
const featuredMedia = type({ source_url: "string", alt_text: "string" });

const articleSummary = type({
  date: "string",
  slug: "string",
  title: { rendered: textWithEntities },
  excerpt: { rendered: "string" },
  "_embedded?": { "wp:featuredmedia?": featuredMedia.array() },
});
export type Article = typeof articleSummary.infer;

const articleWithContent = articleSummary.merge({ content: { rendered: "string" } });

const SUMMARY_FIELDS = "date,slug,title,excerpt,_links,_embedded";

export async function listLatestArticles(count: number) {
  const { articles } = await listArticles(1, count);
  return articles;
}

export async function listArticles(page: number, perPage = ARTICLES_PER_PAGE) {
  "use cache";
  cacheLife("default");

  const path = `/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_embed=wp:featuredmedia&_fields=${SUMMARY_FIELDS}`;
  const response = await getFromWordpress(path);
  const isPastLastPage = response.status === 400;
  if (isPastLastPage) {
    return { articles: [], total: 0, perPage };
  }
  if (!response.ok) {
    throw new Error(`WordPress ${path} responded with ${response.status}`);
  }
  const total = Number(response.headers.get("X-WP-Total"));
  return { articles: articleSummary.array().assert(await response.json()), total, perPage };
}

export async function searchArticles(query: string, count: number) {
  "use cache: remote";
  cacheLife("default");

  const params = new URLSearchParams({ search: query, per_page: String(count), _embed: "wp:featuredmedia", _fields: SUMMARY_FIELDS });
  const response = await getFromWordpress(`/wp-json/wp/v2/posts?${params}`);
  if (!response.ok) {
    throw new Error(`WordPress article search for ${query} responded with ${response.status}`);
  }
  return articleSummary.array().assert(await response.json());
}

export async function findArticleBySlug(slug: string) {
  "use cache";
  cacheLife("default");

  const path = `/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia&_fields=${SUMMARY_FIELDS},content`;
  const response = await getFromWordpress(path);
  if (!response.ok) {
    throw new Error(`WordPress ${path} responded with ${response.status}`);
  }
  const matches = articleWithContent.array().assert(await response.json());
  return matches.at(0);
}

export function articlePath(article: Article) {
  return `/wiedza/${article.slug}/`;
}

export function articleImage(article: Article) {
  return article._embedded?.["wp:featuredmedia"]?.at(0);
}

export function articleExcerpt(article: Article) {
  const text = decodeHtmlEntities(article.excerpt.rendered.replace(/<[^>]+>/g, ""));
  return text.replace(/\s*\[…\]\s*$/, "…").trim();
}

export function readingMinutes(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_READ_PER_MINUTE));
}

export function cleanArticleHtml(wordpressHtml: string, siteUrl: string) {
  const withoutLightboxIcons = wordpressHtml.replace(/<a[^>]*wpcp-lightbox-trigger[\s\S]*?<\/a>/g, "");
  let cleanHtml = withoutLightboxIcons.replace(/\sstyle="[^"]*"/g, "");
  for (const shopUrl of [siteUrl, LIVE_SHOP_URL]) {
    cleanHtml = cleanHtml.replaceAll(`href="${shopUrl}/produkt`, 'href="/produkt');
  }
  return cleanHtml;
}

export function linkedProductSlugs(html: string) {
  const slugs: string[] = [];
  for (const match of html.matchAll(/href="\/produkt\/([^"?#]+)"/g)) {
    const segments = match[1].split("/").filter(Boolean);
    const slug = segments.at(-1);
    if (slug && !slugs.includes(slug)) {
      slugs.push(slug);
    }
  }
  return slugs;
}
