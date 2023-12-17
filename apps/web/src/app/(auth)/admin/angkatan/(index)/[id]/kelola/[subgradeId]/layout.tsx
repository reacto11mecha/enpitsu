import { redirect } from "next/navigation";
import { db, eq, schema } from "@enpitsu/db";

export default async function Layout(props: {
  children: React.ReactNode;
  params: { id: string; subgradeId: string };
}) {
  const gradeId = parseInt(props.params.id);
  const subgradeId = parseInt(props.params.subgradeId);

  if (isNaN(gradeId) || isNaN(subgradeId)) return redirect("/admin/angkatan");

  const specificGrade = await db.query.grades.findFirst({
    where: eq(schema.grades.id, gradeId),
  });

  if (!specificGrade) return redirect("/admin/angkatan");

  const specificSubgrade = await db.query.subGrades.findFirst({
    where: eq(schema.subGrades.id, subgradeId),
  });

  if (!specificSubgrade) return redirect("/admin/angkatan");

  return <>{props.children}</>;
}
