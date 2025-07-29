"use client";

import type { RouterOutputs } from "@enpitsu/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { Space_Mono } from "next/font/google";
import Link from "next/link";
import { badgeVariants } from "@enpitsu/ui/badge";
import { Button } from "@enpitsu/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@enpitsu/ui/dropdown-menu";
import { Input } from "@enpitsu/ui/input";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowUpRight, MoreHorizontal, Trash2 } from "lucide-react";

import { ReusableDataTable } from "~/_components/data-table";
import { useTRPC } from "~/trpc/react";
import {
  AggregateDeleteCheatedStudent,
  DeleteSingleCheatedStudent,
} from "./CheatedList/DeleteCheatedStudent";
import { AggregateExcelCheatDownload } from "./CheatedList/ExcelCheatedDownload";

type BlocklistByQuestion =
  RouterOutputs["question"]["getStudentBlocklists"][number];

const MonoFont = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

export const columns: ColumnDef<BlocklistByQuestion>[] = [
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
        <Link href={`/admin/soal/cheat/${row.original.question.id}`}>
          {row.original.question.title}
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    ),
  },
  {
    accessorKey: "room",
    header: "Ruangan Peserta",
    cell: ({ row }) => (
      <pre className={MonoFont.className}>{row.original.student.room}</pre>
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
    accessorKey: "time",
    header: "Waktu Melakukan Kecurangan",
    cell: ({ row }) => (
      <pre className={MonoFont.className}>
        {format(row.getValue("time"), "dd MMMM yyyy, kk.mm", {
          locale: id,
        })}
      </pre>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const cheat = row.original;

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
              <DropdownMenuItem
                className="cursor-pointer text-rose-500 hover:text-rose-700 focus:text-rose-700"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="mr-2 h-4 md:w-4" />
                Hapus Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteSingleCheatedStudent
            closeDialog={closeDialog}
            id={cheat.id}
            openDelete={openDelete}
            questionTitle={cheat.question.title}
            name={cheat.student.name}
          />
        </>
      );
    },
  },
];

export function DataTable() {
  const trpc = useTRPC();
  const blocklistsQuery = useQuery(
    trpc.question.getStudentBlocklists.queryOptions(),
  );

  return (
    <div className="w-full">
      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
        <AggregateExcelCheatDownload />
        <AggregateDeleteCheatedStudent />
      </div>

      <ReusableDataTable
        columns={columns}
        data={blocklistsQuery.data ?? []}
        queryIsPending={blocklistsQuery.isPending}
        queryIsError={blocklistsQuery.isError}
        queryErrorMessage={blocklistsQuery.error?.message}
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
