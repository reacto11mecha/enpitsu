import { redirect } from "next/navigation";
import { count, db, eq, schema } from "@enpitsu/db";

import { EditParentQuestion } from "~/_components/Soal/EditParentQuestion";

export default async function NewQuestion({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id);

  if (isNaN(id)) return redirect("/admin/soal");

  const subgradeCount = await db
    .select({ value: count() })
    .from(schema.subGrades);

  if (subgradeCount.at(0)!.value < 1) return redirect("/admin/baru");

  const questionCount = await db
    .select({ value: count() })
    .from(schema.questions)
    .where(eq(schema.questions.id, id));

  if (questionCount.at(0)!.value < 1) return redirect("/admin/soal");

  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[85%]">
        <div className="mb-5 space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Edit Identitas Soal
          </h2>
          <p className="text-muted-foreground w-full md:w-[85%] lg:w-[75%]">
            Perbaiki identitas soal yang salah pada halaman ini, jangan lupa
            untuk disimpan perubahannya. Jika sudah, akan di arahkan ke halaman
            daftar soal.
          </p>
        </div>

        <EditParentQuestion id={id} />
      </div>
    </div>
  );
}
