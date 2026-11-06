"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/button";
import { NetPrice, ProductHeading, ProductImage, QuantityField, SelectionStock } from "./panel-parts";
import {
  QUANTITY_TIERS,
  type PreviewProduct,
  colorsOf,
  discountedGrosze,
  findVariant,
  formatPrice,
  imageForColor,
  sizesOf,
  tierForQuantity,
} from "./preview-product";

const selectClassName =
  "mt-1 h-6 bg-surface px-1 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

type Selection = { color: string | null; size: string | null; quantity: number };

type SelectCardProps = { product: PreviewProduct; initial: Selection; sizeChartUrl: string; children: ReactNode };

export function SelectCard({ product, initial, sizeChartUrl, children }: SelectCardProps) {
  const [color, setColor] = useState(initial.color);
  const [size, setSize] = useState(initial.size);
  const [quantity, setQuantity] = useState(initial.quantity);
  const colors = colorsOf(product);
  const selectedVariant = findVariant(product, color, size);
  const tier = tierForQuantity(quantity);
  const discountedTiers = QUANTITY_TIERS.filter((candidate) => candidate.percentOff > 0);

  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
      <ProductImage src={imageForColor(product, color)} alt={product.name} />
      <div className="flex flex-col gap-3">
        <ProductHeading product={product} selectedVariant={selectedVariant} />
        <NetPrice product={product} selectedVariant={selectedVariant} tier={tier} />
        <div className="flex flex-wrap items-end gap-1">
          {colors.length > 0 && (
            <label className="flex flex-col font-semibold">
              Kolor
              <select value={color ?? ""} onChange={(event) => setColor(event.target.value)} className={selectClassName}>
                {colors.map((colorName) => (
                  <option key={colorName} value={colorName}>
                    {colorName}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col font-semibold">
            Rozmiar
            <select value={size ?? ""} onChange={(event) => setSize(event.target.value)} className={selectClassName}>
              <option value="" disabled>
                Wybierz
              </option>
              {sizesOf(product).map((sizeName) => {
                const variant = findVariant(product, color, sizeName);
                const isAvailable = variant !== undefined && variant.inStock;
                return (
                  <option key={sizeName} value={sizeName} disabled={!isAvailable}>
                    {isAvailable ? sizeName : `${sizeName}, brak`}
                  </option>
                );
              })}
            </select>
          </label>
          <QuantityField quantity={quantity} unit={product.unit} onChange={setQuantity} />
          <Button variant="primary" type="button" disabled={!selectedVariant}>
            Dodaj do koszyka
          </Button>
        </div>
        <SelectionStock variant={selectedVariant} missingChoice="rozmiar" />
        <p className="text-small tabular-nums">
          <b className="font-semibold">Rabat ilościowy:</b>{" "}
          {discountedTiers.map((discountedTier) => (
            <TierMention
              key={discountedTier.fromQuantity}
              fromQuantity={discountedTier.fromQuantity}
              percentOff={discountedTier.percentOff}
              unit={product.unit}
              isActive={discountedTier === tier}
            />
          ))}
          {selectedVariant && (
            <>
              {" "}
              Twoja cena {formatPrice(discountedGrosze(selectedVariant.netGrosze, tier))} netto / {product.unit}
            </>
          )}
        </p>
        <a href={sizeChartUrl} className="text-small link-line self-start">
          Tabele rozmiarów
        </a>
        {children}
      </div>
    </div>
  );
}

function TierMention({
  fromQuantity,
  percentOff,
  unit,
  isActive,
}: {
  fromQuantity: number;
  percentOff: number;
  unit: string;
  isActive: boolean;
}) {
  const className = isActive ? "bg-ink px-0.5 text-paper" : "";

  return (
    <span className={`mr-1 inline-block ${className}`}>
      od {fromQuantity} {unit} {percentOff}%
    </span>
  );
}
