import { Outlet } from "react-router-dom";
import { MainLayout } from "@/components/layout";

/**
 * Layout route wrapper that provides MainLayout to nested routes
 */
export function LayoutRoute() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

