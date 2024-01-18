import { redirect } from "next/navigation";
import { auth } from "@enpitsu/auth";

import { DataTable } from "~/_components/Soal/AggregateCheatedStudents";

export default async function AggregateListPage() {
  const session = await auth();

  if (session.user.role !== "admin") return redirect("/admin/soal");

  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[85%]">
        <div className="mb-5 space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Data Agregat Kecurangan Peserta
          </h2>
          <p className="text-muted-foreground w-full md:w-[85%] lg:w-[75%]">
            Lihat siapa saja yang melakukan kecurangan dan menghapus status
            kecurangan pada halaman ini dari semua mata pelajaran ulangan.
          </p>
        </div>

        <DataTable />
      </div>
    </div>
  );
}
