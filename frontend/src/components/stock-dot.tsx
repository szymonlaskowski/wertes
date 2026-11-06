function stockLabel(inStock: boolean) {
  return inStock ? "Dostępny" : "Brak w magazynie";
}

function dotColorClassName(inStock: boolean) {
  return inStock ? "bg-in-stock" : "bg-accent";
}

export function StockDot({ inStock }: { inStock: boolean }) {
  const label = stockLabel(inStock);

  return (
    <span title={label} className={`inline-block size-1 rounded-full ${dotColorClassName(inStock)}`}>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function StockStatus({ inStock }: { inStock: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <span aria-hidden="true" className={`inline-block size-1 rounded-full ${dotColorClassName(inStock)}`} />
      {stockLabel(inStock)}
    </span>
  );
}
