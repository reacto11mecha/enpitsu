import { redirect } from "next/navigation";

import { auth } from "@enpitsu/auth";

export default async function Layout(props: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) return redirect("/login");

  if (session.user.role !== "admin") return redirect("/admin/soal");

  return <>{props.children}</>;
}
