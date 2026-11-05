"use client";

import type { MouseEvent } from "react";
import { CartIcon } from "@/components/icons";
import { useCart } from "./cart-provider";

export function CartButton({ cartPageUrl, className }: { cartPageUrl: string; className: string }) {
  const { cart, openCart } = useCart();
  const itemCount = cart === null ? 0 : cart.items_count;

  function openDrawerInstead(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    openCart();
  }

  return (
    <a href={cartPageUrl} onClick={openDrawerInstead} className={className}>
      <span className="relative">
        <CartIcon />
        {itemCount > 0 && (
          <span
            key={itemCount}
            className="absolute -top-1.5 -right-1 flex h-2.5 min-w-2.5 motion-safe:animate-bump items-center justify-center rounded-box bg-accent px-0.5 text-small leading-none font-bold text-ink tabular-nums"
          >
            {itemCount}
          </span>
        )}
      </span>
      <span className="link-line max-sm:sr-only">Koszyk</span>
      {itemCount > 0 && <span className="sr-only">, produktów: {itemCount}</span>}
    </a>
  );
}
