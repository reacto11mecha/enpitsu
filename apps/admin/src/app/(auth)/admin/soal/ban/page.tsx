import { redirect } from "next/navigation";
import { auth } from "@enpitsu/auth";

import { DataTable } from "~/_components/Soal/TemporarilyBannedStudents";

export default async function TemporaryBanPage() {
  const session = await auth();

  if (session!.user.role !== "admin") return redirect("/admin/soal");

  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[85%]">
        <div className="mb-5 space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            Data Larangan Peserta Sementara
          </h2>
          <p className="text-muted-foreground w-full md:w-[85%] lg:w-[75%]">
            Halaman ini bertujuan untuk menambahkan peserta tidak bisa
            mengerjakan soal dalam rentang waktu tertentu, semisal belum
            mengerjakan tugas tertentu yang menjadi syarat ujian. Tambahkan
            peserta spesifik supaya tidak bisa mengerjakan soal apapun, durasi,
            beserta alasan pembatasan sementara.
          </p>
        </div>

        <DataTable />
      </div>
    </div>
  );
}
