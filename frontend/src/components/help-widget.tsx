import Script from "next/script";

const OPENWIDGET_ORGANIZATION_ID = "a6db8e09-40be-48bc-b8e2-fa5d998068e2";

const openWidgetSetup = `window.__ow = window.__ow || {}; window.__ow.organizationId = "${OPENWIDGET_ORGANIZATION_ID}";`;

export function HelpWidget() {
  return (
    <>
      <Script id="openwidget-setup" strategy="lazyOnload">
        {openWidgetSetup}
      </Script>
      <Script src="https://cdn.openwidget.com/openwidget.js" strategy="lazyOnload" />
    </>
  );
}
