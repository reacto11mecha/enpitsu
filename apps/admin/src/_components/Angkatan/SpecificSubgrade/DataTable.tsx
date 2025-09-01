"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, MoreHorizontal, PencilLine, Trash2 } from "lucide-react";

import type { RouterOutputs } from "@enpitsu/api";

import { ReusableDataTable } from "~/_components/data-table";
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
import { ExcelStudentsBySubgradeDownload } from "../ExcelStudentsActivity";
import { AddStudent } from "./AddStudent";
import { DeleteStudent } from "./DeleteStudent";
import { UpdateStudent } from "./UpdateStudent";
import { UploadCSV } from "./UploadCSV";

type StudentList = RouterOutputs["grade"]["getStudents"][number];

export const columns: ColumnDef<StudentList>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "token",
    header: "Token",
    cell: ({ row }) => <pre>{row.getValue("token")}</pre>,
  },
  {
    accessorKey: "participantNumber",
    header: "Nomor Peserta",
    cell: ({ row }) => <pre>{row.getValue("participantNumber")}</pre>,
  },
  {
    accessorKey: "room",
    header: "Ruangan",
    cell: ({ row }) => <pre>{row.getValue("room")}</pre>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const student = row.original;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openDelete, setOpenDelete] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openEdit, setOpenEdit] = useState(false);

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
                Perbaiki Identitas
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-rose-500 hover:text-rose-700 focus:text-rose-700"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="mr-2 h-4 md:w-4" />
                Hapus Murid
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <UpdateStudent
            openEdit={openEdit}
            setOpenEdit={setOpenEdit}
            student={student}
          />

          <DeleteStudent
            openDelete={openDelete}
            setOpenDelete={setOpenDelete}
            name={student.name}
            id={student.id}
          />
        </>
      );
    },
  },
];

export function DataTable({
  grade,
  subgrade,
  initialData,
}: {
  grade: {
    id: number;
    label: string;
  };
  subgrade: {
    id: number;
    label: string;
    gradeId: number;
  };
  initialData: RouterOutputs["grade"]["getStudents"];
}) {
  const trpc = useTRPC();
  const studentsQuery = useQuery(
    trpc.grade.getStudents.queryOptions(
      {
        subgradeId: subgrade.id,
      },
      {
        initialData,
      },
    ),
  );

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 md:flex-row">
        <AddStudent subgrade={subgrade} grade={grade} />
        <UploadCSV subgrade={subgrade} grade={grade} />
        <ExcelStudentsBySubgradeDownload subgradeId={subgrade.id} />
      </div>
      <ReusableDataTable
        columns={columns}
        data={studentsQuery.data}
        queryIsPending={studentsQuery.isPending}
        queryIsError={studentsQuery.isError}
        queryErrorMessage={studentsQuery.error?.message}
        showTableControl
        additionalControl={(table) => (
          <Input
            placeholder="Filter berdasarkan nama..."
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-md"
          />
        )}
      />
    </div>
  );
}
