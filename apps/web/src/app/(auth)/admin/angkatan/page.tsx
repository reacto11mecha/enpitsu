import { db } from "@enpitsu/db";

import { AngkatanViewer } from "~/_components/Angkatan/AngkatanViewer";
import { NewAngkatan } from "~/_components/Angkatan/NewAngkatan";

export default async function AngkatanPage() {
  const grades = await db.query.grades.findMany();

  return (
    <div className="mt-5 flex flex-col gap-8 px-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Halaman Angkatan</h2>
        <p className="text-muted-foreground">
          Input data kelas pada halaman ini. Untuk mengelola sub kelas dan
          murid-murid, klik sesuai tingkatannya.
        </p>
      </div>

      <div className="flex flex-col gap-5 pb-10">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          List Kelas
        </h4>

        <NewAngkatan />

        <AngkatanViewer initialData={grades} />
      </div>
    </div>
  );
}
