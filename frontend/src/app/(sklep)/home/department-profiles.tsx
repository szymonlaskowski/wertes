import Image from "next/image";
import Link from "next/link";
import { LogoDot } from "@/components/logo-dot";
import { toLocalPath } from "@/lib/catalog-paths";
import type { DepartmentProfile } from "@/lib/store-api";
import { firstParagraph, productCountLabel } from "./catalog";

export function DepartmentProfiles({ profiles }: { profiles: DepartmentProfile[] }) {
  return (
    <section aria-labelledby="nasze-dzialy" className="mt-10">
      <h2 id="nasze-dzialy" className="text-title lowercase">
        Nasze działy
        <LogoDot />
      </h2>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </section>
  );
}

function ProfileCard({ profile }: { profile: DepartmentProfile }) {
  return (
    <Link href={toLocalPath(profile.permalink)} className="block">
      {profile.image && (
        <span className="relative block aspect-[8/3] overflow-hidden">
          <Image
            src={profile.image.src}
            alt={profile.image.alt}
            fill
            sizes="(min-width: 768px) 45vw, 90vw"
            className="object-cover"
          />
        </span>
      )}
      <span className="mt-2 flex items-baseline justify-between gap-2">
        <span className="font-semibold link-line">{profile.name}</span>
        <span className="text-small text-mute tabular-nums">
          {productCountLabel(profile.count)}
        </span>
      </span>
      <span className="mt-1 block text-small text-mute">{firstParagraph(profile.description)}</span>
    </Link>
  );
}
