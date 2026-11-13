import { productPagePriceClassName } from "@/components/price";
import type { SaleUnit } from "@/lib/sale-unit";

export function ProductPrice({ priceHtml, unit }: { priceHtml: string; unit: SaleUnit }) {
  return (
    <div>
      <div className={productPagePriceClassName} dangerouslySetInnerHTML={{ __html: priceHtml }} />
      <p className="text-small text-mute">Cena {unit.pricePer}</p>
    </div>
  );
}
