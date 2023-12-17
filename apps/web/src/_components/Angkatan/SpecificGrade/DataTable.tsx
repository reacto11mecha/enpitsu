"use client";

import { useMemo, useState } from "react";
// import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  // DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import type { RouterOutputs } from "@enpitsu/api";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ClipboardCopy,
  Loader2,
  MoreHorizontal,
  Trash2,
  Users,
} from "lucide-react";

import { api } from "~/utils/api";
import { CreateSubgrade } from "./CreateSubgrade";

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

      const [open, setOpen] = useState(false);
      const [confirmationText, setConfirmText] = useState("");

      const reallySure = useMemo(
        () => confirmationText === "saya ingin menghapus subkelas ini",
        [confirmationText],
      );

      const params = useParams();

      const { toast } = useToast();

      const apiUtils = api.useUtils();

      const subgradeDeleteMutation = api.grade.deleteSubgrade.useMutation({
        async onSuccess() {
          setOpen(false);

          setConfirmText("");

          await apiUtils.grade.getSubgrades.invalidate();

          toast({
            title: "Penghapusan Berhasil!",
            description: "Berhasil menghapus seluruh kelas spesifik.",
          });
        },
        onError(error) {
          toast({
            variant: "destructive",
            title: "Operasi Gagal",
            description: `Terjadi kesalahan, Error: ${error.message}`,
          });
        },
      });

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
                  const url = `${location.origin}/admin/angkatan/${params.id}/kelola/${subgrade.id}`;

                  await navigator.clipboard.writeText(url);

                  toast({
                    description: "Berhasil disalin!",
                  });
                }}
              >
                <ClipboardCopy className="mr-2 h-4 md:w-4" />
                Salin link halaman kelola
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-rose-500 hover:text-rose-700 focus:text-rose-700"
                onClick={() => setOpen(true)}
              >
                <Trash2 className="mr-2 h-4 md:w-4" />
                Hapus Kelas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog
            open={open}
            onOpenChange={() => {
              if (!subgradeDeleteMutation.isLoading) setOpen((prev) => !prev);

              if (confirmationText.length > 0) setConfirmText("");
            }}
          >
            <DialogContent>
              <DialogHeader className="flex flex-col gap-2">
                <DialogTitle>Apakah anda yakin?</DialogTitle>
                <DialogDescription>
                  Aksi yang anda lakukan dapat berakibat fatal. Jika anda
                  melakukan hal ini, maka akan secara permanen menghapus data
                  angkatan{" "}
                  <b>
                    kelas {subgrade.grade.label} {subgrade.label}
                  </b>
                  .
                </DialogDescription>
                <DialogDescription className="text-start">
                  Sebelum menghapus, ketik{" "}
                  <b>saya ingin menghapus subkelas ini</b> pada kolom dibawah:
                </DialogDescription>
                <Input
                  type="text"
                  autoComplete="false"
                  autoCorrect="false"
                  disabled={subgradeDeleteMutation.isLoading}
                  value={confirmationText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </DialogHeader>
              <DialogFooter className="gap-2 sm:justify-start">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={subgradeDeleteMutation.isLoading}
                  >
                    Batal
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!reallySure || subgradeDeleteMutation.isLoading}
                  onClick={() => {
                    if (reallySure) subgradeDeleteMutation.mutate(subgrade.id);
                  }}
                >
                  {subgradeDeleteMutation.isLoading ? (
                    <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
                  ) : null}
                  Hapus
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: subgradesQuery.data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <CreateSubgrade gradeId={currentGrade.id} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {subgradesQuery.isError && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Error: {subgradesQuery.error.message}
                </TableCell>
              </TableRow>
            )}

            {subgradesQuery.isLoading && !subgradesQuery.isError && (
              <>
                {Array.from({ length: 10 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={columns.length}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {!subgradesQuery.isLoading && (
                  <>
                    {!subgradesQuery.isLoading && (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Tidak ada data.
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
