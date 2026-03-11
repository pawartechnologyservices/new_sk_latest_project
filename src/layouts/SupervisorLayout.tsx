import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/shared/DashboardSidebar";

const SupervisorLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar 
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        <Outlet context={{ onMenuClick: () => setMobileOpen(true) }} />
      </main>
    </div>
  );
};

export default SupervisorLayout;