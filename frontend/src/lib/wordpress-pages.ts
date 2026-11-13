import { type } from "arktype";
import { cacheLife } from "next/cache";
import { cleanArticleHtml, LIVE_SHOP_URL } from "./articles";
import { decodeHtmlEntities } from "./html-entities";
import { getFromWordpress } from "./store-api";

export const CONTENT_PAGE_SLUGS = [
  "regulamin",
  "polityka-prywatnosci",
  "zwroty-i-wymiany",
  "reklamacje",
  "rabaty-na-duze-zamowienia",
  "znakowanie-odziezy",
  "tabele-rozmiarow",
  "tabela-rozmiarow-base",
  "tabela-rozmiarow-portwest",
  "tabela-rozmiarow-rawpol",
];

const LOCAL_PAGE_SLUGS = [...CONTENT_PAGE_SLUGS, "o-nas", "kontakt"];

const textWithEntities = type("string").pipe(decodeHtmlEntities);

const contentPage = type({
  title: { rendered: textWithEntities },
  content: { rendered: "string" },
});

const aboutPage = type({
  acf: {
    about_us_title: "string",
    about_us_text_left: "string",
    about_us_text_right: "string",
  },
});

export async function findContentPage(slug: string) {
  "use cache";
  cacheLife("default");

  const matches = contentPage.array().assert(await readWordpressPages(slug, "title,content"));
  return matches.at(0);
}

export async function readAboutPage() {
  "use cache";
  cacheLife("default");

  const matches = aboutPage.array().assert(await readWordpressPages("o-nas", "acf"));
  const page = matches.at(0);
  if (!page) {
    throw new Error("WordPress has no o-nas page");
  }
  return page.acf;
}

async function readWordpressPages(slug: string, fields: string) {
  const path = `/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=${fields}`;
  const response = await getFromWordpress(path);
  if (!response.ok) {
    throw new Error(`WordPress ${path} responded with ${response.status}`);
  }
  const pages: unknown = await response.json();
  return pages;
}

export function cleanPageHtml(wordpressHtml: string, siteUrl: string) {
  const withoutDuplicateTitle = cleanArticleHtml(wordpressHtml, siteUrl).replace(/<h1[\s\S]*?<\/h1>/g, "");
  let cleanHtml = withoutDuplicateTitle;
  for (const shopUrl of [siteUrl, LIVE_SHOP_URL]) {
    for (const slug of LOCAL_PAGE_SLUGS) {
      cleanHtml = cleanHtml.replaceAll(`href="${shopUrl}/${slug}/`, `href="/${slug}/`);
      cleanHtml = cleanHtml.replaceAll(`href="${shopUrl}/${slug}"`, `href="/${slug}/"`);
    }
  }
  return cleanHtml;
}
