import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?returnTo=/admin/dashboard");
  }

  if (session.role !== "ADMIN") {
    redirect("/player/dashboard");
  }

  redirect("/admin/dashboard");
}
