import Link from "next/link";
import { toLocalPath } from "@/lib/catalog-paths";
import { listCategories } from "@/lib/store-api";
import type { Category } from "@/lib/store-api";

export default async function HomePage() {
  const categories = await listCategories();
  const topLevelCategories = categories.filter((category) => category.parent === 0);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Wertes</h1>
      {topLevelCategories.map((topLevelCategory) => (
        <CategorySection
          key={topLevelCategory.id}
          category={topLevelCategory}
          allCategories={categories}
        />
      ))}
    </main>
  );
}

function CategorySection({
  category,
  allCategories,
}: {
  category: Category;
  allCategories: Category[];
}) {
  const subcategories = allCategories.filter((candidate) => candidate.parent === category.id);

  return (
    <section className="mb-6">
      <h2 className="font-medium">
        <Link href={toLocalPath(category.permalink)}>
          {category.name} ({category.count})
        </Link>
      </h2>
      <ul className="mt-2 grid grid-cols-2 gap-1 text-sm md:grid-cols-4">
        {subcategories.map((subcategory) => (
          <li key={subcategory.id}>
            <Link href={toLocalPath(subcategory.permalink)}>
              {subcategory.name} ({subcategory.count})
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
