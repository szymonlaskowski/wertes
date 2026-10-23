"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FocusEvent, type KeyboardEvent, useId, useRef, useState } from "react";
import { Button } from "@/components/button";
import { priceClassName } from "@/components/price";
import { formatCount } from "@/lib/catalog";
import {
  MAX_QUERY_LENGTH,
  MIN_SUGGESTION_QUERY_LENGTH,
  matchCategories,
  type SuggestedCategory,
  splitAtMatch,
} from "@/lib/search-suggestions";
import { suggestProducts } from "@/lib/suggest-products";

const TYPING_PAUSE_MS = 200;
const PRODUCT_PLACEHOLDER_ROWS = 3;

type ProductSuggestions = Awaited<ReturnType<typeof suggestProducts>>;
type ProductSuggestion = ProductSuggestions["products"][number];

const optionClassName = "aria-selected:bg-paper";
const groupLabelClassName = "px-2 pt-1.5 pb-0.5 text-small text-mute";

export function SearchBox({ categories }: { categories: SuggestedCategory[] }) {
  const router = useRouter();
  const inputId = useId();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestions>();
  const typingPauseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const trimmedQuery = query.trim();
  const queryIsLongEnough = trimmedQuery.length >= MIN_SUGGESTION_QUERY_LENGTH;
  const categoryMatches = queryIsLongEnough ? matchCategories(categories, trimmedQuery) : [];
  const productsForQuery = productSuggestions?.query === trimmedQuery ? productSuggestions : undefined;
  const products = productsForQuery?.products ?? [];
  const allResultsPath = `/szukaj/?${new URLSearchParams({ q: trimmedQuery })}`;
  const optionPaths = [
    ...categoryMatches.map((category) => category.path),
    ...products.map((product) => product.path),
    allResultsPath,
  ];
  const isListVisible = isOpen && queryIsLongEnough;
  const productsAreLoading = queryIsLongEnough && !productsForQuery;

  function optionId(index: number) {
    return `${listboxId}-${index}`;
  }

  function changeQuery(nextQuery: string) {
    setQuery(nextQuery);
    setIsOpen(true);
    setActiveIndex(-1);
    clearTimeout(typingPauseTimer.current);
    const nextTrimmedQuery = nextQuery.trim();
    if (nextTrimmedQuery.length < MIN_SUGGESTION_QUERY_LENGTH) {
      return;
    }
    typingPauseTimer.current = setTimeout(() => loadProducts(nextTrimmedQuery), TYPING_PAUSE_MS);
  }

  async function loadProducts(queryToLoad: string) {
    setProductSuggestions(await suggestProducts(queryToLoad));
  }

  function openOption(path: string) {
    setIsOpen(false);
    router.push(path);
  }

  function moveSelection(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && !isListVisible) {
      setIsOpen(true);
      return;
    }
    if (!isListVisible) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((activeIndex + 1) % optionPaths.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const lastIndex = optionPaths.length - 1;
      setActiveIndex(activeIndex <= 0 ? lastIndex : activeIndex - 1);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      openOption(optionPaths[activeIndex]);
    }
  }

  function closeWhenFocusLeaves(event: FocusEvent<HTMLFormElement>) {
    const focusStaysInside = event.currentTarget.contains(event.relatedTarget);
    if (!focusStaysInside) {
      setIsOpen(false);
    }
  }

  function optionProps(index: number): OptionProps {
    return {
      id: optionId(index),
      role: "option",
      "aria-selected": index === activeIndex,
      tabIndex: -1,
      onMouseEnter: () => setActiveIndex(index),
      onClick: () => setIsOpen(false),
    };
  }

  const firstProductIndex = categoryMatches.length;
  const allResultsIndex = optionPaths.length - 1;

  return (
    <div className="order-last w-full md:order-none md:flex-1">
      <label htmlFor={inputId} className="text-small font-semibold">
        Szukaj po nazwie, kodzie albo normie
      </label>
      <Form
        action="/szukaj/"
        role="search"
        className="relative mt-0.5 flex"
        onSubmit={() => setIsOpen(false)}
        onBlur={closeWhenFocusLeaves}
      >
        <input
          id={inputId}
          name="q"
          type="search"
          required
          maxLength={MAX_QUERY_LENGTH}
          autoComplete="off"
          placeholder="np. RMICRONYL albo S3"
          role="combobox"
          aria-expanded={isListVisible}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={moveSelection}
          className="min-w-0 flex-1 rounded-box bg-surface px-2 py-1 text-body text-ink outline-none placeholder:text-mute focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
        />
        <Button variant="primary" type="submit">
          Szukaj
        </Button>
        <div
          id={listboxId}
          role="listbox"
          aria-label="Podpowiedzi"
          hidden={!isListVisible}
          onMouseDown={(event) => event.preventDefault()}
          className="absolute inset-x-0 top-full z-30 mt-0.5 rounded-box bg-surface py-0.5 text-ink"
        >
          {categoryMatches.length > 0 && (
            <div role="group" aria-label="Kategorie">
              <p aria-hidden className={groupLabelClassName}>
                Kategorie
              </p>
              {categoryMatches.map((category, index) => (
                <CategoryOption key={category.id} category={category} query={trimmedQuery} {...optionProps(index)} />
              ))}
            </div>
          )}
          {productsAreLoading && <ProductPlaceholders />}
          {products.length > 0 && (
            <div role="group" aria-label="Produkty">
              <p aria-hidden className={groupLabelClassName}>
                Produkty
              </p>
              {products.map((product, index) => (
                <ProductOption
                  key={product.id}
                  product={product}
                  query={trimmedQuery}
                  {...optionProps(firstProductIndex + index)}
                />
              ))}
            </div>
          )}
          <Link
            href={allResultsPath}
            {...optionProps(allResultsIndex)}
            className={`mt-1 flex justify-between gap-2 px-2 py-1.5 font-semibold ${optionClassName}`}
          >
            <span>
              Wszystkie wyniki{productsForQuery && `, ${formatCount(productsForQuery.total)}`}
            </span>
            <span className="text-small font-normal text-mute max-md:hidden">Enter</span>
          </Link>
        </div>
      </Form>
    </div>
  );
}

