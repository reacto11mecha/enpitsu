"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { Space_Mono } from "next/font/google";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MoreHorizontal, PencilLine, Trash2 } from "lucide-react";

import type { RouterOutputs } from "@enpitsu/api";

import { ReusableDataTable } from "~/_components/data-table";
import { badgeVariants } from "~/components/ui/badge";
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
import { AddBannedStudent } from "./TemporarilyBanned/AddBannedStudent";
import {
  DeleteManyBannedStudent,
  DeleteSingleBannedStudent,
} from "./TemporarilyBanned/DeleteBannedStudent";
import { EditBannedStudent } from "./TemporarilyBanned/EditBannedStudent";

type StudentTempoban = RouterOutputs["question"]["getStudentTempobans"][number];

const MonoFont = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

export const columns: ColumnDef<StudentTempoban>[] = [
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
    cell: ({ row }) => <p>{row.original.student.name}</p>,
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
    accessorKey: "startedAt",
    header: "Waktu Mulai",
    cell: ({ row }) => (
      <pre className={MonoFont.className}>
        {format(row.getValue("startedAt"), "dd MMM yyyy, kk.mm", {
          locale: id,
        })}
      </pre>
    ),
  },
  {
    accessorKey: "endedAt",
    header: "Waktu Selesai",
    cell: ({ row }) => (
      <pre className={MonoFont.className}>
        {format(row.getValue("endedAt"), "dd MMM yyyy, kk.mm", { locale: id })}
      </pre>
    ),
  },
  {
    accessorKey: "reason",
    header: "Alasan Penambahan",
    cell: ({ row }) => <p>{row.original.reason}</p>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const tempBan = row.original;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openEdit, setOpenEdit] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openDelete, setOpenDelete] = useState(false);

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
                className="cursor-pointer"
                onClick={() => setOpenEdit(true)}
              >
                <PencilLine className="mr-2 h-4 md:w-4" />
                Edit Status
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-rose-500 hover:text-rose-700 focus:text-rose-700"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="mr-2 h-4 md:w-4" />
                Hapus Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditBannedStudent
            id={tempBan.id}
            reason={tempBan.reason}
            studentName={tempBan.student.name}
            studentClassName={`${tempBan.student.subgrade.grade.label} ${tempBan.student.subgrade.label}`}
            startedAt={tempBan.startedAt}
            endedAt={tempBan.endedAt}
            isDialogOpen={openEdit}
            setDialogOpen={setOpenEdit}
          />
          <DeleteSingleBannedStudent
            id={tempBan.id}
            studentName={tempBan.student.name}
            studentClassName={`${tempBan.student.subgrade.grade.label} ${tempBan.student.subgrade.label}`}
            isDialogOpen={openDelete}
            setDialogOpen={setOpenDelete}
          />
        </>
      );
    },
  },
];

export function DataTable() {
  const trpc = useTRPC();
  const temporarilyBannedQuery = useQuery(
    trpc.question.getStudentTempobans.queryOptions(),
  );

  return (
    <div className="w-full">
      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
        <AddBannedStudent />
      </div>

      <ReusableDataTable
        columns={columns}
        data={temporarilyBannedQuery.data ?? []}
        queryIsPending={temporarilyBannedQuery.isPending}
        queryIsError={temporarilyBannedQuery.isError}
        queryErrorMessage={temporarilyBannedQuery.error?.message}
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
                  <DeleteManyBannedStudent
                    data={table
                      .getFilteredSelectedRowModel()
                      .rows.map((d) => d.original)}
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
  );
}
