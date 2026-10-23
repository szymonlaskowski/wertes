import { company } from "@/lib/company";
import { wordpressUrl } from "@/lib/store-api";

const helpPages = [
  { label: "Rabaty na duże zamówienia", path: "/rabaty-na-duze-zamowienia/" },
  { label: "Zwrot zamówienia", path: "/zwroty-i-wymiany/" },
  { label: "Reklamacje", path: "/reklamacje/" },
  { label: "Tabele rozmiarów", path: "/tabele-rozmiarow/" },
  { label: "Regulamin sklepu", path: "/regulamin/" },
  { label: "Polityka prywatności", path: "/polityka-prywatnosci/" },
  { label: "Moje konto", path: "/moje-konto/" },
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
        {helpPages.map((page) => (
          <li key={page.path}>
            <a href={wordpressUrl(page.path)} className="link-line">
              {page.label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
