"use client";

import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";

export const Correction = ({
  id,
  questionTitle,
  studentName,
  studentClass,
  checkIn,
  submittedAt,
}: {
  id: number;
  questionTitle: string;
  studentName: string;
  studentClass: string;
  checkIn: Date;
  submittedAt: Date;
}) => {
  return (
    <>
      <div className="mb-5">
        <p className="w-full md:w-[80%] lg:w-[70%]">Soal: {questionTitle}</p>
        <p className="w-full md:w-[80%] lg:w-[70%]">Nama: {studentName}</p>
        <p className="w-full md:w-[80%] lg:w-[70%]">Kelas: {studentClass}</p>
        <p className="w-full md:w-[80%] lg:w-[70%]">
          Mulai Mengerjakan:{" "}
          {format(checkIn, "dd MMMM yyy, kk.mm", {
            locale: id,
          })}
        </p>
        <p className="w-full md:w-[80%] lg:w-[70%]">
          Dikumpulkan Jawaban:{" "}
          {format(submittedAt, "dd MMMM yyy, kk.mm", {
            locale: id,
          })}
        </p>
        <p className="w-full md:w-[80%] lg:w-[70%]">
          Durasi pengerjaan:{" "}
          {formatDuration(
            intervalToDuration({
              start: checkIn,
              end: submittedAt,
            }),
            { locale: id },
          )}
        </p>
      </div>
    </>
  );
};
