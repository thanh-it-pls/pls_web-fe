import { PageContentView } from "@/components/content/page-content-view";

/** Content of one page (header): live canvas + section list. */
const PageSectionsPage = async ({ params }: { params: Promise<{ pageId: string }> }): Promise<React.JSX.Element> => {
  const { pageId } = await params;
  return <PageContentView pageId={pageId} />;
};

export default PageSectionsPage;
