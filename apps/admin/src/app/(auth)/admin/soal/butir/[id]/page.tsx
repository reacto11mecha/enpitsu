import { redirect } from "next/navigation";
import { db, eq, schema } from "@enpitsu/db";

import { Questions } from "~/_components/Soal/QuestionItems/Questions";

export default async function QuestionItemsPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id);

  if (isNaN(id)) return redirect("/admin/soal");

  const question = await db.query.questions.findFirst({
    where: eq(schema.questions.id, id),
    columns: {
      title: true,
    },
  });

  if (!question) return redirect("/admin/soal");

  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[80%]">
        <div className="mb-5 space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Butir Soal</h2>
          <p className="w-full text-muted-foreground md:w-[80%] lg:w-[70%]">
            Tambah, ubah, edit, dan hapus soal pilihan ganda dan esai pada
            halaman ini. Jangan lupa tentukan jawaban benar pada setiap soal.
          </p>
        </div>

        <Questions questionId={id} title={question.title} />
      </div>
    </div>
  );
}
