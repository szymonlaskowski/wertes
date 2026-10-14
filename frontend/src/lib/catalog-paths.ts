const FIRST_PAGE = 1;
const PAGE_MARKER = "page";

export function toLocalPath(wordpressPermalink: string) {
  return new URL(wordpressPermalink).pathname;
}

export function routeSegments(wordpressPermalink: string) {
  const segments = toLocalPath(wordpressPermalink)
    .split("/")
    .filter((segment) => segment !== "");
  const segmentsAfterRouteName = segments.slice(1);
  return segmentsAfterRouteName;
}

export function parseCategorySegments(segments: string[]) {
  const pageMarkerIndex = segments.length - 2;
  const hasPageSuffix = segments[pageMarkerIndex] === PAGE_MARKER;
  if (!hasPageSuffix) {
    return { categorySegments: segments, page: FIRST_PAGE };
  }

  const page = Number(segments.at(-1));
  const isListedPageNumber = Number.isInteger(page) && page > FIRST_PAGE;
  if (!isListedPageNumber) {
    return undefined;
  }
  return { categorySegments: segments.slice(0, pageMarkerIndex), page };
}

export function categoryPagePath(categoryPath: string, page: number) {
  if (page === FIRST_PAGE) {
    return categoryPath;
  }
  return `${categoryPath}${PAGE_MARKER}/${page}/`;
}
