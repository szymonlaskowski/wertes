import Image from "next/image";
import Link from "next/link";
import { type Article, articleImage, articlePath, searchArticles } from "@/lib/articles";
import type { Category } from "@/lib/store-api";

const RELATED_ARTICLES = 3;

export async function CategoryGuide({ category, descriptionHtml }: { category: Category; descriptionHtml: string }) {
  const articles = await searchArticles(category.name, RELATED_ARTICLES);
  const hasDescription = descriptionHtml !== "";
  if (!hasDescription && articles.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="zanim-wybierzesz" className="mt-10 grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 id="zanim-wybierzesz" className="text-title">
          Zanim wybierzesz
        </h2>
        {hasDescription && <div className="article-body mt-2" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />}
      </div>
      {articles.length > 0 && <RelatedArticles articles={articles} />}
    </section>
  );
}

function RelatedArticles({ articles }: { articles: Article[] }) {
  return (
    <div>
      <h3 className="font-semibold">Z bloga</h3>
      <ul className="mt-1 grid gap-3">
        {articles.map((article) => (
          <li key={article.slug}>
            <RelatedArticle article={article} />
          </li>
        ))}
      </ul>
      <Link href="/wiedza/" className="mt-3 inline-block font-semibold link-line">
        Wszystkie artykuły
      </Link>
    </div>
  );
}

function RelatedArticle({ article }: { article: Article }) {
  const image = articleImage(article);

  return (
    <Link href={articlePath(article)} className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-2">
      <span className="relative block aspect-4/3">
        {image && <Image src={image.source_url} alt="" fill sizes="96px" className="object-cover" />}
      </span>
      <span className="font-semibold link-line">{article.title.rendered}</span>
    </Link>
  );
}
