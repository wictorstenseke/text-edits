import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/theme-provider";

const RootComponent = () => {
  const router = useRouterState();
  const isEditorRoute = router.location.pathname === "/editor";

  return (
    <ThemeProvider defaultMode="system" storageKey="vite-ui-theme">
      {isEditorRoute ? (
        <Outlet />
      ) : (
        <AppShell>
          <Outlet />
        </AppShell>
      )}
    </ThemeProvider>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
