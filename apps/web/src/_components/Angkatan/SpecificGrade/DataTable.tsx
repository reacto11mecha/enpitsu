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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCopy,
  Loader2,
  MoreHorizontal,
  PencilLine,
  Trash2,
  Users,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

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

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openDelete, setOpenDelete] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openEdit, setOpenEdit] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [confirmationText, setConfirmText] = useState("");

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const reallySure = useMemo(
        () => confirmationText === "saya ingin menghapus subkelas ini",
        [confirmationText],
      );

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const params = useParams();

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { toast } = useToast();

      const apiUtils = api.useUtils();

      const subgradeDeleteMutation = api.grade.deleteSubgrade.useMutation({
        async onSuccess() {
          setOpenDelete(false);

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

      const schema = z.object({
        label: z.string().min(1, { message: "Harus ada isinya!" }),
      });

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
          label: subgrade.label,
        },
      });

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const labelValue = useWatch({
        control: form.control,
        name: "label",
      });

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const isSameEditValue = useMemo(
        () => labelValue === subgrade.label,
        [labelValue, subgrade.label],
      );

      const editSubgradeMutation = api.grade.updateSubgrade.useMutation({
        async onSuccess() {
          form.reset();

          await apiUtils.grade.getSubgrades.invalidate();

          setOpenEdit(false);

          toast({
            title: "Pembaruan Berhasil!",
            description: "Berhasil mengubah nama kelas .",
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

      function onSubmit(values: z.infer<typeof schema>) {
        editSubgradeMutation.mutate({ id: subgrade.id, label: values.label });
      }

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

          {/* DELETE DIALOG */}
          <Dialog
            open={openDelete}
            onOpenChange={() => {
              if (!subgradeDeleteMutation.isLoading)
                setOpenDelete((prev) => !prev);

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

          {/* RENAME DIALOG */}
          <Dialog
            open={openEdit}
            onOpenChange={() => {
              if (!editSubgradeMutation.isLoading) setOpenEdit((prev) => !prev);
            }}
          >
            <DialogContent>
              <DialogHeader className="flex flex-col gap-2">
                <DialogTitle>Ubah Nama</DialogTitle>
                <DialogDescription>
                  Ubah nama{" "}
                  <b>
                    kelas {subgrade.grade.label} {subgrade.label}
                  </b>{" "}
                  menjadi nama yang lain.
                </DialogDescription>
                <Form {...form}>
                  <form
                    className="w-full pb-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <div className="flex flex-row items-end gap-5">
                      <FormField
                        control={form.control}
                        name="label"
                        render={({ field }) => (
                          <FormItem
                            aria-disabled={editSubgradeMutation.isLoading}
                            className="w-full"
                          >
                            <FormLabel>Nama Sub Kelas</FormLabel>
                            <FormControl className="w-full">
                              <Input
                                placeholder="1"
                                {...field}
                                autoComplete="off"
                                disabled={editSubgradeMutation.isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:justify-start">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={editSubgradeMutation.isLoading}
                  >
                    Batal
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  disabled={isSameEditValue || editSubgradeMutation.isLoading}
                  onClick={() => form.handleSubmit(onSubmit)()}
                >
                  {editSubgradeMutation.isLoading ? (
                    <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
                  ) : null}
                  Ubah
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

  const table = useReactTable({
    data: subgradesQuery.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
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
            {subgradesQuery.isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Error: {subgradesQuery.error.message}
                </TableCell>
              </TableRow>
            ) : null}

            {subgradesQuery.isLoading && !subgradesQuery.isError ? (
              <>
                {Array.from({ length: 10 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={columns.length}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : null}

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
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Baris per halaman</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value: string) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[15, 25, 35, 45, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
