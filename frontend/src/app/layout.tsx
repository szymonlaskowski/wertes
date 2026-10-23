import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "600", "700"],
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
    <html lang="pl" className={`${montserrat.variable} h-full antialiased`}>
      <head>
        <noscript>
          <style>{stylesWithoutJavaScript}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
