import Link from "next/link";
import { toLocalPath } from "@/lib/catalog-paths";
import type { Category } from "@/lib/store-api";
import { formatCount } from "./catalog";

export function OtherDepartments({ departments }: { departments: Category[] }) {
  return (
    <section aria-labelledby="pozostale-dzialy" className="mt-8">
      <h2 id="pozostale-dzialy" className="font-semibold">
        Pozostałe działy
      </h2>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {departments.map((department) => (
          <li key={department.id}>
            <Link href={toLocalPath(department.permalink)} className="link-line">
              <span className="font-semibold">{department.name}</span>{" "}
              <span className="text-small text-mute">{formatCount(department.count)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
