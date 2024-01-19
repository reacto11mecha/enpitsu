import Link from "next/link";
import { auth } from "@enpitsu/auth";
import { count, db, schema } from "@enpitsu/db";

import { DataTable } from "~/_components/Soal/DataTable";

export default async function QuestionPage() {
  const session = await auth();

  const subgradeCount = await db
    .select({ value: count() })
    .from(schema.subGrades);

  const countValue = subgradeCount.at(0)!.value;

  return (
    <div className="mt-5 flex flex-col gap-7 px-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Soal-Soal</h2>
        <p className="text-muted-foreground">
          Kelola soal-soal yang dikerjakan oleh peserta ujian.
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-10">
        {countValue < 1 ? (
          <div className="space-y-1">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              Daftar Soal
            </h4>
            <p className="text-muted-foreground">
              Tidak bisa membuat soal baru, belum ada{" "}
              {session!.user.role === "admin" ? (
                <Link className="underline" href="/admin/angkatan">
                  data angkatan atau rombongan belajarnya
                </Link>
              ) : (
                <>data angkatan atau rombel, mohon hubungi administrator</>
              )}
              .
            </p>
          </div>
        ) : (
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Daftar Soal
          </h4>
        )}

        <DataTable countValue={countValue} currUserRole={session!.user.role} />
      </div>
    </div>
  );
}
