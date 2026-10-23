import { PlaceholderLine } from "@/components/placeholder-line";

const RESULT_ROWS = 6;
const FACET_ROWS = 6;

export default function SearchLoading() {
  return (
    <main aria-busy="true" className="page-width pt-4 pb-10">
      <p role="status" className="sr-only">
        Szukam
      </p>
      <PlaceholderLine className="w-30 text-title" />
      <PlaceholderLine className="mt-1 w-15" />
      <div className="mt-5 grid gap-8 md:grid-cols-[240px_1fr]">
        <ul className="md:col-start-2">
          {Array.from({ length: RESULT_ROWS }, (_, index) => (
            <ResultRowPlaceholder key={index} />
          ))}
        </ul>
        <div className="grid content-start gap-5 md:col-start-1 md:row-start-1">
          <FacetPlaceholder />
          <FacetPlaceholder />
        </div>
      </div>
    </main>
  );
}

function ResultRowPlaceholder() {
  return (
    <li className="grid grid-cols-[72px_1fr] gap-x-2 gap-y-1 py-1.5 md:grid-cols-[96px_1fr_160px_200px] md:items-center md:gap-x-3">
      <div className="placeholder size-9 max-md:row-span-3 md:size-12" />
      <div>
        <PlaceholderLine className="w-full max-w-60" />
        <PlaceholderLine className="w-15 text-small" />
      </div>
      <div>
        <PlaceholderLine className="w-12 font-semibold" />
        <PlaceholderLine className="w-10 text-small" />
      </div>
      <div className="placeholder rounded-box px-3 py-1.5 text-small font-semibold justify-self-start md:justify-self-end">
        <span className="invisible">Dodaj do koszyka</span>
      </div>
    </li>
  );
}

function FacetPlaceholder() {
  return (
    <div>
      <PlaceholderLine className="mb-1 w-12" />
      {Array.from({ length: FACET_ROWS }, (_, index) => (
        <div key={index} className="flex justify-between gap-2">
          <PlaceholderLine className="w-20" />
          <PlaceholderLine className="w-3" />
        </div>
      ))}
    </div>
  );
}
