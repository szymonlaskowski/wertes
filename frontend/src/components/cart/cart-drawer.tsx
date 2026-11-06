"use client";

import Image from "next/image";
import Link from "next/link";
import { type MouseEvent, useEffect, useRef } from "react";
import { Button } from "@/components/button";
import { toLocalPath } from "@/lib/catalog-paths";
import { type Cart, type CartItem, formatGrosze } from "@/lib/cart";
import { company } from "@/lib/company";
import { useCart } from "./cart-provider";

const drawerClassName =
  "m-0 ml-auto h-dvh max-h-none w-full max-w-60 bg-paper p-0 text-ink translate-x-full transition-[translate,overlay,display] transition-discrete duration-(--duration-drawer) ease-(--ease-out) open:translate-x-0 starting:open:translate-x-full backdrop:bg-ink/0 backdrop:transition-[background-color,overlay,display] backdrop:transition-discrete backdrop:duration-(--duration-drawer) open:backdrop:bg-ink/60 starting:open:backdrop:bg-ink/0 motion-reduce:transition-none motion-reduce:backdrop:transition-none";

export function CartDrawer() {
  const { cart, isOpen, closeCart } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }
    if (isOpen && !dialog.open) {
      dialog.showModal();
    }
    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  function closeOnBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    const clickedOutsidePanel = event.target === event.currentTarget;
    if (clickedOutsidePanel) {
      closeCart();
    }
  }

  return (
    <dialog ref={dialogRef} aria-labelledby="koszyk" onClose={closeCart} onClick={closeOnBackdropClick} className={drawerClassName}>
      <div className="flex h-full flex-col">
        <header className="flex items-baseline justify-between gap-2 px-3 pt-3 pb-2">
          <h2 id="koszyk" className="text-title">
            Koszyk
          </h2>
          <button type="button" onClick={closeCart} className="text-small font-semibold">
            <span className="link-line">Zamknij</span>
          </button>
        </header>
        {cart !== null && cart.items.length > 0 ? <FilledCart cart={cart} /> : <EmptyCart />}
      </div>
    </dialog>
  );
}

function EmptyCart() {
  const { closeCart } = useCart();

  return (
    <div className="px-3">
      <p>Koszyk jest pusty.</p>
      <p className="mt-2">
        <Button variant="secondary" type="button" onClick={closeCart}>
          Wróć do zakupów
        </Button>
      </p>
    </div>
  );
}

function FilledCart({ cart }: { cart: Cart }) {
  const { checkoutUrl, errorMessage } = useCart();
  const netGrosze = Number(cart.totals.total_items);
  const grossGrosze = netGrosze + Number(cart.totals.total_items_tax);

  return (
    <>
      <FreeShippingProgress grossGrosze={grossGrosze} />
      <ul aria-label="Produkty w koszyku" className="flex-1 overflow-y-auto px-3 py-2">
        {cart.items.map((item) => (
          <li key={item.key}>
            <CartLineItem item={item} />
          </li>
        ))}
      </ul>
      <footer className="bg-surface px-3 pt-2 pb-3">
        {errorMessage !== null && (
          <p role="alert" className="mb-2 text-small font-semibold">
            {errorMessage}
          </p>
        )}
        <dl className="flex items-baseline justify-between gap-2">
          <dt className="font-semibold">Razem</dt>
          <dd className="text-right tabular-nums">
            <span className="block text-title">{formatGrosze(netGrosze)}</span>
            <span className="text-small text-mute">netto, {formatGrosze(grossGrosze)} brutto</span>
          </dd>
        </dl>
        <a
          href={checkoutUrl}
          className="mt-2 block bg-accent px-3 py-2 text-center font-semibold transition-[background-color,color,scale] duration-(--duration-reveal) ease-(--ease-out) mouse:hover:bg-ink mouse:hover:text-accent active:scale-[0.98] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none"
        >
          Przejdź do kasy
        </a>
        <p className="mt-1 text-center text-small text-mute">Dostawę, płatność i fakturę wybierzesz w kasie.</p>
      </footer>
    </>
  );
}

