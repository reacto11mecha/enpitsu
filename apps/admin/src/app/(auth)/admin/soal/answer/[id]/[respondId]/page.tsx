import { redirect } from "next/navigation";
import { db, eq, schema } from "@enpitsu/db";

import { Correction } from "~/_components/Soal/AnswerList/CorrectionPage/Correction";

export default async function CorrectionPage({
  params,
}: {
  params: { id: string; respondId: string };
}) {
  const id = parseInt(params.id);

  if (isNaN(id)) return redirect("/admin/soal");

  const respondId = parseInt(params.respondId);

  if (isNaN(respondId)) return redirect(`/admin/soal/${id}`);

  const studentRespond = await db.query.studentResponds.findFirst({
    where: eq(schema.studentResponds.id, respondId),
    columns: {
      checkIn: true,
      submittedAt: true,
    },
    with: {
      question: {
        columns: {
          title: true,
        },
      },
      student: {
        columns: {
          name: true,
          room: true,
        },
        with: {
          subgrade: {
            columns: {
              id: true,
              label: true,
            },
            with: {
              grade: {
                columns: {
                  id: true,
                  label: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!studentRespond) return redirect("/admin/soal");

  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[80%]">
        <div className="mb-5 space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Koreksi Jawaban</h2>
          <p className="text-muted-foreground w-full md:w-[80%] lg:w-[70%]">
            Koreksi jawaban peserta pada halaman ini.
          </p>
        </div>

        <Correction
          id={studentRespond.id}
          questionTitle={studentRespond.question.title}
          studentName={studentRespond.student.name}
          studentClass={`${studentRespond.student.subgrade.grade.label} ${studentRespond.student.subgrade.label}`}
          checkIn={studentRespond.checkIn}
          submittedAt={studentRespond.submittedAt}
        />
      </div>
    </div>
  );
}
