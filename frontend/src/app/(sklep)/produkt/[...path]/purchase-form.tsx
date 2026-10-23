import { Button } from "@/components/button";
import type { Product } from "@/lib/store-api";
import { wordpressUrl } from "@/lib/store-api";
import { variationOptions } from "@/lib/variations";

const optionClassName =
  "flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-box bg-surface px-1 tabular-nums transition-colors duration-(--duration-reveal) ease-(--ease-out) peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink mouse:hover:bg-accent motion-reduce:transition-none";

export function PurchaseForm({ product }: { product: Product }) {
  return (
    <form action={wordpressUrl("/koszyk/")} method="get" className="flex flex-col gap-3">
      {product.type === "variable" ? (
        <VariationPicker product={product} />
      ) : (
        <input type="hidden" name="add-to-cart" value={product.id} />
      )}
      <div className="flex items-end gap-1">
        <label className="flex flex-col font-semibold">
          Ilość
          <input
            type="number"
            name="quantity"
            defaultValue={1}
            min={1}
            step={1}
            inputMode="numeric"
            required
            className="mt-1 h-6 w-10 rounded-box bg-surface px-2 font-normal tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          />
        </label>
        <Button variant="primary" type="submit">
          Dodaj do koszyka
        </Button>
      </div>
    </form>
  );
}

function VariationPicker({ product }: { product: Product }) {
  const options = variationOptions(product);
  const hasSingleOption = options.length === 1;
  const variationAttributeNames = product.attributes
    .filter((attribute) => attribute.has_variations)
    .map((attribute) => attribute.name);

  return (
    <fieldset>
      <legend className="mb-1 font-semibold">{variationAttributeNames.join(", ")}</legend>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <label key={option.id}>
            <input
              type="radio"
              name="add-to-cart"
              value={option.id}
              required
              defaultChecked={hasSingleOption}
              className="peer sr-only"
            />
            <span className={optionClassName}>{option.label}</span>
          </label>
        ))}
      </div>
      <a href={wordpressUrl("/tabele-rozmiarow/")} className="mt-1 inline-block text-small link-line">
        Tabele rozmiarów
      </a>
    </fieldset>
  );
}
