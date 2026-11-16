import { StockDot } from "@/components/stock-dot";
import { company } from "@/lib/company";
import type { SaleUnit } from "@/lib/sale-unit";
import { type Product, listVariationDetails, wordpressUrl } from "@/lib/store-api";
import { buildVariantPicker } from "@/lib/variations";
import { ProductPrice } from "./product-price";
import { PurchaseForm } from "./purchase-form";
import { VariantPurchaseForm } from "./variant-purchase-form";

const AVAILABILITY_ATTRIBUTE = "Dostępność";

export async function PurchasePanel({ product, unit }: { product: Product; unit: SaleUnit }) {
  const cartUrl = wordpressUrl("/koszyk/");
  const canBeOrdered = product.is_in_stock;
  const offersVariants = product.type === "variable";

  if (canBeOrdered && offersVariants) {
    const variationDetails = await listVariationDetails(product.id);
    return (
      <VariantPurchaseForm
        productId={product.id}
        productPriceHtml={product.price_html}
        picker={buildVariantPicker(product, variationDetails)}
        cartUrl={cartUrl}
        sizeChartUrl="/tabele-rozmiarow/"
        unit={unit}
      />
    );
  }

  return (
    <>
      <ProductPrice priceHtml={product.price_html} unit={unit} />
      <Availability inStock={product.is_in_stock} />
      {canBeOrdered && <PurchaseForm productId={product.id} cartUrl={cartUrl} unit={unit} />}
    </>
  );
}

export function attributeValues(product: Product, attributeName: string) {
  const attribute = product.attributes.find((candidate) => candidate.name === attributeName);
  if (!attribute) {
    return [];
  }
  return attribute.terms.map((term) => term.name);
}

export function Availability({ inStock }: { inStock: boolean }) {
  if (inStock) {
    return (
      <p className="flex items-center gap-1 text-small">
        <StockDot inStock />
        Na stanie, wysyłka w 48 h
      </p>
    );
  }

  return (
    <p className="flex flex-wrap items-center gap-x-1 text-small">
      <StockDot inStock={false} />
      Brak w magazynie, zapytaj o termin:
      <a href={company.phoneHref} className="link-line">
        {company.phone}
      </a>
    </p>
  );
}

export function Description({ html }: { html: string }) {
  if (!html) {
    return null;
  }

  return (
    <section aria-labelledby="opis">
      <h2 id="opis" className="mb-1 font-semibold">
        Opis produktu
      </h2>
      <div
        className="max-w-prose [&_:is(h2,h3,h4)]:mt-3 [&_:is(h2,h3,h4)]:mb-1 [&_:is(h2,h3,h4)]:font-semibold [&_p]:mb-2"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

export function Parameters({ product }: { product: Product }) {
  const parameters = product.attributes.filter(
    (attribute) => !attribute.has_variations && attribute.name !== AVAILABILITY_ATTRIBUTE,
  );

  return (
    <section aria-labelledby="parametry">
      <h2 id="parametry" className="mb-1 font-semibold">
        Parametry
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {product.sku && <ParameterRow name="Kod" value={product.sku} />}
        {parameters.map((attribute) => (
          <ParameterRow
            key={attribute.name}
            name={attribute.name}
            value={attribute.terms.map((term) => term.name).join(", ")}
          />
        ))}
      </dl>
    </section>
  );
}

function ParameterRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="contents">
      <dt className="text-mute">{name}</dt>
      <dd>{value}</dd>
    </div>
  );
}
