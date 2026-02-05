"use server";

import { redirect } from "next/navigation";

import { clearAdminSession, createAdminSession } from "@/auth/admin";

export async function adminLogin(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await createAdminSession({ username, password });
  if (!result.ok) {
    redirect("/admin/login?error=invalid");
  }

  redirect("/admin/slots");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/");
}

