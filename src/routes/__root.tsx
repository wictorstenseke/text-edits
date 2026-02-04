import { createRootRoute, Outlet } from "@tanstack/react-router";

import { ThemeProvider } from "@/components/theme-provider";

const RootComponent = () => {
  return (
    <ThemeProvider defaultMode="system" storageKey="vite-ui-theme">
      <Outlet />
    </ThemeProvider>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
