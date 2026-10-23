import Image from "next/image";
import Link from "next/link";
import { DepartmentNav } from "@/components/department-nav";
import { AccountIcon, CartIcon } from "@/components/icons";
import { SearchBox } from "@/components/search-box";
import { listSuggestibleCategories } from "@/lib/catalog";
import { company } from "@/lib/company";
import { listCategories, wordpressUrl } from "@/lib/store-api";

export async function SiteHeader() {
  const suggestibleCategories = listSuggestibleCategories(await listCategories());

  return (
    <header className="border-b-2 border-surface">
      <TopBar />
      <div className="page-width flex flex-wrap items-end gap-x-3 gap-y-2 py-2 md:gap-x-5">
        <Link href="/" className="pb-1">
          <Image src="/wertes-logo.svg" alt="wertes, strona główna" width={152} height={30} priority />
        </Link>
        <SearchBox categories={suggestibleCategories} />
        <div className="ml-auto flex items-center gap-3 pb-1.5 font-semibold md:ml-0">
          <a href={wordpressUrl("/moje-konto/")} className={iconLinkClassName}>
            <AccountIcon />
            <span className="link-line max-sm:sr-only">Konto</span>
          </a>
          <a href={wordpressUrl("/koszyk/")} className={iconLinkClassName}>
            <CartIcon />
            <span className="link-line max-sm:sr-only">Koszyk</span>
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-180">
        <DepartmentNav />
      </div>
    </header>
  );
}

function TopBar() {
  return (
    <div className="bg-ink text-small text-paper">
      <div className="page-width flex flex-wrap items-center gap-x-4 py-1">
        <b className="font-semibold">Sklep i&nbsp;hurtownia BHP</b>
        <span>Darmowa dostawa od&nbsp;{company.freeShippingFrom}</span>
        <span className="max-md:hidden">Faktura VAT do&nbsp;każdego zamówienia</span>
        <a
          href={company.phoneHref}
          className="ml-auto font-semibold text-accent focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className="link-line">{company.phone}</span>
        </a>
      </div>
    </div>
  );
}

const iconLinkClassName = "group flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-ink";
