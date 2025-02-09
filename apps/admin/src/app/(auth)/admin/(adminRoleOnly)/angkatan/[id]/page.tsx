import { redirect } from "next/navigation";
import { eq } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";

import {
  ExcelStudentsByGradeDownload,
  ExcelUploadStudentsByGrade,
} from "~/_components/Angkatan/ExcelStudentsActivity";
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

      <div className="flex flex-col gap-3 pb-10">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          List Subkelas
        </h4>

        <div className="flex flex-col gap-3 md:flex-row">
          <ExcelStudentsByGradeDownload gradeId={gradeId} />
          <ExcelUploadStudentsByGrade gradeId={gradeId} />
        </div>

        <DataTable currentGrade={specificGrade} />
      </div>
    </div>
  );
}
