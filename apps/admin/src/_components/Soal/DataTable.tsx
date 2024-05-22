"use client";

import { createContext, useContext, useState } from "react";
import { Space_Mono } from "next/font/google";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  LayoutList,
  ListX,
  MoreHorizontal,
  PencilLine,
  PlusSquare,
  Trash2,
  UserRoundX,
} from "lucide-react";

import { api } from "~/utils/api";
import { CreateQRCodes } from "./CreateQRCodes";
import { DeleteParentQuestion } from "./DeleteParentQuestion";

type QuestionList = RouterOutputs["question"]["getQuestions"][number];

const MonoFont = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

const RoleContext = createContext("");

export const columns: ColumnDef<QuestionList>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "user",
    header: "Pembuat Soal",
    cell: ({ row }) => (
      <div className="flex flex-row items-center gap-4">
        <Avatar>
          {row.original.user.image ? (
            <AvatarImage src={row.original.user.image} />
          ) : null}
          <AvatarFallback className="uppercase">
            {row.original.user.name
              ? row.original.user.name.slice(0, 2)
              : "N/A"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p>{row.original.user.name ? row.original.user.name : "N/A"}</p>
          <small className="text-muted-foreground">
            {row.original.user.email ? row.original.user.email : "N/A"}
          </small>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Judul Soal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
  },
  {
    accessorKey: "slug",
    header: "Kode Soal",
    cell: ({ row }) => (
      <pre className={MonoFont.className}>{row.getValue("slug")}</pre>
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
    accessorKey: "duration",
    header: "Durasi Pengerjaan",
    cell: ({ row }) => (
      <div>
        {formatDuration(
          intervalToDuration({
            end: row.getValue("endedAt"),
            start: row.getValue("startedAt"),
          }),
          { locale: id },
        )}
      </div>
    ),
  },
  {
    accessorKey: "multipleChoices",
    header: "Jumlah Soal PG",
    cell: ({ row }) => <div>{row.original.multipleChoices.length} Soal</div>,
  },
  {
    accessorKey: "essays",
    header: "Jumlah Soal Esai",
    cell: ({ row }) => <div>{row.original.essays.length} Soal</div>,
  },
  {
    accessorKey: "allowList",
    header: "Kelas Yang Diperbolehkan",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const currentUserRole = useContext(RoleContext);

      return (
        <div className="space-x-0.5 space-y-0.5">
          {row.original.allowLists.map((allow) =>
            currentUserRole === "admin" ? (
              <Link
                className={badgeVariants({ variant: "secondary" })}
                href={`/admin/angkatan/${allow.subgrade.gradeId}/kelola/${allow.subgradeId}`}
                key={allow.id}
              >
                {allow.subgrade.grade.label} {allow.subgrade.label}
              </Link>
            ) : (
              <Badge variant="secondary" key={allow.id}>
                {allow.subgrade.grade.label} {allow.subgrade.label}
              </Badge>
            ),
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const question = row.original;

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
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href={`/admin/soal/butir/${question.id}`}>
                  <LayoutList className="mr-2 h-4 md:w-4" />
                  Butir Soal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href={`/admin/soal/edit/${question.id}`}>
                  <PencilLine className="mr-2 h-4 md:w-4" />
                  Identitas Soal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href={`/admin/soal/answer/${question.id}`}>
                  <ClipboardCheck className="mr-2 h-4 md:w-4" />
                  Jawaban peserta
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href={`/admin/soal/cheat/${question.id}`}>
                  <UserRoundX className="mr-2 h-4 md:w-4" />
                  Kecurangan peserta
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-rose-500 hover:text-rose-700 focus:text-rose-700"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="mr-2 h-4 md:w-4" />
                Hapus Soal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteParentQuestion
            openDelete={openDelete}
            setOpenDelete={setOpenDelete}
            title={question.title}
            id={question.id}
          />
        </>
      );
    },
  },
];

export function DataTable({
  countValue,
  currUserRole,
}: {
  countValue: number;
  currUserRole: "admin" | "user";
}) {
  const questionsQuery = api.question.getQuestions.useQuery(undefined);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: questionsQuery.data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: { pagination: { pageSize: 20 } },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <RoleContext.Provider value={currUserRole}>
      <div className="w-full">
        <div className="space-x-2 pb-4">
          {countValue > 0 && (
            <>
              <Button asChild className="w-fit">
                <Link href="/admin/soal/baru">
                  Buat soal baru
                  <PlusSquare className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {currUserRole === "admin" ? (
                <>
                  <Button asChild className="w-fit">
                    <Link href="/admin/soal/cheat">
                      Data Kecurangan
                      <UserRoundX className="ml-2 h-4 md:w-4" />
                    </Link>
                  </Button>
                  <Button asChild className="w-fit">
                    <Link href="/admin/soal/ban">
                      Data Larangan Peserta Sementara
                      <ListX className="ml-2 h-4 md:w-4" />
                    </Link>
                  </Button>
                  <Button asChild className="w-fit">
                    <Link href="/admin/soal/answer">
                      Data Jawaban
                      <ClipboardCheck className="ml-2 h-4 md:w-4" />
                    </Link>
                  </Button>
                </>
              ) : null}
            </>
          )}
        </div>

        <div className="flex items-center pb-4">
          <Input
            placeholder="Filter berdasarkan judul soal..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-md"
          />

          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <CreateQRCodes
              selectedData={table
                .getFilteredSelectedRowModel()
                .rows.map((row) => ({
                  slug: row.original.slug,
                  title: row.original.title,
                }))}
            />
          )}

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
              {questionsQuery.isError ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Error: {questionsQuery.error.message}
                  </TableCell>
                </TableRow>
              ) : null}

              {questionsQuery.isLoading && !questionsQuery.isError ? (
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
                  {!questionsQuery.isLoading && (
                    <>
                      {!questionsQuery.isError && (
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
          <div className="text-muted-foreground flex flex-1 flex-row items-center">
            <p className="text-sm">
              {table.getFilteredSelectedRowModel().rows.length} dari{" "}
              {table.getFilteredRowModel().rows.length} baris dipilih.
            </p>
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
