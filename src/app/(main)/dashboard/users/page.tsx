import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listUsers } from "@/app/auth/actions";
import { UsersManager } from "./_components/users-manager";

export const metadata = {
  title: "User Management",
};

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/dashboard/users");
  }

  const role = (user.app_metadata?.role || user.user_metadata?.role || "viewer").toLowerCase();
  if (role !== "admin") {
    redirect("/dashboard/ecommerce");
  }

  const usersResult = await listUsers();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground text-sm">
            Manage system access, create administrators and dashboard viewers.
          </p>
        </div>
      </div>
      <UsersManager initialUsers={usersResult.users || []} />
    </div>
  );
}
