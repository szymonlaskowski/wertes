import type { Article } from "@/lib/articles";
import { AsideSection } from "./aside-section";

const articleDate = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function LatestArticles({ articles }: { articles: Article[] }) {
  return (
    <AsideSection
      id="artykuly"
      title="Artykuły"
      lead={<>Jak dobrać rękawice, okulary i&nbsp;odzież do&nbsp;pracy.</>}
    >
      <ol className="grid gap-2 md:grid-cols-2 md:gap-x-5">
        {articles.map((article) => (
          <li key={article.link}>
            <a href={article.link} className="block">
              <time dateTime={article.date} className="block text-small text-mute tabular-nums">
                {articleDate.format(new Date(article.date))}
              </time>
              <span className="link-line">{article.title.rendered}</span>
            </a>
          </li>
        ))}
      </ol>
    </AsideSection>
  );
}
