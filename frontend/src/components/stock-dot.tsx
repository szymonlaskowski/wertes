export function StockDot({ inStock }: { inStock: boolean }) {
  const label = inStock ? "dostępny" : "brak w magazynie";
  const colorClassName = inStock ? "bg-in-stock" : "bg-accent";

  return (
    <span title={label} className={`inline-block size-1 rounded-full ${colorClassName}`}>
      <span className="sr-only">{label}</span>
    </span>
  );
}
