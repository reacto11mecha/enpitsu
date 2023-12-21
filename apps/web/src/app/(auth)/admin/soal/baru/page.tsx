import { NewParentQuestion } from "~/_components/Soal/NewParentQuestion";

export default function NewQuestion() {
  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[85%]">
        <div className="mb-5 space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Soal Baru</h2>
          <p className="text-muted-foreground w-full md:w-[85%] lg:w-[75%]">
            Buat soal baru untuk dikerjakan oleh peserta ujian. Pada halaman ini
            terlebih dahulu menambahkan identitas soal, jika sudah dan berhasil
            tersimpan maka akan diarahkan ke halaman pembuatan soal pilihan
            ganda dan esai.
          </p>
        </div>

        <NewParentQuestion />
      </div>
    </div>
  );
}
