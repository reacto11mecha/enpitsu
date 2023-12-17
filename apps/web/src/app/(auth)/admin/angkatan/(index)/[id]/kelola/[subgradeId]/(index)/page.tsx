import { redirect } from "next/navigation";
import { db, eq, schema } from "@enpitsu/db";

export default async function ManageSpecificSubgrade(props: {
  params: { id: string; subgradeId: string };
}) {
  const gradeId = parseInt(props.params.id);
  const subgradeId = parseInt(props.params.subgradeId);

  const specificGrade = await db.query.grades.findFirst({
    where: eq(schema.grades.id, gradeId),
  });

  const specificSubgrade = await db.query.subGrades.findFirst({
    where: eq(schema.subGrades.id, subgradeId),
  });

  if (!specificGrade || !specificSubgrade) return redirect("/admin/angkatan");

  return (
    <div className="mt-5 flex flex-col gap-10 px-5">
      <div className="flex flex-col">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          Halaman Kelola Murid — {specificGrade.label} {specificSubgrade.label}
        </h2>

        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Kelola murid-murid kelas {specificGrade.label}{" "}
          {specificSubgrade.label} untuk ditambahkan, diubah, maupun di hapus.
          Klik simbol titik tiga pada murid spesifik di tabel untuk mengelolanya
          lebih lanjut.
        </p>
      </div>

      <div className="flex flex-col gap-5 pb-10">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Daftar Siswa-Siswi
        </h4>
      </div>
    </div>
  );
}
