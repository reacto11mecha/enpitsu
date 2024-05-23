"use client";

import { useState } from "react";
import { Space_Mono } from "next/font/google";
import Link from "next/link";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  PencilLine,
  Trash2,
} from "lucide-react";

import { api } from "~/utils/api";
import { AddBannedStudent } from "./TemporarilyBanned/AddBannedStudent";
import { DeleteBannedStudent } from "./TemporarilyBanned/DeleteBannedStudent";
import { EditBannedStudent } from "./TemporarilyBanned/EditBannedStudent";

type StudentTempoban = RouterOutputs["question"]["getStudentTempobans"][number];

const MonoFont = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

export const columns: ColumnDef<StudentTempoban>[] = [
  {
    accessorKey: "studentName",
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
          <DeleteBannedStudent
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
  const temporarilyBannedQuery = api.question.getStudentTempobans.useQuery();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: temporarilyBannedQuery.data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: { pagination: { pageSize: 20 } },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center pb-4">
        <AddBannedStudent />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Kolom-Kolom <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
            {temporarilyBannedQuery.isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Error: {temporarilyBannedQuery.error.message}
                </TableCell>
              </TableRow>
            ) : null}

            {temporarilyBannedQuery.isLoading &&
            !temporarilyBannedQuery.isError ? (
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
                {!temporarilyBannedQuery.isLoading && (
                  <>
                    {!temporarilyBannedQuery.isError && (
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
                {[20, 40, 60, 80, 100].map((pageSize) => (
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
