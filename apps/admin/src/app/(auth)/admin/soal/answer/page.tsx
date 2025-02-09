import { redirect } from "next/navigation";
import { auth } from "@enpitsu/auth";
import { count } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";

import { DataTable } from "~/_components/Soal/AggregateAnswersStudent";

export default async function AggregateAnswersStudent() {
  const subgradeCount = await db
    .select({ value: count() })
    .from(schema.subGrades);

  if (subgradeCount.at(0)!.value < 1) return redirect("/admin/baru");

  const session = await auth();

  if (session!.user.role !== "admin") return redirect("/admin/soal");

  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[95%]">
        <div className="mb-5 space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Data Agregat Jawaban Peserta
          </h2>
          <p className="w-full text-muted-foreground md:w-[85%] lg:w-[75%]">
            Cek jawaban peserta, ubah nilai esai yang salah, unduh excel jawaban
            pada halaman ini juga.
          </p>
        </div>

        <DataTable />
      </div>
    </div>
  );
}
