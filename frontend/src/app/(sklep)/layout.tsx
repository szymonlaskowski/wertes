import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="mx-auto w-full max-w-180">
        <SiteHeader />
      </div>
      {children}
      <div className="mx-auto mt-auto w-full max-w-180">
        <SiteFooter />
      </div>
    </div>
  );
}
