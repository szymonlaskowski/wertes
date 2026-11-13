import Link from "next/link";
import { CookieConsent } from "@/components/cookie-consent";
import { company } from "@/lib/company";
import { wordpressUrl } from "@/lib/store-api";

const shopPages = [
  { label: "O nas", path: "/o-nas/" },
  { label: "Kontakt", path: "/kontakt/" },
  { label: "Jak złożyć zamówienie", path: "/wiedza/jak-zlozyc-zamowienie/" },
  { label: "Koszt i czas dostawy", path: "/wiedza/koszt-i-czas-transportu/" },
  { label: "Rabaty na duże zamówienia", path: "/rabaty-na-duze-zamowienia/" },
  { label: "Znakowanie odzieży", path: "/znakowanie-odziezy/" },
  { label: "Zwrot zamówienia", path: "/zwroty-i-wymiany/" },
  { label: "Reklamacje", path: "/reklamacje/" },
  { label: "Tabele rozmiarów", path: "/tabele-rozmiarow/" },
  { label: "Regulamin sklepu", path: "/regulamin/" },
  { label: "Polityka prywatności", path: "/polityka-prywatnosci/" },
];

export function SiteFooter() {
  return (
    <footer className="page-width order-last mt-auto grid gap-1 pt-16 pb-4 text-small">
      <p>
        <span className="mr-1 font-semibold">{company.name}</span>
        {company.address}. NIP {company.taxId}.{" "}
        <a href={company.phoneHref} className="link-line">
          {company.phone}
        </a>
        ,{" "}
        <a href={company.emailHref} className="link-line">
          {company.email}
        </a>
      </p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {shopPages.map((page) => (
          <li key={page.path}>
            <Link href={page.path} className="link-line">
              {page.label}
            </Link>
          </li>
        ))}
        <li>
          <a href={wordpressUrl("/moje-konto/")} className="link-line">
            Moje konto
          </a>
        </li>
        <li>
          <CookieConsent />
        </li>
      </ul>
    </footer>
  );
}
