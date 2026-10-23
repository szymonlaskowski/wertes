import Image from "next/image";
import Link from "next/link";
import { type Article, articleImage, articlePath } from "@/lib/articles";
import { formatArticleDate } from "@/lib/article-date";

export function LatestArticles({ articles }: { articles: Article[] }) {
  return (
    <section aria-labelledby="wiedza" className="page-width py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="wiedza" className="text-title">
          Wiedza, która pomaga wybrać
        </h2>
        <Link href="/wiedza/" className="font-semibold link-line">
          Wszystkie artykuły
        </Link>
      </div>
      <ol className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </ol>
    </section>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const image = articleImage(article);

  return (
    <li>
      <Link href={articlePath(article)} className="block">
        <span className="relative block aspect-4/3 overflow-hidden">
          {image && (
            <Image src={image.source_url} alt={image.alt_text} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
          )}
        </span>
        <time dateTime={article.date} className="mt-1.5 block text-small text-mute tabular-nums">
          {formatArticleDate(article.date)}
        </time>
        <span className="font-semibold link-line">{article.title.rendered}</span>
      </Link>
    </li>
  );
}
