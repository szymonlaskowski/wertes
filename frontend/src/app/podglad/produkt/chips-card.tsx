"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/button";
import {
  NetPrice,
  OrderTotal,
  ProductHeading,
  ProductImage,
  QuantityField,
  QuantityTiersTable,
  SelectionStock,
} from "./panel-parts";
import {
  type PreviewProduct,
  colorsOf,
  discountedGrosze,
  findVariant,
  imageForColor,
  sizesOf,
  tierForQuantity,
} from "./preview-product";

const chipClassName =
  "flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-box bg-surface px-1 tabular-nums transition-colors duration-(--duration-reveal) ease-(--ease-out) peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink mouse:peer-enabled:peer-not-checked:hover:bg-accent peer-disabled:cursor-not-allowed peer-disabled:bg-paper peer-disabled:text-mute motion-reduce:transition-none";

type Selection = { color: string | null; size: string | null; quantity: number };

type ChipsCardProps = { product: PreviewProduct; initial: Selection; sizeChartUrl: string; children: ReactNode };

export function ChipsCard({ product, initial, sizeChartUrl, children }: ChipsCardProps) {
  const [color, setColor] = useState(initial.color);
  const [size, setSize] = useState(initial.size);
  const [quantity, setQuantity] = useState(initial.quantity);
  const colors = colorsOf(product);
  const selectedVariant = findVariant(product, color, size);
  const tier = tierForQuantity(quantity);

  function chooseColor(nextColor: string) {
    setColor(nextColor);
    const sameSizeInNextColor = findVariant(product, nextColor, size);
    if (!sameSizeInNextColor || !sameSizeInNextColor.inStock) {
      setSize(null);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
      <ProductImage src={imageForColor(product, color)} alt={product.name} />
      <div className="flex flex-col gap-3">
        <ProductHeading product={product} selectedVariant={selectedVariant} />
        <NetPrice product={product} selectedVariant={selectedVariant} tier={tier} />
        <SelectionStock variant={selectedVariant} missingChoice="rozmiar" />
        {colors.length > 0 && (
          <ColorChoice product={product} colors={colors} selectedColor={color} onChoose={chooseColor} />
        )}
        <SizeChoice
          product={product}
          color={color}
          selectedSize={size}
          sizeChartUrl={sizeChartUrl}
          onChoose={setSize}
        />
        <div className="flex flex-wrap items-end gap-1">
          <QuantityField quantity={quantity} unit={product.unit} onChange={setQuantity} />
          <Button variant="primary" type="button" disabled={!selectedVariant}>
            Dodaj do koszyka
          </Button>
        </div>
        {selectedVariant && (
          <OrderTotal
            netGrosze={discountedGrosze(selectedVariant.netGrosze, tier) * quantity}
            savedGrosze={(selectedVariant.netGrosze - discountedGrosze(selectedVariant.netGrosze, tier)) * quantity}
          />
        )}
        <QuantityTiersTable
          unitNetGrosze={selectedVariant?.netGrosze}
          unit={product.unit}
          activeTier={tier}
        />
        {children}
      </div>
    </div>
  );
}

function ColorChoice({
  product,
  colors,
  selectedColor,
  onChoose,
}: {
  product: PreviewProduct;
  colors: string[];
  selectedColor: string | null;
  onChoose: (color: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1">
        <span className="font-semibold">Kolor</span> {selectedColor}
      </legend>
      <div className="flex flex-wrap gap-1">
        {colors.map((color) => (
          <label key={color} className="cursor-pointer">
            <input
              type="radio"
              name={`kolor-${product.sku}`}
              checked={color === selectedColor}
              onChange={() => onChoose(color)}
              className="peer sr-only"
            />
            <span className="sr-only">{color}</span>
            <span className="relative block size-8 rounded-box bg-surface outline-2 outline-transparent peer-checked:outline-ink peer-focus-visible:outline-ink mouse:hover:outline-ink">
              <Image src={imageForColor(product, color)} alt="" fill unoptimized className="object-contain p-0.5 mix-blend-multiply" />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SizeChoice({
  product,
  color,
  selectedSize,
  sizeChartUrl,
  onChoose,
}: {
  product: PreviewProduct;
  color: string | null;
  selectedSize: string | null;
  sizeChartUrl: string;
  onChoose: (size: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1 font-semibold">Rozmiar</legend>
      <div className="flex flex-wrap gap-1">
        {sizesOf(product).map((size) => {
          const variant = findVariant(product, color, size);
          const isAvailable = variant !== undefined && variant.inStock;
          return (
            <label key={size}>
              <input
                type="radio"
                name={`rozmiar-${product.sku}`}
                checked={size === selectedSize}
                disabled={!isAvailable}
                onChange={() => onChoose(size)}
                className="peer sr-only"
              />
              <span className={chipClassName}>
                {size}
                {!isAvailable && <span className="sr-only">, brak w magazynie</span>}
              </span>
            </label>
          );
        })}
      </div>
      <p className="mt-1 text-small text-mute">Rozmiary bez tła są chwilowo niedostępne.</p>
      <a href={sizeChartUrl} className="mt-1 inline-block text-small link-line">
        Tabele rozmiarów
      </a>
    </fieldset>
  );
}
