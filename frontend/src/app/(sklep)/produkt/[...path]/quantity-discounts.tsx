import type { QuantityDiscountTier } from "@/lib/quantity-discounts";
import type { SaleUnit } from "@/lib/sale-unit";

export function QuantityDiscounts({ tiers, unit }: { tiers: QuantityDiscountTier[]; unit: SaleUnit }) {
  if (tiers.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="rabat-ilosciowy" className="bg-surface p-2">
      <h2 id="rabat-ilosciowy" className="px-1 font-semibold">
        Rabat ilościowy na ten produkt
      </h2>
      <p className="px-1 text-small text-mute">Rabat nalicza się sam w koszyku.</p>
      <table className="mt-1 w-full text-small tabular-nums">
        <thead className="text-mute">
          <tr>
            <th scope="col" className="px-1 text-left font-normal">
              Ilość
            </th>
            <th scope="col" className="px-1 text-right font-normal">
              Rabat
            </th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, index) => (
            <tr key={tier.fromQuantity}>
              <td className="px-1">{rangeText(tier, tiers.at(index + 1), unit)}</td>
              <td className="px-1 text-right font-semibold">−{tier.percentOff}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function rangeText(tier: QuantityDiscountTier, nextTier: QuantityDiscountTier | undefined, unit: SaleUnit) {
  if (nextTier === undefined) {
    return `od ${tier.fromQuantity} ${unit.countOf}`;
  }
  return `${tier.fromQuantity}–${nextTier.fromQuantity - 1} ${unit.countOf}`;
}
