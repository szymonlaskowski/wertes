import type { Metadata } from "next";
import type { ReactNode } from "react";
import { OrderTerms } from "@/app/(sklep)/produkt/[...path]/order-terms";
import { wordpressUrl } from "@/lib/store-api";
import { ChipsCard } from "./chips-card";
import { MatrixCard } from "./matrix-card";
import { type PreviewProduct, colorAndSizeProduct, findVariant, sizeOnlyProduct } from "./preview-product";
import { SelectCard } from "./select-card";

export const metadata: Metadata = {
  title: "Podgląd karty produktu",
  robots: { index: false },
};

type PlannedQuantity = { color: string | null; size: string; quantity: number };

export default function ProductPreviewPage() {
  const sizeChartUrl = wordpressUrl("/tabele-rozmiarow/");

  return (
    <main className="page-width flex flex-col gap-10 pt-3 pb-10">
      <h1 className="text-title">Podgląd karty produktu</h1>

      <PreviewSection id="a-kolor" label="A. Kafle, kolor i rozmiar">
        <ChipsCard
          product={colorAndSizeProduct}
          initial={{ color: "RB - Royal Blue", size: "XL", quantity: 12 }}
          sizeChartUrl={sizeChartUrl}
        >
          <OrderTerms />
        </ChipsCard>
      </PreviewSection>
      <PreviewSection id="a-rozmiar" label="A. Kafle, sam rozmiar">
        <ChipsCard product={sizeOnlyProduct} initial={{ color: null, size: "L", quantity: 60 }} sizeChartUrl={sizeChartUrl}>
          <OrderTerms />
        </ChipsCard>
      </PreviewSection>

      <PreviewSection id="b-kolor" label="B. Macierz, kolor i rozmiar">
        <MatrixCard
          product={colorAndSizeProduct}
          initialQuantities={plannedQuantities(colorAndSizeProduct, [
            { color: "RB - Royal Blue", size: "M", quantity: 5 },
            { color: "RB - Royal Blue", size: "L", quantity: 10 },
            { color: "RB - Royal Blue", size: "XL", quantity: 3 },
            { color: "NY - Navy", size: "M", quantity: 4 },
          ])}
          sizeChartUrl={sizeChartUrl}
        >
          <OrderTerms />
        </MatrixCard>
      </PreviewSection>
      <PreviewSection id="b-rozmiar" label="B. Macierz, sam rozmiar">
        <MatrixCard
          product={sizeOnlyProduct}
          initialQuantities={plannedQuantities(sizeOnlyProduct, [
            { color: null, size: "M", quantity: 10 },
            { color: null, size: "L", quantity: 20 },
            { color: null, size: "XL", quantity: 15 },
            { color: null, size: "2XL", quantity: 5 },
          ])}
          sizeChartUrl={sizeChartUrl}
        >
          <OrderTerms />
        </MatrixCard>
      </PreviewSection>

      <PreviewSection id="c-kolor" label="C. Listy rozwijane, kolor i rozmiar">
        <SelectCard
          product={colorAndSizeProduct}
          initial={{ color: "NY - Navy", size: "M", quantity: 4 }}
          sizeChartUrl={sizeChartUrl}
        >
          <OrderTerms />
        </SelectCard>
      </PreviewSection>
      <PreviewSection id="c-rozmiar" label="C. Listy rozwijane, sam rozmiar">
        <SelectCard product={sizeOnlyProduct} initial={{ color: null, size: null, quantity: 1 }} sizeChartUrl={sizeChartUrl}>
          <OrderTerms />
        </SelectCard>
      </PreviewSection>
    </main>
  );
}

function PreviewSection({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-naglowek`} className="flex flex-col gap-3">
      <p id={`${id}-naglowek`} className="text-small font-semibold text-mute">
        {label}
      </p>
      {children}
    </section>
  );
}

function plannedQuantities(product: PreviewProduct, plan: PlannedQuantity[]) {
  const quantities: Record<number, number> = {};
  for (const entry of plan) {
    const variant = findVariant(product, entry.color, entry.size);
    if (!variant) {
      throw new Error(`Preview plan names a missing variant: ${entry.color}, ${entry.size}`);
    }
    quantities[variant.id] = entry.quantity;
  }
  return quantities;
}
