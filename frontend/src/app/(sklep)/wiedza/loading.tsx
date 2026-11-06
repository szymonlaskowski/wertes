import { PlaceholderLine } from "@/components/placeholder-line";

const ARTICLE_CARDS = 6;

export default function KnowledgeLoading() {
  return (
    <main aria-busy="true" className="page-width pt-4 pb-10">
      <p role="status" className="sr-only">
        Ładuję artykuły
      </p>
      <PlaceholderLine className="w-20 text-title" />
      <PlaceholderLine className="mt-1 w-50" />
      <ArticleListPlaceholder />
    </main>
  );
}

export function ArticleListPlaceholder() {
  return (
    <div aria-hidden="true" aria-busy="true">
      <div className="mt-6 grid items-center gap-x-6 gap-y-3 md:grid-cols-[7fr_5fr]">
        <div className="placeholder aspect-3/2" />
        <div>
          <PlaceholderLine className="w-15 text-small" />
          <PlaceholderLine className="mt-1 w-full text-title" />
          <PlaceholderLine className="w-2/3 text-title" />
          <div className="mt-2">
            <PlaceholderLine className="w-full" />
            <PlaceholderLine className="w-full" />
            <PlaceholderLine className="w-1/2" />
          </div>
        </div>
      </div>
      <ul className="mt-8 grid gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: ARTICLE_CARDS }, (_, index) => (
          <li key={index}>
            <div className="placeholder aspect-3/2" />
            <PlaceholderLine className="mt-2 w-15 text-small" />
            <PlaceholderLine className="mt-0.5 w-full font-semibold" />
            <PlaceholderLine className="w-2/3 font-semibold" />
          </li>
        ))}
      </ul>
    </div>
  );
}
