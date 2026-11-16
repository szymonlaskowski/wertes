import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { HelpWidget } from "@/components/help-widget";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin", "latin-ext"],
  weight: ["800"],
});

export const metadata: Metadata = {
  title: { default: "Wertes", template: "%s | Wertes" },
};

const stylesWithoutJavaScript = `
  @layer base {
    [aria-busy="true"] { display: none !important; }
    body > div[hidden][id^="S:"] { display: contents !important; }
    body > div[hidden][id^="S:"]:not(:has(main)) {
      display: block !important;
      width: 100%;
      max-width: 1440px;
      margin-inline: auto;
      padding-inline: 16px;
    }
    @media (min-width: 768px) {
      body > div[hidden][id^="S:"]:not(:has(main)) { padding-inline: 40px; }
    }
  }
  [data-collapsible] { max-height: none !important; mask: none !important; }
  [data-collapsible-toggle] { display: none !important; }
  li:hover > [data-mega-panel],
  li:focus-within > [data-mega-panel] {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
    background: var(--color-surface);
  }
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <head>
        <noscript>
          <style>{stylesWithoutJavaScript}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
        <HelpWidget />
      </body>
    </html>
  );
}
