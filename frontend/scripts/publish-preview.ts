import { $ } from "bun";

const previewUrl = Bun.argv[2] ?? "http://localhost:3000/podglad/";
const outputPath = `${import.meta.dir}/../design/podglad.html`;

const pageHtml = await fetchText(previewUrl);
const stylesheets = await inlineStylesheets(pageHtml);
const staticHtml = removeScriptsAndLinks(pageHtml);
const styledHtml = staticHtml.replace("</head>", `<style>${stylesheets}</style></head>`);
const html = await inlineLocalImages(styledHtml);

await Bun.write(outputPath, html);
await $`bunx postplan upload ${outputPath}`;

async function inlineStylesheets(pageHtml: string) {
  let css = "";
  for (const match of pageHtml.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)) {
    const stylesheetUrl = new URL(match[1], previewUrl);
    css += await inlineFonts(await fetchText(stylesheetUrl), stylesheetUrl);
  }
  return css;
}

async function inlineFonts(css: string, stylesheetUrl: URL) {
  let inlined = css;
  for (const match of css.matchAll(/url\(([^)]+\.woff2)\)/g)) {
    const fontUrl = new URL(match[1], stylesheetUrl);
    inlined = inlined.replaceAll(match[0], `url(${await toDataUrl(fontUrl, "font/woff2")})`);
  }
  return inlined;
}

async function inlineLocalImages(html: string) {
  let inlined = html;
  for (const match of html.matchAll(/src="(\/[^"]+\.svg)"/g)) {
    const imageUrl = new URL(match[1], previewUrl);
    inlined = inlined.replaceAll(match[0], `src="${await toDataUrl(imageUrl, "image/svg+xml")}"`);
  }
  return inlined;
}

function removeScriptsAndLinks(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<link\b[^>]*>/g, "");
}

async function toDataUrl(url: URL, mimeType: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}`);
  }
  const base64 = Buffer.from(await response.arrayBuffer()).toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

async function fetchText(url: string | URL) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}`);
  }
  return response.text();
}
