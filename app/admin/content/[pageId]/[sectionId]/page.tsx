import { SectionEditor } from "@/components/content/section-editor";

/** One section: edit its fields, then manage its cards and their contents. */
const SectionPage = async ({
  params,
}: {
  params: Promise<{ pageId: string; sectionId: string }>;
}): Promise<React.JSX.Element> => {
  const { pageId, sectionId } = await params;
  return <SectionEditor pageId={pageId} sectionId={sectionId} />;
};

export default SectionPage;
