import { redirect } from "next/navigation";
import { db, eq, schema } from "@enpitsu/db";

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
