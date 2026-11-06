import { PlaceholderLine } from "@/components/placeholder-line";

const THUMBNAILS = 4;
const SIZES = 4;
const PARAMETER_ROWS = 6;
const DESCRIPTION_LINES = 4;
const SHELF_TILES = 4;

export default function ProductLoading() {
  return (
    <main aria-busy="true" className="page-width pt-3 pb-10">
      <p role="status" className="sr-only">
        Ładuję produkt
      </p>
      <div className="flex flex-wrap gap-x-3">
        <PlaceholderLine className="w-12 text-small" />
        <PlaceholderLine className="w-15 text-small" />
        <PlaceholderLine className="w-20 text-small" />
      </div>
      <div className="mt-3 grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <GalleryPlaceholder />
        <div className="flex flex-col gap-3">
          <div>
            <PlaceholderLine className="w-10" />
            <PlaceholderLine className="w-full text-title" />
            <PlaceholderLine className="w-2/3 text-title" />
            <PlaceholderLine className="mt-1 w-30 text-small" />
          </div>
          <div>
            <PlaceholderLine className="w-25 text-title" />
            <PlaceholderLine className="w-15 text-small" />
          </div>
          <div className="flex items-center gap-1">
            <div className="placeholder size-1 rounded-full" />
            <PlaceholderLine className="w-25 text-small" />
          </div>
          <PurchasePlaceholder />
        </div>
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <DescriptionPlaceholder />
        <ParametersPlaceholder />
      </div>
      <ShelfPlaceholder />
    </main>
  );
}

function GalleryPlaceholder() {
  return (
    <div className="md:sticky md:top-3">
      <div className="placeholder aspect-square" />
      <div className="mt-2 flex gap-1">
        {Array.from({ length: THUMBNAILS }, (_, index) => (
          <div key={index} className="placeholder size-8" />
        ))}
      </div>
    </div>
  );
}

function PurchasePlaceholder() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <PlaceholderLine className="mb-1 w-10" />
        <div className="flex gap-1">
          {Array.from({ length: SIZES }, (_, index) => (
            <div key={index} className="placeholder size-6" />
          ))}
        </div>
      </div>
      <div className="flex items-end gap-1">
        <div>
          <PlaceholderLine className="w-5" />
          <div className="placeholder mt-1 h-6 w-10" />
        </div>
        <div className="placeholder rounded-box px-3 py-1.5 text-small font-semibold">
          <span className="invisible">Dodaj do koszyka</span>
        </div>
      </div>
    </div>
  );
}

function ParametersPlaceholder() {
  return (
    <div>
      <PlaceholderLine className="mb-2 w-12" />
      <div className="grid gap-y-1">
        {Array.from({ length: PARAMETER_ROWS }, (_, index) => (
          <div key={index} className="grid grid-cols-2 gap-x-4">
            <PlaceholderLine className="w-3/4" />
            <PlaceholderLine className="w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DescriptionPlaceholder() {
  return (
    <div className="max-w-prose">
      <PlaceholderLine className="mb-2 w-12" />
      {Array.from({ length: DESCRIPTION_LINES }, (_, index) => {
        const isLastLine = index === DESCRIPTION_LINES - 1;
        return <PlaceholderLine key={index} className={isLastLine ? "w-1/2" : "w-full"} />;
      })}
    </div>
  );
}

function ShelfPlaceholder() {
  return (
    <div className="mt-10">
      <PlaceholderLine className="mb-3 w-60 max-w-full text-title" />
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4">
        {Array.from({ length: SHELF_TILES }, (_, index) => (
          <TilePlaceholder key={index} />
        ))}
      </ul>
    </div>
  );
}

function TilePlaceholder() {
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
    </li>
  );
}
