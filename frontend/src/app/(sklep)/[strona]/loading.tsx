import { PlaceholderLine } from "@/components/placeholder-line";

const TEXT_LINES = 8;

export default function ContentPageLoading() {
  return (
    <main aria-busy="true" className="page-width pt-3 pb-10">
      <p role="status" className="sr-only">
        Ładuję stronę
      </p>
      <PlaceholderLine className="w-30 text-title" />
      <div aria-hidden="true" className="mt-5 max-w-[68ch]">
        {Array.from({ length: TEXT_LINES }, (_, index) => (
          <PlaceholderLine key={index} className="w-full" />
        ))}
      </div>
    </main>
  );
}
