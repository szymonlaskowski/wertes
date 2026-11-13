"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { inputClassName } from "@/components/field";
import { StockDot } from "@/components/stock-dot";
import {
  type PickerVariant,
  type Selection,
  type VariantChoice,
  type VariantPicker,
  findSelectedVariant,
  initialSelection,
  isOptionAvailable,
  selectOption,
} from "@/lib/variations";
import { AddToCartForm } from "@/components/cart/add-to-cart-form";
import type { SaleUnit } from "@/lib/sale-unit";
import { useGalleryFocus } from "./gallery-focus";
import { ProductPrice } from "./product-price";

const chipClassName =
  "flex h-6 min-w-6 cursor-pointer items-center justify-center bg-surface px-1 tabular-nums transition-[background-color,scale] duration-(--duration-reveal) ease-(--ease-out) active:scale-[0.94] peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink mouse:peer-enabled:peer-not-checked:hover:bg-accent peer-disabled:cursor-not-allowed peer-disabled:bg-paper peer-disabled:text-mute motion-reduce:transition-none";

const swatchClassName =
  "relative block size-8 cursor-pointer bg-surface transition-[scale] duration-(--duration-reveal) ease-(--ease-out) active:scale-[0.94] motion-reduce:transition-none outline-2 outline-offset-0 outline-transparent peer-checked:outline-ink peer-focus-visible:outline-ink mouse:peer-enabled:hover:outline-ink peer-disabled:cursor-not-allowed peer-disabled:bg-paper";

const PHONE_WIDTH_QUERY = "(max-width: 767.98px)";

type VariantPurchaseFormProps = {
  productId: number;
  productPriceHtml: string;
  picker: VariantPicker;
  cartUrl: string;
  sizeChartUrl: string;
  unit: SaleUnit;
};

export function VariantPurchaseForm({ productId, productPriceHtml, picker, cartUrl, sizeChartUrl, unit }: VariantPurchaseFormProps) {
  const [selection, setSelection] = useState(() => initialSelection(picker));
  const selectedVariant = findSelectedVariant(picker, selection);
  const priceHtml = selectedVariant ? selectedVariant.priceHtml : productPriceHtml;
  const { focusImage } = useGalleryFocus();
  const isPhone = useSyncExternalStore(subscribeToPhoneWidth, readIsPhone, () => false);

  function choose(choice: VariantChoice, value: string) {
    setSelection(selectOption(picker, selection, choice.name, value));
    const chosenOption = choice.options.find((option) => option.value === value);
    if (choice.showsImages && chosenOption?.image) {
      focusImage(chosenOption.image);
    }
  }

  return (
    <AddToCartForm cartUrl={cartUrl} className="flex flex-col gap-3" quantityUnit={unit.countOf} submitLabel="Dodaj do koszyka">
      <ProductPrice priceHtml={priceHtml} unit={unit} />
      <SelectedVariantStock picker={picker} selection={selection} variant={selectedVariant} />
      <input type="hidden" name="add-to-cart" value={productId} />
      {selectedVariant && <SelectedVariantFields variant={selectedVariant} />}
      {isPhone ? (
        <ChoiceSelects picker={picker} selection={selection} onChoose={choose} />
      ) : (
        picker.choices.map((choice) => (
          <ChoiceFieldset key={choice.name} picker={picker} choice={choice} selection={selection} onChoose={choose} />
        ))
      )}
      <a href={sizeChartUrl} className="-mt-2 self-start text-small link-line">
        Tabele rozmiarów
      </a>
    </AddToCartForm>
  );
}

function SelectedVariantFields({ variant }: { variant: PickerVariant }) {
  return (
    <>
      <input type="hidden" name="variation_id" value={variant.id} />
      {variant.hiddenFields.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}
    </>
  );
}

