"use client";

import type { RouterOutputs } from "@enpitsu/api";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { createContext, useCallback, useContext, useState } from "react";
import { Space_Mono } from "next/font/google";
import Link from "next/link";
import { Badge, badgeVariants } from "@enpitsu/ui/badge";
import { Button } from "@enpitsu/ui/button";
import { Checkbox } from "@enpitsu/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@enpitsu/ui/dropdown-menu";
import { Input } from "@enpitsu/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@enpitsu/ui/select";
import { Skeleton } from "@enpitsu/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@enpitsu/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";
import {
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  ListChecks,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { api } from "~/trpc/react";
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
  const specificAnswerByQuestionQuery =
    api.question.getStudentAnswersByQuestion.useQuery({
      questionId,
    });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: specificAnswerByQuestionQuery.data ?? [],
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

  const resetSelection = useCallback(() => table.resetRowSelection(), [table]);

  return (
    <RoleContext.Provider value={currUserRole}>
      <div className="w-full">
        <p className="mb-2">Soal: {title}</p>

        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
          <RecalcEssayAnswer questionId={questionId} title={title} />
          <SpecificExcelAnswerDownload questionId={questionId} title={title} />
        </div>

        <div className="mt-2 flex flex-col gap-2 pb-4 md:flex-row md:items-center">
          <Input
            placeholder="Filter berdasarkan nama peserta..."
            value={
              (table.getColumn("studentName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("studentName")?.setFilterValue(event.target.value)
            }
            className="w-full md:max-w-md"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="md:ml-auto">
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
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          <div className="flex flex-col gap-2 pb-4 md:flex-row md:items-center">
            <DeleteManyStudentAnswer
              data={table
                .getFilteredSelectedRowModel()
                .rows.map((d) => d.original)}
              questionTitle={title}
              resetSelection={resetSelection}
            />
            <Button variant="outline" onClick={resetSelection}>
              Batalkan semua pilihan
            </Button>
          </div>
        ) : null}
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
              {specificAnswerByQuestionQuery.isError ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Error: {specificAnswerByQuestionQuery.error.message}
                  </TableCell>
                </TableRow>
              ) : null}

              {specificAnswerByQuestionQuery.isPending &&
              !specificAnswerByQuestionQuery.isError ? (
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
                  {!specificAnswerByQuestionQuery.isPending && (
                    <>
                      {!specificAnswerByQuestionQuery.isError && (
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
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} dari{" "}
            {table.getFilteredRowModel().rows.length} baris data dipilih.
          </div>

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
    </RoleContext.Provider>
  );
}
