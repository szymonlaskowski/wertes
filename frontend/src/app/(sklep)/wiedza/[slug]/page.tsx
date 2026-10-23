import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageTitle } from "@/components/page-title";
import { priceClassName } from "@/components/price";
import { formatArticleDate } from "@/lib/article-date";
import {
  articleImage,
  articlePath,
  cleanArticleHtml,
  findArticleBySlug,
  linkedProductSlugs,
  listArticles,
  readingMinutes,
} from "@/lib/articles";
import { toLocalPath } from "@/lib/catalog-paths";
import { findProductBySlug, wordpressUrl } from "@/lib/store-api";
import { bindSingleLetterWords } from "@/lib/typography";

const LINKED_PRODUCTS = 4;
const OTHER_ARTICLES = 4;

export async function generateStaticParams() {
  const { articles } = await listArticles(1);
  return articles.slice(0, 1).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata(props: PageProps<"/wiedza/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await loadArticle(slug);
  return { title: article.title.rendered };
}

export default async function ArticlePage(props: PageProps<"/wiedza/[slug]">) {
  const { slug } = await props.params;
  const article = await loadArticle(slug);
  const image = articleImage(article);
  const contentHtml = cleanArticleHtml(article.content.rendered, wordpressUrl(""));

  return (
    <main className="page-width pt-3 pb-10">
      <nav aria-label="Ścieżka" className="text-small text-mute">
        <Link href="/wiedza/">
          <span className="link-line">Wiedza</span>
        </Link>
      </nav>
      <div className="mt-2 grid items-start gap-8 lg:grid-cols-[1fr_280px]">
        <article>
          <div className="max-w-[20ch] text-title">
            <PageTitle>{bindSingleLetterWords(article.title.rendered)}</PageTitle>
          </div>
          <p className="mt-2 text-small text-mute">
            <time dateTime={article.date}>{formatArticleDate(article.date)}</time>,{" "}
            {readingMinutes(contentHtml)} min czytania
          </p>
          {image && (
            <div className="relative mt-5 aspect-2/1 overflow-hidden">
              <Image src={image.source_url} alt={image.alt_text} fill preload sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" />
            </div>
          )}
          <div className="article-body mt-5" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </article>
        <aside className="grid content-start gap-5 lg:sticky lg:top-3">
          <Suspense>
            <LinkedProducts slugs={linkedProductSlugs(contentHtml).slice(0, LINKED_PRODUCTS)} />
          </Suspense>
          <Suspense>
            <OtherArticles currentSlug={article.slug} />
          </Suspense>
        </aside>
      </div>
    </main>
  );
}

async function loadArticle(slug: string) {
  const article = await findArticleBySlug(slug);
  if (!article) {
    notFound();
  }
  return article;
}

async function LinkedProducts({ slugs }: { slugs: string[] }) {
  const matches = await Promise.all(slugs.map((slug) => findProductBySlug(slug)));
  const products = matches.filter((product) => product !== undefined);
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="produkty-z-artykulu">
      <h2 id="produkty-z-artykulu" className="mb-1 font-semibold">
        Produkty z artykułu
      </h2>
      <ul className="grid gap-2">
        {products.map((product) => {
          const mainImage = product.images.at(0);
          return (
            <li key={product.id}>
              <Link href={toLocalPath(product.permalink)} className="grid grid-cols-[64px_1fr] items-center gap-x-2">
                <span className="relative size-8">
                  {mainImage && <Image src={mainImage.src} alt="" fill sizes="64px" className="object-contain" />}
                </span>
                <span>
                  <span className="line-clamp-2 text-small">
                    <span className="link-line">{product.name}</span>
                  </span>
                  <span className={`block text-small ${priceClassName}`} dangerouslySetInnerHTML={{ __html: product.price_html }} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

async function OtherArticles({ currentSlug }: { currentSlug: string }) {
  const { articles } = await listArticles(1);
  const otherArticles = articles.filter((article) => article.slug !== currentSlug).slice(0, OTHER_ARTICLES);

  return (
    <section aria-labelledby="inne-artykuly">
      <h2 id="inne-artykuly" className="mb-1 font-semibold">
        Inne artykuły
      </h2>
      <ul className="grid gap-1 text-small">
        {otherArticles.map((article) => (
          <li key={article.slug}>
            <Link href={articlePath(article)}>
              <span className="link-line">{article.title.rendered}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