type OptionProps = {
  id: string;
  role: "option";
  "aria-selected": boolean;
  tabIndex: number;
  onMouseEnter: () => void;
  onClick: () => void;
};

function CategoryOption({
  category,
  query,
  ...optionProps
}: { category: SuggestedCategory; query: string } & OptionProps) {
  return (
    <Link
      href={category.path}
      {...optionProps}
      className={`flex items-baseline justify-between gap-2 px-2 py-0.5 ${optionClassName}`}
    >
      <span>
        <Highlighted text={category.name} query={query} />
        {category.parentName && <span className="text-small text-mute"> w {category.parentName}</span>}
      </span>
      <span className="text-mute tabular-nums">{formatCount(category.count)}</span>
    </Link>
  );
}

function ProductOption({
  product,
  query,
  ...optionProps
}: { product: ProductSuggestion; query: string } & OptionProps) {
  return (
    <Link
      href={product.path}
      {...optionProps}
      className={`grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-2 px-2 py-1 ${optionClassName}`}
    >
      <span className="relative size-6">
        {product.image && (
          <Image src={product.image.src} alt="" fill sizes="48px" className="object-contain" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate">
          <Highlighted text={product.name} query={query} />
        </span>
        {product.sku && <span className="text-small text-mute">Kod {product.sku}</span>}
      </span>
      <span
        className={`text-right whitespace-nowrap ${priceClassName}`}
        dangerouslySetInnerHTML={{ __html: product.priceHtml }}
      />
    </Link>
  );
}

function ProductPlaceholders() {
  return (
    <div aria-busy="true">
      <p className={groupLabelClassName}>Szukam produktów</p>
      {Array.from({ length: PRODUCT_PLACEHOLDER_ROWS }, (_, index) => (
        <div key={index} aria-hidden className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-2 px-2 py-1">
          <div className="placeholder size-6" />
          <div className="flex flex-col gap-1">
            <div className="placeholder h-2 w-full max-w-40" />
            <div className="placeholder h-1.5 w-12" />
          </div>
          <div className="placeholder h-2 w-10" />
        </div>
      ))}
    </div>
  );
}

function Highlighted({ text, query }: { text: string; query: string }) {
  const parts = splitAtMatch(text, query);
  if (!parts) {
    return text;
  }
  return (
    <>
      {parts.before}
      <b className="font-semibold">{parts.match}</b>
      {parts.after}
    </>
  );
}
