const articleDate = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatArticleDate(isoDate: string) {
  return articleDate.format(new Date(isoDate));
}
