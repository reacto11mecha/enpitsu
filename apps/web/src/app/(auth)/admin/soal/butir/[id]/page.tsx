import { redirect } from "next/navigation";
import { db, eq, schema } from "@enpitsu/db";

export default async function QuestionItemsPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id);

  if (isNaN(id)) return redirect("/admin/soal");

  const question = await db.query.questions.findFirst({
    where: eq(schema.questions.id, id),
  });

  if (!question) return redirect("/admin/soal");

  console.log(question);

  return <></>;
}
