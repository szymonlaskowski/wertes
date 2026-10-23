import { PlaceholderLine } from "@/components/placeholder-line";

const BREADCRUMB_ITEMS = 2;
const SHELF_TILES = 8;
const PRODUCT_TILES = 12;
const SORT_OPTIONS = 4;
const SIZE_SQUARES = 12;
const CHECK_ROWS = 6;

export default function CategoryLoading() {
  return (
    <main aria-busy="true" className="page-width pt-3 pb-10">
      <p role="status" className="sr-only">
        Ładuję kategorię
      </p>
      <div className="flex gap-x-3">
        {Array.from({ length: BREADCRUMB_ITEMS }, (_, index) => (
          <PlaceholderLine key={index} className="w-12 text-small" />
        ))}
      </div>
      <PlaceholderLine className="mt-3 w-40 text-title lg:w-100" />
      <PlaceholderLine className="mt-1 w-15" />
      <div className="mt-5 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: SHELF_TILES }, (_, index) => (
          <div key={index} className="placeholder h-8" />
        ))}
      </div>
      <CategoryResultsPlaceholder />
    </main>
  );
}

export function CategoryResultsPlaceholder() {
  return (
    <div aria-hidden="true" aria-busy="true" className="mt-5 grid gap-8 md:grid-cols-[240px_1fr]">
      <div className="md:col-start-2">
        <div className="flex flex-wrap justify-between gap-x-4 text-small">
          <div className="flex gap-x-2">
            {Array.from({ length: SORT_OPTIONS }, (_, index) => (
              <PlaceholderLine key={index} className="w-10" />
            ))}
          </div>
          <PlaceholderLine className="w-12" />
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-4">
          {Array.from({ length: PRODUCT_TILES }, (_, index) => (
            <ProductTilePlaceholder key={index} />
          ))}
        </ul>
      </div>
      <div className="grid content-start gap-5 md:col-start-1 md:row-start-1">
        <ChecksPlaceholder />
        <SizesPlaceholder />
        <ChecksPlaceholder />
      </div>
    </div>
  );
}

function ProductTilePlaceholder() {
  return (
    <li>
      <div className="placeholder aspect-square" />
      <PlaceholderLine className="mt-1 w-10 text-small" />
      <div className="mt-0.5 min-h-[3lh]">
        <PlaceholderLine className="w-full" />
        <PlaceholderLine className="w-2/3" />
      </div>
      <PlaceholderLine className="mt-1 w-12 font-semibold" />
      <PlaceholderLine className="w-10 text-small" />
      <div className="placeholder mt-2 h-5 w-20" />
    </li>
  );
}

function SizesPlaceholder() {
  return (
    <div>
      <PlaceholderLine className="mb-1 w-10 font-semibold" />
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: SIZE_SQUARES }, (_, index) => (
          <div key={index} className="placeholder size-6" />
        ))}
      </div>
    </div>
  );
}

function ChecksPlaceholder() {
  return (
    <div>
      <PlaceholderLine className="mb-1 w-10 font-semibold" />
      {Array.from({ length: CHECK_ROWS }, (_, index) => (
        <div key={index} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <div className="placeholder size-2" />
            <PlaceholderLine className="w-15" />
          </div>
          <PlaceholderLine className="w-3" />
        </div>
      ))}
    </div>
  );
}
