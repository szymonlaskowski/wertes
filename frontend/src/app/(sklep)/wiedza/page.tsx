import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageTitle } from "@/components/page-title";
import { Pager } from "@/components/pager";
import { formatArticleDate } from "@/lib/article-date";
import { type Article, articleExcerpt, articleImage, articlePath, listArticles } from "@/lib/articles";
import { bindSingleLetterWords } from "@/lib/typography";
import { ArticleListPlaceholder } from "./loading";

export const metadata: Metadata = { title: "Wiedza" };

export default function KnowledgePage(props: PageProps<"/wiedza">) {
  return (
    <main className="page-width pt-4 pb-10">
      <PageTitle>wiedza</PageTitle>
      <p className="mt-1 text-mute">Poradniki o doborze odzieży, rękawic i&nbsp;sprzętu BHP.</p>
      <Suspense fallback={<ArticleListPlaceholder />}>
        <ArticleList searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function ArticleList({ searchParams }: { searchParams: PageProps<"/wiedza">["searchParams"] }) {
  const page = readPage((await searchParams).strona);
  const { articles, total, perPage } = await listArticles(page);
  if (articles.length === 0) {
    notFound();
  }

  const [leadArticle, ...otherArticles] = articles;
  const showLeadArticle = page === 1;
  const gridArticles = showLeadArticle ? otherArticles : articles;

  return (
    <>
      {showLeadArticle && <LeadArticle article={leadArticle} />}
      <ul className="mt-8 grid gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {gridArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </ul>
      <Pager
        label="Strony artykułów"
        page={page}
        perPage={perPage}
        total={total}
        pageUrl={(pageNumber) => (pageNumber === 1 ? "/wiedza/" : `/wiedza/?strona=${pageNumber}`)}
      />
    </>
  );
}

function LeadArticle({ article }: { article: Article }) {
  const image = articleImage(article);

  return (
    <Link href={articlePath(article)} className="group mt-6 grid items-center gap-x-6 gap-y-3 md:grid-cols-[7fr_5fr]">
      <div className="relative aspect-3/2 overflow-hidden">
        {image && (
          <Image src={image.source_url} alt={image.alt_text} fill preload sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
        )}
      </div>
      <div>
        <ArticleDate article={article} />
        <h2 className="mt-1 text-title">
          <span className="link-line">{bindSingleLetterWords(article.title.rendered)}</span>
        </h2>
        <p className="mt-2 line-clamp-5 text-mute">{articleExcerpt(article)}</p>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const image = articleImage(article);

  return (
    <li>
      <Link href={articlePath(article)} className="block">
        <div className="relative aspect-3/2 overflow-hidden">
          {image && (
            <Image src={image.source_url} alt={image.alt_text} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
          )}
        </div>
        <ArticleDate article={article} className="mt-2" />
        <p className="mt-0.5 font-semibold">
          <span className="link-line">{bindSingleLetterWords(article.title.rendered)}</span>
        </p>
      </Link>
    </li>
  );
}

function ArticleDate({ article, className = "" }: { article: Article; className?: string }) {
  return (
    <time dateTime={article.date} className={`block text-small text-mute tabular-nums ${className}`}>
      {formatArticleDate(article.date)}
    </time>
  );
}

function readPage(value: string | string[] | undefined) {
  const page = Number(value);
  const isValidPage = Number.isInteger(page) && page >= 1;
  if (!isValidPage) {
    return 1;
  }
  return page;
}
