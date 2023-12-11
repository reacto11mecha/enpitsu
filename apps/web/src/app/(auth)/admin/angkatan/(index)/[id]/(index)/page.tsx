export default function DynamicAngkatan() {
  return (
    <div className="mt-5 flex flex-col gap-10 px-5">
      <div className="flex flex-col">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          Halaman Kelas
        </h2>

        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Input sub kelas dan murid pada halaman ini. Klik sesuai tingkatan
          untuk mengelola.
        </p>
      </div>

      <div className="flex flex-col gap-5 pb-10">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          List Subkelas
        </h4>
      </div>
    </div>
  );
}
