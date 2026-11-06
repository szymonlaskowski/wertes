"use client";

import { type FormEvent, type ReactNode, useRef, useState } from "react";
import { Button } from "@/components/button";
import { cartLineFromForm } from "@/lib/cart";
import { useCart } from "./cart-provider";

type AddToCartFormProps = {
  cartUrl: string;
  className: string;
  withQuantity: boolean;
  submitLabel: ReactNode;
  children: ReactNode;
};

export function AddToCartForm({ cartUrl, className, withQuantity, submitLabel, children }: AddToCartFormProps) {
  const { addLine } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function addWithoutLeavingThePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const line = cartLineFromForm(new FormData(event.currentTarget));
    setIsAdding(true);
    try {
      const response = await addLine(line);
      setErrorMessage(response.ok ? null : response.message);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <form action={cartUrl} method="get" onSubmit={addWithoutLeavingThePage} className={className}>
      {children}
      {withQuantity ? (
        <QuantityAndSubmit isAdding={isAdding} submitLabel={submitLabel} />
      ) : (
        <>
          <input type="hidden" name="quantity" value={1} />
          <SubmitButton isAdding={isAdding} submitLabel={submitLabel} />
        </>
      )}
      {errorMessage !== null && (
        <p role="alert" className="text-small font-semibold">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

const stepButtonClassName =
  "flex h-6 w-5 items-center justify-center rounded-box bg-surface text-body font-semibold transition-[background-color,scale] duration-(--duration-reveal) ease-(--ease-out) mouse:hover:bg-accent active:scale-[0.92] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none";

function QuantityAndSubmit({ isAdding, submitLabel }: { isAdding: boolean; submitLabel: ReactNode }) {
  const quantityRef = useRef<HTMLInputElement>(null);

  function stepQuantity(direction: "up" | "down") {
    const quantityInput = quantityRef.current;
    if (quantityInput === null) {
      return;
    }
    if (direction === "up") {
      quantityInput.stepUp();
    } else {
      quantityInput.stepDown();
    }
  }

  return (
    <div className="z-10 bg-paper max-md:sticky max-md:bottom-0 max-md:-mx-2 max-md:px-2 max-md:py-1.5">
      <label htmlFor="ilosc" className="font-semibold">
        Ilość
      </label>
      <div className="mt-1 flex gap-1">
        <div className="flex gap-0.5">
          <button type="button" aria-label="Mniej sztuk" onClick={() => stepQuantity("down")} className={stepButtonClassName}>
            −
          </button>
          <input
            ref={quantityRef}
            id="ilosc"
            type="number"
            name="quantity"
            defaultValue={1}
            min={1}
            step={1}
            inputMode="numeric"
            required
            className="h-6 w-7 [appearance:textfield] rounded-box bg-surface text-center tabular-nums focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button type="button" aria-label="Więcej sztuk" onClick={() => stepQuantity("up")} className={stepButtonClassName}>
            +
          </button>
        </div>
        <SubmitButton isAdding={isAdding} submitLabel={submitLabel} />
      </div>
    </div>
  );
}

function SubmitButton({ isAdding, submitLabel }: { isAdding: boolean; submitLabel: ReactNode }) {
  return (
    <Button variant="primary" type="submit" disabled={isAdding}>
      {isAdding ? "Dodaję…" : submitLabel}
    </Button>
  );
}
