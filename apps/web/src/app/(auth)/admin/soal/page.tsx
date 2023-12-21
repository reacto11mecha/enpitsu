import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";

import { DataTable } from "~/_components/Soal/DataTable";

export default function QuestionPage() {
  return (
    <div className="mt-5 flex flex-col gap-7 px-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Soal-Soal</h2>
        <p className="text-muted-foreground">
          Kelola soal-soal yang dikerjakan oleh peserta ujian.
        </p>
      </div>

      <div className="flex flex-col gap-5 pb-10">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Daftar Soal
        </h4>

        <Button asChild className="w-fit">
          <Link href="/admin/soal/baru">
            Buat soal baru
            <PlusSquare className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <DataTable />
      </div>
    </div>
  );
}
