"use client";

import type { RouterOutputs } from "@enpitsu/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { Space_Mono } from "next/font/google";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowUpRight, ListChecks, MoreHorizontal, Trash2 } from "lucide-react";

import { ReusableDataTable } from "~/_components/data-table";
import { badgeVariants } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { useTRPC } from "~/trpc/react";
import { DeleteSingleStudentAnswer } from "./AnswerList/DeleteStudentAnswer";
import { AggregateExcelAnswerDownload } from "./AnswerList/ExcelAnswerDownload";

type StudentAnswers = RouterOutputs["question"]["getStudentAnswers"][number];

const MonoFont = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

export const columns: ColumnDef<StudentAnswers>[] = [
  {
    id: "studentName",
    accessorKey: "student.name",
    header: "Nama Peserta",
    cell: ({ row }) => <div>{row.original.student.name}</div>,
  },
  {
    accessorKey: "title",
    header: "Soal Ujian",
    cell: ({ row }) => (
      <Button variant="ghost" asChild>
        <Link href={`/admin/soal/answer/${row.original.question.id}`}>
          {row.original.question.title}
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    ),
  },
  {
    accessorKey: "checkIn",
    header: "Mulai Mengerjakan",
    cell: ({ row }) => (
      <pre className={MonoFont.className}>
        {format(row.getValue("checkIn"), "dd MMM yyy, kk.mm", {
          locale: id,
        })}
      </pre>
    ),
  },
  {
    accessorKey: "submittedAt",
    header: "Dikumpulkan Jawaban",
    cell: ({ row }) => (
      <pre className={MonoFont.className}>
        {format(row.getValue("submittedAt"), "dd MMM yyy, kk.mm", {
          locale: id,
        })}
      </pre>
    ),
  },
  {
    accessorKey: "duration",
    header: "Durasi Pengerjaan",
    cell: ({ row }) => (
      <div>
        {formatDuration(
          intervalToDuration({
            start: row.getValue("checkIn"),
            end: row.getValue("submittedAt"),
          }),
          { locale: id },
        )}
      </div>
    ),
  },
  {
    accessorKey: "StudentClass",
    header: "Kelas Asal",
    cell: ({ row }) => (
      <Link
        className={badgeVariants({ variant: "secondary" })}
        href={`/admin/angkatan/${row.original.student.subgrade.grade.id}/kelola/${row.original.student.subgrade.id}`}
      >
        {row.original.student.subgrade.grade.label}{" "}
        {row.original.student.subgrade.label}
      </Link>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const answer = row.original;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openDelete, setOpenDelete] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const closeDialog = useCallback(() => setOpenDelete((prev) => !prev), []);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link
                  href={`/admin/soal/answer/${answer.question.id}/${answer.id}`}
                >
                  <ListChecks className="mr-2 h-4 md:w-4" />
                  Koreksi Jawaban
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-rose-500 hover:text-rose-700 focus:text-rose-700"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="mr-2 h-4 md:w-4" />
                Hapus Jawaban
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteSingleStudentAnswer
            closeDialog={closeDialog}
            id={answer.id}
            openDelete={openDelete}
            questionTitle={answer.question.title}
            name={answer.student.name}
          />
        </>
      );
    },
  },
];

export function DataTable() {
  const trpc = useTRPC();
  const studentAnswerQuery = useQuery(
    trpc.question.getStudentAnswers.queryOptions(),
  );

  return (
    <div className="w-full">
      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
        <AggregateExcelAnswerDownload />
      </div>

      <ReusableDataTable
        columns={columns}
        data={studentAnswerQuery.data ?? []}
        queryIsPending={studentAnswerQuery.isPending}
        queryIsError={studentAnswerQuery.isError}
        queryErrorMessage={studentAnswerQuery.error?.message}
        showTableControl
        additionalControl={(table) => (
          <Input
            placeholder="Filter berdasarkan nama peserta..."
            value={
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              (table.getColumn("studentName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("studentName")?.setFilterValue(event.target.value)
            }
            className="w-full md:max-w-md"
          />
        )}
      />
    </div>
  );
}
