import Image from "next/image";
import Link from "next/link";
import { HeaderSearch } from "@/components/header-search";
import { AccountIcon, CartIcon } from "@/components/icons";
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
        <AccountIcon />
        <span className="sr-only">Konto</span>
      </a>
      <a href={wordpressUrl("/koszyk/")} className={iconLinkClassName}>
        <CartIcon />
        <span className="sr-only">Koszyk</span>
      </a>
    </header>
  );
}

const iconLinkClassName = "group -m-1 p-1 focus-visible:outline-2 focus-visible:outline-ink";
