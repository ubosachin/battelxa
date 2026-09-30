import { redirect } from "next/navigation";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      qs.set(key, value);
    }
  }
  if (!qs.has("tab")) {
    qs.set("tab", "register");
  }
  const query = qs.toString();
  redirect(`/login${query ? `?${query}` : ""}`);
}
