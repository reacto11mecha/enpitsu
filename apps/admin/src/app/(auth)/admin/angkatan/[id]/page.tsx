import { redirect } from "next/navigation";
import { asc, db, eq, schema } from "@enpitsu/db";

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

  const subgrades = await db.query.subGrades.findMany({
    where: eq(schema.subGrades.gradeId, gradeId),
    with: {
      grade: true,
    },
    orderBy: [asc(schema.subGrades.label)],
  });

  return (
    <div className="mt-5 flex flex-col gap-7 px-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          Halaman Spesifik Angkatan — {specificGrade.label}
        </h2>
        <p className="text-muted-foreground">
          Input data rombongan belajar pada halaman ini. Klik sesuai rombel
          untuk mengelola masing-masing kelas.
        </p>
      </div>

      <div className="flex flex-col gap-5 pb-10">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          List Subkelas
        </h4>

        <DataTable currentGrade={specificGrade} initialData={subgrades} />
      </div>
    </div>
  );
}