function FreeShippingProgress({ grossGrosze }: { grossGrosze: number }) {
  const threshold = company.freeShippingFromGrossGrosze;
  const missingGrosze = threshold - grossGrosze;
  const hasFreeShipping = missingGrosze <= 0;
  const filledFraction = Math.min(grossGrosze / threshold, 1);

  return (
    <div className="px-3 pb-2">
      <p className="text-small" aria-live="polite">
        {hasFreeShipping ? (
          <b className="font-semibold">Masz darmową dostawę.</b>
        ) : (
          <>
            Do darmowej dostawy brakuje <b className="font-semibold tabular-nums">{formatGrosze(missingGrosze)}</b>
          </>
        )}
      </p>
      <div aria-hidden="true" className="mt-1 h-1 overflow-hidden bg-surface">
        <div
          className="h-full origin-left bg-accent transition-[scale] duration-(--duration-drawer) ease-(--ease-out) motion-reduce:transition-none"
          style={{ scale: `${filledFraction} 1` }}
        />
      </div>
    </div>
  );
}

function CartLineItem({ item }: { item: CartItem }) {
  const { closeCart } = useCart();
  const thumbnail = item.images.at(0);
  const lineNetGrosze = Number(item.totals.line_subtotal);
  const variantText = item.variation.map((attribute) => `${attribute.attribute} ${attribute.value}`).join(", ");

  return (
    <article className="flex gap-2 py-1.5">
      <div className="relative size-10 shrink-0 bg-surface">
        {thumbnail && (
          <Image src={thumbnail.thumbnail} alt="" fill sizes="80px" className="object-contain p-0.5 mix-blend-multiply" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link href={toLocalPath(item.permalink)} onClick={closeCart} className="line-clamp-2 text-small font-semibold">
          <span className="link-line">{item.name}</span>
        </Link>
        {variantText && <p className="text-small text-mute">{variantText}</p>}
        <div className="mt-1 flex items-center justify-between gap-2">
          <QuantityStepper item={item} />
          <p className="text-right tabular-nums">
            <span className="block font-semibold">{formatGrosze(lineNetGrosze)}</span>
            <span className="text-small text-mute">netto</span>
          </p>
        </div>
      </div>
    </article>
  );
}

const stepperButtonClassName =
  "flex size-4 items-center justify-center bg-surface font-semibold transition-[background-color,scale] duration-(--duration-reveal) ease-(--ease-out) mouse:hover:bg-accent active:scale-[0.92] disabled:pointer-events-none disabled:text-mute motion-reduce:transition-none";

function QuantityStepper({ item }: { item: CartItem }) {
  const { isUpdating, changeQuantity, removeItem } = useCart();
  const canDecrease = item.quantity > item.quantity_limits.minimum;
  const canIncrease = item.quantity < item.quantity_limits.maximum;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Mniej: ${item.name}`}
        disabled={isUpdating || !canDecrease}
        onClick={() => changeQuantity(item.key, item.quantity - 1)}
        className={stepperButtonClassName}
      >
        −
      </button>
      <span className="min-w-3 text-center tabular-nums">
        <span className="sr-only">Ilość </span>
        {item.quantity}
      </span>
      <button
        type="button"
        aria-label={`Więcej: ${item.name}`}
        disabled={isUpdating || !canIncrease}
        onClick={() => changeQuantity(item.key, item.quantity + 1)}
        className={stepperButtonClassName}
      >
        +
      </button>
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => removeItem(item.key)}
        className="ml-1 text-small text-mute disabled:pointer-events-none"
      >
        <span className="link-line">Usuń</span>
        <span className="sr-only">: {item.name}</span>
      </button>
    </div>
  );
}
