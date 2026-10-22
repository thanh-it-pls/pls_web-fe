import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteSections } from "@/components/site/site-sections";
import { getPublicTree, getSiteChrome } from "@/lib/site/data";

const normalize = (path: string): string => `/${path.split("/").filter(Boolean).join("/")}`.toLowerCase();

/**
 * Public storefront. `/` shows the page whose path is "/" (or the first page), any other URL shows the page
 * whose `path` matches. The CRM lives under /admin.
 */
const SitePage = async ({ params }: { params: Promise<{ slug?: string[] }> }): Promise<React.JSX.Element> => {
  const { slug } = await params;
  const path = normalize((slug ?? []).join("/"));

  const chrome = await getSiteChrome().catch(() => null);
  if (!chrome) return <p className="p-10 text-center text-sm text-neutral-600">Không tải được dữ liệu. Kiểm tra API.</p>;

  const page = chrome.headers.find((h) => normalize(h.path) === path) ?? (path === "/" ? chrome.headers[0] : undefined);
  if (!page) notFound();

  const sections = await getPublicTree(page.id).catch(() => null);
  if (!sections) return <p className="p-10 text-center text-sm text-neutral-600">Không tải được dữ liệu trang. Kiểm tra API.</p>;

  return (
    <div className="@container min-h-screen bg-white text-neutral-900">
      <SiteHeader chrome={chrome} activePageId={page.id} />
      <SiteSections sections={sections} settings={chrome.settings} />
      <SiteFooter chrome={chrome} />
    </div>
  );
};

export default SitePage;
