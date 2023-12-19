import { redirect } from "next/navigation";
import { db, eq, schema } from "@enpitsu/db";

import { DataTable } from "~/_components/Angkatan/SpecificGrade/DataTable";

export default async function DynamicAngkatan({
  params,
}: {
  params: { id: string };
}) {
  const gradeId = parseInt(params.id);

  const specificGrade = await db.query.grades.findFirst({
    where: eq(schema.grades.id, gradeId),
  });

  if (!specificGrade) return redirect("/admin/angkatan");

  return (
    <div className="mt-5 flex flex-col gap-10 px-5">
      <div className="flex flex-col">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          Halaman Kelas — {specificGrade.label}
        </h2>

        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Input sub kelas dan murid pada halaman ini. Klik sesuai tingkatan
          untuk mengelola.
        </p>
      </div>

      <div className="flex flex-col gap-5 pb-10">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          List Subkelas
        </h4>

        <DataTable currentGrade={specificGrade} />
      </div>
    </div>
  );
}
