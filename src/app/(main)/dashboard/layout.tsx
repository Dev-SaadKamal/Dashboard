import type { ReactNode } from "react";

import { cookies } from "next/headers";
import { cn } from "cn";

import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getPreference } from "@/server/server-actions";
import { createClient } from "@/lib/supabase/server";

import { users } from "@/data/users";
import { AccountSwitcher } from "./_components/header/account-switcher";
import { GitHubRepositoriesMenu } from "./_components/header/github-repositories-menu";
import { LayoutControls } from "./_components/header/layout-controls";
import { SearchDialog } from "./_components/header/search-dialog";
import { ThemeSwitcher } from "./_components/header/theme-switcher";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const [variant, collapsible] = await Promise.all([
    getPreference("sidebar_variant"),
    getPreference("sidebar_collapsible"),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUser = {
    name: (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "Saad Kamal",
    email: user?.email || "saadkamal937@gmail.com",
    avatar: "",
    role: (user?.app_metadata?.role || user?.user_metadata?.role || "viewer").toLowerCase(),
  };

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 68)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant={variant} collapsible={collapsible} user={currentUser} />
      <SidebarInset
        className={cn(
          "[html[data-content-layout=centered]_&>*]:mx-auto",
          "[html[data-content-layout=centered]_&>*]:w-full",
          "[html[data-content-layout=centered]_&>*]:max-w-screen-2xl",
          "peer-data-[variant=inset]:border",
          "[--dashboard-header-height:--spacing(12)]",
          "min-w-0 overflow-x-clip",
        )}
      >
        <header
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
            "sticky top-0 z-50 bg-background/80 backdrop-blur-xs",
          )}
        >
          <div className="flex w-full items-center justify-between px-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <SidebarTrigger className="-ml-1" />
              <SearchDialog />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <GitHubRepositoriesMenu />
              <ThemeSwitcher />
              <AccountSwitcher users={users} />
              <LayoutControls />
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
