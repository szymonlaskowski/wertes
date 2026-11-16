import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { articlePath, findArticleBySlug } from "@/lib/articles";
import { wordpressUrl } from "@/lib/store-api";
import { bindSingleLetterWords } from "@/lib/typography";
import { cleanPageHtml, CONTENT_PAGE_SLUGS, findContentPage } from "@/lib/wordpress-pages";

export function generateStaticParams() {
  return CONTENT_PAGE_SLUGS.map((slug) => ({ strona: slug }));
}

export async function generateMetadata(props: PageProps<"/[strona]">): Promise<Metadata> {
  const { strona } = await props.params;
  const page = await loadPage(strona);
  return { title: page.title.rendered };
}

export default async function ContentPage(props: PageProps<"/[strona]">) {
  const { strona } = await props.params;
  const page = await loadPage(strona);
  const contentHtml = cleanPageHtml(page.content.rendered, wordpressUrl(""));

  return (
    <main className="page-width pt-3 pb-10">
      <div className="max-w-[20ch] text-title">
        <PageTitle>{bindSingleLetterWords(page.title.rendered)}</PageTitle>
      </div>
      <div className="article-body mt-5" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </main>
  );
}

async function loadPage(slug: string) {
  const isShopPage = CONTENT_PAGE_SLUGS.includes(slug);
  if (!isShopPage) {
    await redirectOldArticleAddress(slug);
    notFound();
  }
  const page = await findContentPage(slug);
  if (!page) {
    notFound();
  }
  return page;
}

async function redirectOldArticleAddress(slug: string) {
  const article = await findArticleBySlug(slug);
  if (article) {
    permanentRedirect(articlePath(article));
  }
}
