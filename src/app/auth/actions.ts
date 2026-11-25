"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard/ecommerce";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function createUser(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { error: "You must be logged in." };
  }

  const currentRole = (
    currentUser.app_metadata?.role ||
    currentUser.user_metadata?.role ||
    "viewer"
  ).toLowerCase();

  if (currentRole !== "admin") {
    return { error: "Permission denied: Only Admins can create users." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = ((formData.get("role") as string) || "viewer").toLowerCase();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  if (!["admin", "viewer"].includes(role)) {
    return { error: "Role must be either 'admin' or 'viewer'." };
  }

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || email.split("@")[0],
        role,
      },
      app_metadata: {
        role,
      },
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/users");
    return { success: true, user: data.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create user";
    return { error: message };
  }
}

export async function listUsers() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { error: "Unauthorized", users: [] };
  }

  const currentRole = (
    currentUser.app_metadata?.role ||
    currentUser.user_metadata?.role ||
    "viewer"
  ).toLowerCase();

  if (currentRole !== "admin") {
    return { error: "Forbidden", users: [] };
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.listUsers();

  if (error) {
    return { error: error.message, users: [] };
  }

  return {
    users: data.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      role: (u.app_metadata?.role || u.user_metadata?.role || "viewer").toLowerCase(),
      fullName: (u.user_metadata?.full_name as string) || u.email?.split("@")[0] || "User",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at,
    })),
  };
}
