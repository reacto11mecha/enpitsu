import { redirect } from "next/navigation";

import { eq } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";

export default async function Layout(props: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const pageId = parseInt(props.params.id);

  if (isNaN(pageId)) return redirect("/admin/angkatan");

  const specificGrade = await db.query.grades.findFirst({
    where: eq(schema.grades.id, pageId),
  });

  if (!specificGrade) return redirect("/admin/angkatan");

  return <>{props.children}</>;
}
