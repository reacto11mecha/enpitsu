import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AngkatanPage() {
  return (
    <div className="mt-5 flex flex-col gap-10 px-5">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col">
          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
            Halaman Angkatan
          </h2>

          <p className="leading-7 [&:not(:first-child)]:mt-6">
            Input data kelas pada halaman ini. Untuk mengelola sub kelas dan
            murid-murid, klik sesuai tingkatannya.
          </p>
        </div>

        <Button variant="outline" className="w-fit" asChild>
          <Link href="/admin/angkatan/new">Buat Angkatan Baru</Link>
        </Button>
      </div>

      <div className="flex flex-col">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          List Kelas
        </h4>
      </div>
    </div>
  );
}
