import Image from "next/image";
import { StockDot } from "@/components/stock-dot";
import { company } from "@/lib/company";
import { bindSingleLetterWords } from "@/lib/typography";
import {
  QUANTITY_TIERS,
  type PreviewProduct,
  type PreviewVariant,
  type QuantityTier,
  discountedGrosze,
  formatPrice,
  lowestAndHighestNet,
} from "./preview-product";

const VAT_MULTIPLIER = 1.23;

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="md:sticky md:top-3">
      <div className="relative aspect-square rounded-box bg-surface">
        <Image src={src} alt={alt} fill unoptimized preload className="object-contain p-4 mix-blend-multiply" />
      </div>
    </div>
  );
}

export function ProductHeading({ product, selectedVariant }: { product: PreviewProduct; selectedVariant: PreviewVariant | undefined }) {
  const sku = selectedVariant ? selectedVariant.sku : product.sku;

  return (
    <div>
      <p className="font-semibold">{product.brand}</p>
      <h2 className="font-semibold md:text-title">{bindSingleLetterWords(product.name)}</h2>
      <p className="mt-1 text-small text-mute">Kod {sku}</p>
    </div>
  );
}

export function NetPrice({
  product,
  selectedVariant,
  tier,
}: {
  product: PreviewProduct;
  selectedVariant: PreviewVariant | undefined;
  tier: QuantityTier;
}) {
  if (!selectedVariant) {
    return <PriceRange product={product} />;
  }

  const netGrosze = discountedGrosze(selectedVariant.netGrosze, tier);
  const grossGrosze = Math.round(netGrosze * VAT_MULTIPLIER);

  return (
    <div className="tabular-nums">
      <p>
        <span className="text-title font-semibold">{formatPrice(netGrosze)}</span>{" "}
        <span className="font-semibold">netto / {product.unit}</span>
      </p>
      <p className="text-small text-mute">{formatPrice(grossGrosze)} brutto</p>
    </div>
  );
}

function PriceRange({ product }: { product: PreviewProduct }) {
  const { lowest, highest } = lowestAndHighestNet(product);
  const isSinglePrice = lowest === highest;
  const priceText = isSinglePrice ? formatPrice(lowest) : `od ${formatPrice(lowest)}`;

  return (
    <div className="tabular-nums">
      <p>
        <span className="text-title font-semibold">{priceText}</span>{" "}
        <span className="font-semibold">netto / {product.unit}</span>
      </p>
      <p className="text-small text-mute">{formatPrice(Math.round(lowest * VAT_MULTIPLIER))} brutto</p>
    </div>
  );
}

export function SelectionStock({ variant, missingChoice }: { variant: PreviewVariant | undefined; missingChoice: string }) {
  if (!variant) {
    return <p className="text-small">Wybierz {missingChoice}, żeby zobaczyć stan i cenę.</p>;
  }

  const variantName = [variant.color, variant.size].filter((part) => part !== null).join(", ");
  if (variant.inStock) {
    return (
      <p className="flex items-center gap-1 text-small">
        <StockDot inStock />
        <span>
          <b className="font-semibold">{variantName}</b> na stanie, wysyłka w 48 h
        </span>
      </p>
    );
  }

  return (
    <p className="flex flex-wrap items-center gap-x-1 text-small">
      <StockDot inStock={false} />
      <span>
        <b className="font-semibold">{variantName}</b> brak w magazynie, zapytaj o termin:
      </span>
      <a href={company.phoneHref} className="link-line">
        {company.phone}
      </a>
    </p>
  );
}

export function QuantityField({
  quantity,
  unit,
  onChange,
}: {
  quantity: number;
  unit: string;
  onChange: (quantity: number) => void;
}) {
  return (
    <label className="flex flex-col font-semibold">
      Ilość, {unit}
      <input
        type="number"
        value={quantity}
        onChange={(event) => onChange(Math.max(1, Number(event.target.value)))}
        min={1}
        step={1}
        inputMode="numeric"
        className="mt-1 h-6 w-10 rounded-box bg-surface px-2 font-normal tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      />
    </label>
  );
}

export function QuantityTiersTable({
  unitNetGrosze,
  unit,
  activeTier,
}: {
  unitNetGrosze: number | undefined;
  unit: string;
  activeTier: QuantityTier;
}) {
  const showsUnitPrice = unitNetGrosze !== undefined;

  return (
    <section aria-labelledby="rabat-ilosciowy" className="rounded-box bg-surface p-2">
      <h3 id="rabat-ilosciowy" className="px-1 font-semibold">
        Rabat ilościowy na ten produkt
      </h3>
      <table className="mt-1 w-full text-small tabular-nums">
        <thead className="text-mute">
          <tr>
            <th scope="col" className="px-1 text-left font-normal">
              Ilość
            </th>
            <th scope="col" className="px-1 text-left font-normal">
              Rabat
            </th>
            {showsUnitPrice && (
              <th scope="col" className="px-1 text-right font-normal">
                Netto / {unit}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {QUANTITY_TIERS.map((tier, index) => (
            <TierRow
              key={tier.fromQuantity}
              tier={tier}
              nextTier={QUANTITY_TIERS.at(index + 1)}
              unit={unit}
              unitNetGrosze={unitNetGrosze}
              isActive={tier === activeTier}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function TierRow({
  tier,
  nextTier,
  unit,
  unitNetGrosze,
  isActive,
}: {
  tier: QuantityTier;
  nextTier: QuantityTier | undefined;
  unit: string;
  unitNetGrosze: number | undefined;
  isActive: boolean;
}) {
  const rangeText = nextTier ? `${tier.fromQuantity}–${nextTier.fromQuantity - 1} ${unit}` : `od ${tier.fromQuantity} ${unit}`;
  const discountText = tier.percentOff === 0 ? "cena bazowa" : `${tier.percentOff}%`;
  const rowClassName = isActive ? "bg-ink text-paper" : "";
  const showsUnitPrice = unitNetGrosze !== undefined;
  const discountCellClassName = showsUnitPrice ? "px-1 py-0.5" : "rounded-r-box px-1 py-0.5";

  return (
    <tr aria-current={isActive} className={rowClassName}>
      <td className="rounded-l-box px-1 py-0.5">{rangeText}</td>
      <td className={discountCellClassName}>{discountText}</td>
      {showsUnitPrice && (
        <td className="rounded-r-box px-1 py-0.5 text-right font-semibold">
          {formatPrice(discountedGrosze(unitNetGrosze, tier))}
        </td>
      )}
    </tr>
  );
}

export function OrderTotal({ netGrosze, savedGrosze }: { netGrosze: number; savedGrosze: number }) {
  return (
    <p className="text-small tabular-nums">
      Razem <b className="font-semibold">{formatPrice(netGrosze)} netto</b>
      {savedGrosze > 0 && <>, rabat ilościowy {formatPrice(savedGrosze)}</>}
    </p>
  );
}
