"use client";

import { usePathname } from "next/navigation";

export function HeaderSearch() {
  const isHomePage = usePathname() === "/";
  if (isHomePage) {
    return null;
  }

  return (
    <form action="/szukaj/" role="search" className="order-last w-full md:order-none md:w-auto md:flex-1">
      <label htmlFor="szukaj" className="sr-only">
        Szukaj produktu po nazwie albo kodzie
      </label>
      <input
        id="szukaj"
        name="q"
        type="search"
        required
        maxLength={100}
        placeholder="Szukaj po nazwie albo kodzie, np. RMICRONYL"
        className="w-full max-w-70 border-2 border-ink bg-paper px-2 py-1 text-body text-ink placeholder:text-mute focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      />
    </form>
  );
}
