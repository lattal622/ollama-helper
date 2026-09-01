import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { type ReactNode } from "react";

const queryClient = new QueryClient();

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" },
      { title: "Football AI" },
      { name: "theme-color", content: "#0EA5E9" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  component: () => (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-sky-50">
        <Outlet />
      </div>
    </QueryClientProvider>
  ),
});
