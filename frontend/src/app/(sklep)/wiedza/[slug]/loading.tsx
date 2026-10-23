import { PlaceholderLine } from "@/components/placeholder-line";

const BODY_PARAGRAPHS = 3;
const SIDEBAR_PRODUCTS = 3;
const SIDEBAR_ARTICLES = 4;

export default function ArticleLoading() {
  return (
    <main aria-busy="true" className="page-width pt-3 pb-10">
      <p role="status" className="sr-only">
        Ładuję artykuł
      </p>
      <PlaceholderLine className="w-10 text-small" />
      <div className="mt-2 grid items-start gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="max-w-[20ch] text-title">
            <PlaceholderLine className="w-full text-title" />
            <PlaceholderLine className="w-2/3 text-title" />
          </div>
          <PlaceholderLine className="mt-2 w-20 text-small" />
          <div className="placeholder mt-5 aspect-2/1" />
          <div className="mt-5 grid max-w-[68ch] gap-2">
            {Array.from({ length: BODY_PARAGRAPHS }, (_, index) => (
              <div key={index}>
                <PlaceholderLine className="w-full" />
                <PlaceholderLine className="w-full" />
                <PlaceholderLine className="w-3/4" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-5">
          <div>
            <PlaceholderLine className="mb-1 w-20 font-semibold" />
            <div className="grid gap-2">
              {Array.from({ length: SIDEBAR_PRODUCTS }, (_, index) => (
                <div key={index} className="grid grid-cols-[64px_1fr] items-center gap-x-2">
                  <div className="placeholder size-8" />
                  <div>
                    <PlaceholderLine className="w-full text-small" />
                    <PlaceholderLine className="w-12 text-small" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <PlaceholderLine className="mb-1 w-15 font-semibold" />
            {Array.from({ length: SIDEBAR_ARTICLES }, (_, index) => (
              <PlaceholderLine key={index} className="w-full text-small" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
