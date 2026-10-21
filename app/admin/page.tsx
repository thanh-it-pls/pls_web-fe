import { PageTitle } from "@/components/crm/page-header";
import { SettingsManager } from "@/components/crm/settings-manager";

/** Tổng quan: logo, social, version, footer contact and button settings. */
const OverviewPage = (): React.JSX.Element => (
  <>
    <PageTitle
      title="Tổng quan"
      description="Thiết lập logo, vị trí header/footer, mạng xã hội, phiên bản và các nút bấm của website."
    />
    <SettingsManager />
  </>
);

export default OverviewPage;
