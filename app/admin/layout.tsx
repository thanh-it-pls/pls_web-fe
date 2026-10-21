import type { ReactNode } from "react";

import { Sidebar } from "@/components/crm/sidebar";

/** CRM shell: fixed sidebar + scrollable main area. */
const CrmLayout = ({ children }: { children: ReactNode }): React.JSX.Element => (
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="min-w-0 flex-1 p-8">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  </div>
);

export default CrmLayout;
