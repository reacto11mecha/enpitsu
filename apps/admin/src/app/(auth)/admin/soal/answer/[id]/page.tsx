import { redirect } from "next/navigation";
import { db, eq, schema } from "@enpitsu/db";

import { DataTable } from "~/_components/Soal/AnswerList/DataTable";

export default async function AnswerListPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id);

  if (isNaN(id)) return redirect("/admin/soal");

  const question = await db.query.questions.findFirst({
    where: eq(schema.questions.id, id),
    columns: {
      id: true,
      title: true,
    },
  });

  if (!question) return redirect("/admin/soal");

  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[85%]">
        <div className="mb-5 space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Daftar Jawaban Peserta
          </h2>
          <p className="text-muted-foreground w-full md:w-[85%] lg:w-[75%]">
            Cek jawaban peserta, ubah nilai esai yang salah, unduh excel jawaban
            pada halaman ini juga.
          </p>
        </div>

        <DataTable questionId={question.id} title={question.title} />
      </div>
    </div>
  );
}
