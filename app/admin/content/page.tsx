import { PageTitle } from "@/components/crm/page-header";
import { PageList } from "@/components/content/page-list";

/** Phần và nội dung: pick a page (header) to edit its sections. */
const ContentIndexPage = (): React.JSX.Element => (
  <>
    <PageTitle title="Phần và nội dung" description="Chọn trang để quản lý section → card → content." />
    <PageList />
  </>
);

export default ContentIndexPage;
