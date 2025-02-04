"use client";

import type { RouterOutputs } from "@enpitsu/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@enpitsu/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@enpitsu/ui/dropdown-menu";
import {
  ClipboardCopy,
  MoreHorizontal,
  PencilLine,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "~/_components/data-table";
import { api } from "~/trpc/react";
import { CreateSubgrade } from "./CreateSubgrade";
import { DeleteSubgrade } from "./DeleteSubgrade";
import { RenameSubgrade } from "./RenameSubgrade";

type SubgradeList = RouterOutputs["grade"]["getSubgrades"][number];

export const columns: ColumnDef<SubgradeList>[] = [
  {
    accessorKey: "label",
    header: "Sub Kelas",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("label")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const subgrade = row.original;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openDelete, setOpenDelete] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openEdit, setOpenEdit] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const params = useParams();

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  href={`/admin/angkatan/${params.id}/kelola/${subgrade.id}`}
                  className="cursor-pointer"
                >
                  <Users className="mr-2 h-4 md:w-4" />
                  Kelola Murid
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={async () => {
                  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  const url = `${location.origin}/admin/angkatan/${params.id}/kelola/${subgrade.id}`;

                  await navigator.clipboard.writeText(url);

                  toast.success("Berhasil disalin!");
                }}
              >
                <ClipboardCopy className="mr-2 h-4 md:w-4" />
                Salin link halaman kelola
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setOpenEdit(true)}
              >
                <PencilLine className="mr-2 h-4 md:w-4" />
                Ubah Nama
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-rose-500 hover:text-rose-700 focus:text-rose-700"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="mr-2 h-4 md:w-4" />
                Hapus Kelas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteSubgrade
            openDelete={openDelete}
            setOpenDelete={setOpenDelete}
            label={`${subgrade.grade.label} ${subgrade.label}`}
            id={subgrade.id}
          />

          <RenameSubgrade
            openEdit={openEdit}
            setOpenEdit={setOpenEdit}
            label={`${subgrade.grade.label} ${subgrade.label}`}
            param={subgrade.label}
            id={subgrade.id}
          />
        </>
      );
    },
  },
];

export function DataTable({
  currentGrade,
}: {
  currentGrade: { id: number; label: string };
}) {
  const subgradesQuery = api.grade.getSubgrades.useQuery({
    gradeId: currentGrade.id,
  });

  return (
    <div className="w-full">
      <CreateSubgrade gradeId={currentGrade.id} />
      <DataTable
        columns={columns}
        data={subgradesQuery.data ?? []}
        queryIsPending={subgradesQuery.isPending}
        queryIsError={subgradesQuery.isError}
        queryErrorMessage={subgradesQuery.error?.message}
      />
    </div>
  )
}

