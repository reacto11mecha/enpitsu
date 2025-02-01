import { redirect } from "next/navigation";
import { asc, eq } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";

import { DataTable } from "~/_components/Angkatan/SpecificSubgrade/DataTable";

export default async function ManageSpecificSubgrade(props: {
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

  if (specificSubgrade.gradeId !== specificGrade.id)
    return redirect("/admin/angkatan");

  const students = await db.query.students.findMany({
    where: eq(schema.students.subgradeId, subgradeId),
    orderBy: [asc(schema.students.name)],
  });

  return (
    <div className="mt-5 flex flex-col gap-7 px-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          Halaman Kelola Kelas — {specificGrade.label} {specificSubgrade.label}
        </h2>
        <p className="text-muted-foreground">
          Kelola murid-murid kelas {specificGrade.label}{" "}
          {specificSubgrade.label} untuk ditambahkan, diubah, maupun di hapus.
          Klik simbol titik tiga pada murid spesifik pada tabel untuk
          mengelolanya lebih lanjut.
        </p>
      </div>

      <div className="flex flex-col gap-5 pb-10">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Daftar Siswa-Siswi
        </h4>

        <DataTable
          subgrade={specificSubgrade}
          grade={specificGrade}
          initialData={students}
        />
      </div>
    </div>
  );
}
