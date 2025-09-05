"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { createContext, useCallback, useContext, useState } from "react";
import { Space_Mono } from "next/font/google";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";
import { ListChecks, MoreHorizontal, Trash2 } from "lucide-react";

import type { RouterOutputs } from "@enpitsu/api";

import { ReusableDataTable } from "~/_components/data-table";
import { Badge, badgeVariants } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { useTRPC } from "~/trpc/react";
import {
  DeleteManyStudentAnswer,
  DeleteSingleStudentAnswer,
} from "./DeleteStudentAnswer";
import { SpecificExcelAnswerDownload } from "./ExcelAnswerDownload";
import { RecalcEssayAnswer } from "./RecalcEssayAnswer";

type AnsweredListByQuestion =
  RouterOutputs["question"]["getStudentAnswersByQuestion"][number];

const MonoFont = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

const RoleContext = createContext("");

export const columns: ColumnDef<AnsweredListByQuestion>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        disabled
        aria-label="Pilih semua"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select baris ini"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "studentName",
    accessorKey: "student.name",
    header: "Nama Peserta",
    cell: ({ row }) => <div>{row.original.student.name}</div>,
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
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const currentUserRole = useContext(RoleContext);

      return (
        <>
          {currentUserRole === "admin" ? (
            <Link
              className={badgeVariants({ variant: "secondary" })}
              href={`/admin/angkatan/${row.original.student.subgrade.grade.id}/kelola/${row.original.student.subgrade.id}`}
            >
              {row.original.student.subgrade.grade.label}{" "}
              {row.original.student.subgrade.label}
            </Link>
          ) : (
            <Badge variant="secondary">
              {row.original.student.subgrade.grade.label}{" "}
              {row.original.student.subgrade.label}
            </Badge>
          )}
        </>
      );
    },
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
            name={answer.student.name}
          />
        </>
      );
    },
  },
];

export function DataTable({
  questionId,
  title,
  currUserRole,
}: {
  questionId: number;
  title: string;
  currUserRole: "admin" | "user";
}) {
  const trpc = useTRPC();
  const specificAnswerByQuestionQuery = useQuery(
    trpc.question.getStudentAnswersByQuestion.queryOptions({
      questionId,
    }),
  );

  return (
    <RoleContext.Provider value={currUserRole}>
      <div className="w-full">
        <p className="mb-2">Soal: {title}</p>

        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
          <RecalcEssayAnswer questionId={questionId} title={title} />
          <SpecificExcelAnswerDownload questionId={questionId} title={title} />
        </div>

        <ReusableDataTable
          columns={columns}
          data={specificAnswerByQuestionQuery.data ?? []}
          queryIsPending={specificAnswerByQuestionQuery.isPending}
          queryIsError={specificAnswerByQuestionQuery.isError}
          queryErrorMessage={specificAnswerByQuestionQuery.error?.message}
          showTableControl
          additionalControl={(table) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const resetSelection = useCallback(
              () => table.resetRowSelection(),
              [table],
            );

            return (
              <>
                <Input
                  placeholder="Filter berdasarkan nama peserta..."
                  value={
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    (table
                      .getColumn("studentName")
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn("studentName")
                      ?.setFilterValue(event.target.value)
                  }
                  className="w-full md:max-w-md"
                />

                {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:px-2">
                    <DeleteManyStudentAnswer
                      data={table
                        .getFilteredSelectedRowModel()
                        .rows.map((d) => d.original)}
                      questionTitle={title}
                      resetSelection={resetSelection}
                    />
                    <Button variant="outline" onClick={resetSelection}>
                      Batalkan pilihan
                    </Button>
                  </div>
                ) : null}
              </>
            );
          }}
        />
      </div>
    </RoleContext.Provider>
  );
}
