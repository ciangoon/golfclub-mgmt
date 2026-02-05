import "server-only";

import { redirect } from "next/navigation";

import { getCurrentMember } from "./session";
import { isAdminAuthed } from "./admin";

export async function requireMember() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  return member;
}

export async function requireAdmin() {
  const ok = await isAdminAuthed();
  if (!ok) redirect("/admin/login");
}

