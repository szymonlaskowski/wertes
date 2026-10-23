import Link from "next/link";
import { Button } from "@/components/button";
import { CountedLink } from "@/components/counted-link";
import { MegaNav } from "@/components/mega-nav";
import { BRANDS_SLUG, childrenOf, findBySlug, formatCount, productCountLabel } from "@/lib/catalog";
import { toLocalPath } from "@/lib/catalog-paths";
import { listCategories, wordpressUrl, type Category } from "@/lib/store-api";

const MENU_DEPARTMENT_SLUGS = ["artykuly-bhp", "przemysl", "promocje-i-nowosci"];
const ROWS_PER_GROUP = 14;

const wordpressPages = [
  { label: "O nas", path: "/o-nas/" },
  { label: "Kontakt", path: "/kontakt/" },
];

const infoLinkClassName = "inline-flex pt-1 pb-2 font-semibold";

export async function DepartmentNav() {
  const categories = await listCategories();
  const departments = MENU_DEPARTMENT_SLUGS.map((slug) => findBySlug(categories, slug));

  return (
    <nav aria-label="Menu główne" className="relative flex flex-wrap justify-between gap-x-4 px-2 md:px-5">
      <MegaNav
        departments={departments.map((department) => ({
          id: department.id,
          href: toLocalPath(department.permalink),
          label: department.name,
          count: formatCount(department.count),
          panel: <DepartmentPanel department={department} categories={categories} />,
        }))}
      />
      <ul className="flex flex-wrap gap-x-4">
        <li>
          <Link href="/wiedza/" className={infoLinkClassName}>
            <span className="link-line">Wiedza</span>
          </Link>
        </li>
        {wordpressPages.map((page) => (
          <li key={page.path}>
            <a href={wordpressUrl(page.path)} className={infoLinkClassName}>
              <span className="link-line">{page.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function DepartmentPanel({ department, categories }: { department: Category; categories: Category[] }) {
  const children = nonEmptyChildren(categories, department);
  const brands = children.filter((child) => child.slug === BRANDS_SLUG);
  const productGroups = children.filter((child) => child.slug !== BRANDS_SLUG);
  const groups = [...productGroups, ...brands];

  return (
    <>
      <ul className="columns-5 gap-x-6">
        {groups.map((group) => (
          <PanelGroup key={group.id} group={group} categories={categories} />
        ))}
      </ul>
      <p className="mt-4">
        <Button variant="secondary" href={toLocalPath(department.permalink)}>
          Cały dział {department.name}, {productCountLabel(department.count)}
        </Button>
      </p>
    </>
  );
}

function PanelGroup({ group, categories }: { group: Category; categories: Category[] }) {
  const rows = nonEmptyChildren(categories, group);
  const visibleRows = rows.slice(0, ROWS_PER_GROUP);
  const hasHiddenRows = rows.length > visibleRows.length;

  return (
    <li className="mb-4 break-inside-avoid">
      <Link href={toLocalPath(group.permalink)} className="font-semibold link-line">
        {group.name}
      </Link>{" "}
      <span className="text-small text-mute tabular-nums">{formatCount(group.count)}</span>
      {visibleRows.length > 0 && (
        <ul className="mt-1 text-small">
          {visibleRows.map((row) => (
            <li key={row.id}>
              <CountedLink category={row} />
            </li>
          ))}
        </ul>
      )}
      {hasHiddenRows && (
        <Link href={toLocalPath(group.permalink)} className="mt-1 inline-block text-small font-semibold link-line">
          Wszystkie, {formatCount(rows.length)}
        </Link>
      )}
    </li>
  );
}

function nonEmptyChildren(categories: Category[], parent: Category) {
  return childrenOf(categories, parent).filter((child) => child.count > 0);
}
