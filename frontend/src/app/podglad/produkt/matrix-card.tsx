"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/button";
import { StockDot } from "@/components/stock-dot";
import { OrderTotal, ProductHeading, ProductImage, QuantityTiersTable } from "./panel-parts";
import {
  type PreviewProduct,
  type PreviewVariant,
  colorsOf,
  discountedGrosze,
  findVariant,
  formatPrice,
  imageForColor,
  lowestAndHighestNet,
  sizesOf,
  tierForQuantity,
} from "./preview-product";

type Quantities = Record<number, number>;

const cellInputClassName =
  "h-5 w-5 rounded-box bg-surface text-center tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:w-6";

type MatrixCardProps = {
  product: PreviewProduct;
  initialQuantities: Quantities;
  sizeChartUrl: string;
  children: ReactNode;
};

export function MatrixCard({ product, initialQuantities, sizeChartUrl, children }: MatrixCardProps) {
  const [quantities, setQuantities] = useState(initialQuantities);
  const colors = colorsOf(product);
  const order = summarizeOrder(product, quantities);
  const tier = tierForQuantity(order.totalQuantity);
  const hasColors = colors.length > 0;
  const { lowest } = lowestAndHighestNet(product);

  function changeQuantity(variantId: number, quantity: number) {
    setQuantities({ ...quantities, [variantId]: Math.max(0, quantity) });
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
      <ProductImage src={imageForColor(product, colors.at(0) ?? null)} alt={product.name} />
      <div className="flex flex-col gap-3">
        <ProductHeading product={product} selectedVariant={undefined} />
        <p className="tabular-nums">
          <span className="text-title font-semibold">od {formatPrice(lowest)}</span>{" "}
          <span className="font-semibold">netto / {product.unit}</span>
        </p>
        <div>
          <p className="mb-1 font-semibold">Wpisz ilości przy wariantach, które zamawiasz</p>
          {hasColors ? (
            <ColorSizeMatrix product={product} colors={colors} quantities={quantities} onChange={changeQuantity} />
          ) : (
            <SizeList product={product} quantities={quantities} onChange={changeQuantity} />
          )}
          <a href={sizeChartUrl} className="mt-1 inline-block text-small link-line">
            Tabele rozmiarów
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Button variant="primary" type="button" disabled={order.totalQuantity === 0}>
            Dodaj {order.totalQuantity} {product.unit} do koszyka
          </Button>
          <OrderTotal
            netGrosze={discountedGrosze(order.netGrosze, tier)}
            savedGrosze={order.netGrosze - discountedGrosze(order.netGrosze, tier)}
          />
        </div>
        <QuantityTiersTable unitNetGrosze={undefined} unit={product.unit} activeTier={tier} />
        {children}
      </div>
    </div>
  );
}

function summarizeOrder(product: PreviewProduct, quantities: Quantities) {
  let totalQuantity = 0;
  let netGrosze = 0;
  for (const variant of product.variants) {
    const quantity = quantities[variant.id] ?? 0;
    totalQuantity += quantity;
    netGrosze += quantity * variant.netGrosze;
  }
  return { totalQuantity, netGrosze };
}

function ColorSizeMatrix({
  product,
  colors,
  quantities,
  onChange,
}: {
  product: PreviewProduct;
  colors: string[];
  quantities: Quantities;
  onChange: (variantId: number, quantity: number) => void;
}) {
  const sizes = sizesOf(product);

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-0.5 text-small tabular-nums">
        <thead>
          <tr>
            <th scope="col" className="text-left font-normal text-mute">
              Kolor
            </th>
            {sizes.map((size) => (
              <th key={size} scope="col" className="font-semibold">
                {size}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {colors.map((color) => (
            <tr key={color}>
              <th scope="row" className="text-left font-normal">
                <span className="flex items-center gap-1">
                  <span className="relative block size-5 shrink-0 rounded-box bg-surface">
                    <Image src={imageForColor(product, color)} alt="" fill unoptimized className="object-contain mix-blend-multiply" />
                  </span>
                  <span className="sr-only md:not-sr-only md:whitespace-nowrap">{color}</span>
                </span>
              </th>
              {sizes.map((size) => (
                <td key={size}>
                  <QuantityCell
                    variant={findVariant(product, color, size)}
                    label={`${color}, ${size}`}
                    quantities={quantities}
                    onChange={onChange}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SizeList({
  product,
  quantities,
  onChange,
}: {
  product: PreviewProduct;
  quantities: Quantities;
  onChange: (variantId: number, quantity: number) => void;
}) {
  return (
    <table className="w-full text-small tabular-nums">
      <thead className="text-mute">
        <tr>
          <th scope="col" className="py-0.5 text-left font-normal">
            Rozmiar
          </th>
          <th scope="col" className="py-0.5 text-left font-normal">
            Stan
          </th>
          <th scope="col" className="py-0.5 text-right font-normal">
            Netto / {product.unit}
          </th>
          <th scope="col" className="py-0.5 text-right font-normal">
            Ilość
          </th>
        </tr>
      </thead>
      <tbody>
        {sizesOf(product).map((size) => {
          const variant = findVariant(product, null, size);
          if (!variant) {
            return null;
          }
          return (
            <tr key={size}>
              <th scope="row" className="py-0.5 text-left font-semibold">
                {size}
              </th>
              <td className="py-0.5">
                <span className="flex items-center gap-1">
                  <StockDot inStock={variant.inStock} />
                  <span aria-hidden="true" className="hidden md:inline">
                    {variant.inStock ? "Na stanie" : "Brak"}
                  </span>
                </span>
              </td>
              <td className="py-0.5 text-right">{formatPrice(variant.netGrosze)}</td>
              <td className="py-0.5 text-right">
                <QuantityCell variant={variant} label={`Rozmiar ${size}`} quantities={quantities} onChange={onChange} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function QuantityCell({
  variant,
  label,
  quantities,
  onChange,
}: {
  variant: PreviewVariant | undefined;
  label: string;
  quantities: Quantities;
  onChange: (variantId: number, quantity: number) => void;
}) {
  const isOrderable = variant !== undefined && variant.inStock;
  if (!isOrderable) {
    return (
      <span className="flex h-5 w-5 items-center justify-center text-mute md:w-6">
        brak<span className="sr-only">, {label}</span>
      </span>
    );
  }

  const quantity = quantities[variant.id] ?? 0;
  return (
    <input
      type="number"
      aria-label={`Ilość, ${label}`}
      value={quantity === 0 ? "" : quantity}
      placeholder="0"
      onChange={(event) => onChange(variant.id, Number(event.target.value))}
      min={0}
      step={1}
      inputMode="numeric"
      className={`${cellInputClassName} placeholder:text-mute`}
    />
  );
}
