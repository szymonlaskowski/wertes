import Image from "next/image";
import Link from "next/link";
import { HeaderSearch } from "@/components/header-search";
import { company } from "@/lib/company";
import { wordpressUrl } from "@/lib/store-api";

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center gap-x-2 gap-y-2 px-2 py-3 md:gap-x-3 md:px-5">
      <Link href="/">
        <Image src="/wertes-logo.svg" alt="wertes, strona główna" width={152} height={30} priority />
      </Link>
      <HeaderSearch />
      <a href={company.phoneHref} className="ml-auto link-line">
        {company.phone}
      </a>
      <a href={wordpressUrl("/moje-konto/")} className={iconLinkClassName}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
        <span className="sr-only">Konto</span>
      </a>
      <a href={wordpressUrl("/koszyk/")} className={iconLinkClassName}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName}>
          <path d="M2.5 9.5h19l-2.2 10.5H4.7z" />
          <path d="M7 9.5 11 3.5M17 9.5 13 3.5" />
          <path d="M9 13v4M15 13v4" />
        </svg>
        <span className="sr-only">Koszyk</span>
      </a>
    </header>
  );
}

const iconLinkClassName =
  "group -m-1 p-1 focus-visible:outline-2 focus-visible:outline-ink";
const iconClassName =
  "size-3.5 fill-none stroke-ink stroke-[1.4] [stroke-linecap:round] [stroke-linejoin:round] group-hover:stroke-2";
