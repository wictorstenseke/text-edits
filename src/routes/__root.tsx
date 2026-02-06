import { createRootRoute, Outlet } from "@tanstack/react-router";

import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultMode="system" storageKey="vite-ui-theme">
      <Outlet />
    </ThemeProvider>
  ),
});
