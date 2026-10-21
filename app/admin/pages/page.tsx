import { PageTitle } from "@/components/crm/page-header";
import { PageHeadersManager } from "@/components/crm/page-headers-manager";

/** Trang quản lý: CRUD of header pages (menu items). */
const PagesPage = (): React.JSX.Element => (
  <>
    <PageTitle title="Trang quản lý" description="Danh sách trang (menu header). Kéo thả để đổi thứ tự hiển thị." />
    <PageHeadersManager />
  </>
);

export default PagesPage;