function SelectedVariantStock({
  picker,
  selection,
  variant,
}: {
  picker: VariantPicker;
  selection: Selection;
  variant: PickerVariant | undefined;
}) {
  if (!variant) {
    const missingChoices = picker.choices.filter((choice) => selection[choice.name] === undefined);
    const missingNames = missingChoices.map((choice) => choice.name.toLowerCase()).join(" i ");
    return <p className="text-small">Wybierz {missingNames}, żeby zobaczyć cenę i stan.</p>;
  }

  const variantName = picker.choices.map((choice) => optionLabel(choice, variant.choiceValues[choice.name])).join(", ");
  const stockText = variant.inStock ? "na stanie, wysyłka w 48 h" : "brak w magazynie";
  return (
    <p aria-live="polite" className="flex items-center gap-1 text-small">
      <StockDot inStock={variant.inStock} />
      <span>
        <b className="font-semibold">{variantName}</b>, kod {variant.sku}: {stockText}
      </span>
    </p>
  );
}

function ChoiceFieldset({
  picker,
  choice,
  selection,
  onChoose,
}: {
  picker: VariantPicker;
  choice: VariantChoice;
  selection: Selection;
  onChoose: (choice: VariantChoice, value: string) => void;
}) {
  const selectedValue = selection[choice.name];
  const hasUnavailableOption = choice.options.some(
    (option) => !isOptionAvailable(picker, selection, choice.name, option.value),
  );

  return (
    <fieldset>
      <legend className="mb-1">
        <span className="font-semibold">{choice.name}</span>
        {choice.showsImages && selectedValue !== undefined && <> {optionLabel(choice, selectedValue)}</>}
      </legend>
      <div className="flex flex-wrap gap-1">
        {choice.options.map((option) => {
          const isAvailable = isOptionAvailable(picker, selection, choice.name, option.value);
          return (
            <label key={option.value}>
              <input
                type="radio"
                name={choice.formField}
                value={option.value}
                checked={option.value === selectedValue}
                disabled={!isAvailable}
                required
                onChange={() => onChoose(choice, option.value)}
                className="peer sr-only"
              />
              {choice.showsImages && option.image ? (
                <span className={swatchClassName}>
                  <Image src={option.image} alt="" fill sizes="64px" className="object-contain p-0.5 mix-blend-multiply" />
                  <span className="sr-only">{option.label}</span>
                </span>
              ) : (
                <span className={chipClassName}>{option.label}</span>
              )}
              {!isAvailable && <span className="sr-only">, brak w magazynie</span>}
            </label>
          );
        })}
      </div>
      {hasUnavailableOption && <p className="mt-1 text-small text-mute">Opcje bez tła są chwilowo niedostępne.</p>}
    </fieldset>
  );
}

function ChoiceSelects({
  picker,
  selection,
  onChoose,
}: {
  picker: VariantPicker;
  selection: Selection;
  onChoose: (choice: VariantChoice, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {picker.choices.map((choice) => (
        <label key={choice.name} className="grid content-start gap-1">
          <span className="font-semibold">{choice.name}</span>
          <select
            name={choice.formField}
            value={selection[choice.name] ?? ""}
            required
            onChange={(event) => onChoose(choice, event.target.value)}
            className={inputClassName}
          >
            <option value="" disabled>
              Wybierz
            </option>
            {choice.options.map((option) => {
              const isAvailable = isOptionAvailable(picker, selection, choice.name, option.value);
              return (
                <option key={option.value} value={option.value} disabled={!isAvailable}>
                  {isAvailable ? option.label : `${option.label} (brak)`}
                </option>
              );
            })}
          </select>
        </label>
      ))}
    </div>
  );
}

function subscribeToPhoneWidth(onWidthChange: () => void) {
  const phoneWidth = window.matchMedia(PHONE_WIDTH_QUERY);
  phoneWidth.addEventListener("change", onWidthChange);
  return () => phoneWidth.removeEventListener("change", onWidthChange);
}

function readIsPhone() {
  return window.matchMedia(PHONE_WIDTH_QUERY).matches;
}

function optionLabel(choice: VariantChoice, value: string) {
  const option = choice.options.find((candidate) => candidate.value === value);
  if (!option) {
    throw new Error(`${choice.name} has no option ${value}`);
  }
  return option.label;
}
