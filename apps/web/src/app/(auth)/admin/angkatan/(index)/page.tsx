import { AngkatanViewer } from "~/_components/AngkatanViewer";
import { NewAngkatan } from "~/_components/NewAngkatan";

export default function AngkatanPage() {
  return (
    <div className="mt-5 flex flex-col gap-10 px-5">
      <div className="flex flex-col">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          Halaman Angkatan
        </h2>

        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Input data kelas pada halaman ini. Untuk mengelola sub kelas dan
          murid-murid, klik sesuai tingkatannya.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          List Kelas
        </h4>

        <NewAngkatan />

        <AngkatanViewer />
      </div>
    </div>
  );
}
