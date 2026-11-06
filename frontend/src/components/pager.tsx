import { Button } from "@/components/button";
import { formatCount } from "@/lib/catalog";

type PagerProps = {
  label: string;
  page: number;
  perPage: number;
  total: number;
  pageUrl: (page: number) => string;
};

export function Pager({ label, page, perPage, total, pageUrl }: PagerProps) {
  const firstShown = (page - 1) * perPage + 1;
  const lastShown = Math.min(page * perPage, total);
  const hasPrevious = page > 1;
  const hasNext = lastShown < total;
  if (!hasPrevious && !hasNext) {
    return null;
  }

  return (
    <nav aria-label={label} className="mt-6 flex flex-wrap items-center gap-3">
      {hasPrevious && (
        <Button variant="secondary" href={pageUrl(page - 1)}>
          Poprzednie {perPage}
        </Button>
      )}
      {hasNext && (
        <Button variant="secondary" href={pageUrl(page + 1)}>
          Następne {Math.min(perPage, total - lastShown)}
        </Button>
      )}
      <span className="text-small text-mute tabular-nums">
        {formatCount(firstShown)}–{formatCount(lastShown)} z {formatCount(total)}
      </span>
    </nav>
  );
}
