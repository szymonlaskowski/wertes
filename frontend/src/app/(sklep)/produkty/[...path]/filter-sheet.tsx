"use client";

import Link from "next/link";
import { type MouseEvent, type ReactNode, useRef } from "react";
import { Button } from "@/components/button";

const sheetClassName =
  "m-0 ml-auto h-dvh max-h-none w-full max-w-60 bg-paper p-0 text-ink translate-x-full transition-[translate,overlay,display] transition-discrete duration-(--duration-drawer) ease-(--ease-out) open:translate-x-0 starting:open:translate-x-full backdrop:bg-ink/0 backdrop:transition-[background-color,overlay,display] backdrop:transition-discrete backdrop:duration-(--duration-drawer) open:backdrop:bg-ink/60 starting:open:backdrop:bg-ink/0 motion-reduce:transition-none motion-reduce:backdrop:transition-none";

type FilterSheetProps = {
  selectedCount: number;
  resultLabel: string;
  clearHref: string | null;
  children: ReactNode;
};

export function FilterSheet({ selectedCount, resultLabel, clearHref, children }: FilterSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openLabel = selectedCount > 0 ? `Filtry (${selectedCount})` : "Filtry";

  function openSheet() {
    dialogRef.current?.showModal();
  }

  function closeSheet() {
    dialogRef.current?.close();
  }

  function closeOnBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    const clickedOutsideSheet = event.target === event.currentTarget;
    if (clickedOutsideSheet) {
      closeSheet();
    }
  }

  return (
    <div className="mb-3 md:hidden">
      <Button variant="secondary" type="button" onClick={openSheet}>
        {openLabel}
      </Button>
      <dialog ref={dialogRef} aria-labelledby="filtry-naglowek" onClick={closeOnBackdropClick} className={sheetClassName}>
        <div className="flex h-full flex-col">
          <header className="flex items-baseline justify-between gap-2 px-3 pt-3 pb-2">
            <h2 id="filtry-naglowek" className="text-title">
              Filtry
            </h2>
            <button type="button" onClick={closeSheet} className="text-small font-semibold">
              <span className="link-line">Zamknij</span>
            </button>
          </header>
          <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-3">{children}</div>
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-surface px-3 py-2">
            {clearHref !== null && (
              <Link href={clearHref} scroll={false} prefetch={false} className="shrink-0 text-small font-semibold">
                <span className="link-line">Wyczyść filtry</span>
              </Link>
            )}
            <span className="ml-auto grid shrink-0">
              <Button variant="primary" type="button" onClick={closeSheet}>
                Pokaż {resultLabel}
              </Button>
            </span>
          </footer>
        </div>
      </dialog>
    </div>
  );
}
