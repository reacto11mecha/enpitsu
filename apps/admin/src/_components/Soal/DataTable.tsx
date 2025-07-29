"use client";

import type { RouterOutputs } from "@enpitsu/api";
import type { ColumnDef } from "@tanstack/react-table";
import { createContext, useContext, useState } from "react";
import { Space_Mono } from "next/font/google";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@enpitsu/ui/avatar";
import { Badge, badgeVariants } from "@enpitsu/ui/badge";
import { Button } from "@enpitsu/ui/button";
import { Checkbox } from "@enpitsu/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@enpitsu/ui/dropdown-menu";
import { Input } from "@enpitsu/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@enpitsu/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowUpDown,
  ClipboardCheck,
  LayoutList,
  ListX,
  MoreHorizontal,
  PencilLine,
  PlusSquare,
  Trash2,
  UserRoundX,
} from "lucide-react";

import { ReusableDataTable } from "~/_components/data-table";
import { useTRPC } from "~/trpc/react";
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
          <p>{row.original.user.name ?? "N/A"}</p>
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
    accessorKey: "eligible",
    header: "Soal Layak Pengerjaan",
    cell: ({ row }) => (
      <div className="flex w-full items-center justify-center">
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant={
                row.original.eligible === "NOT_ELIGIBLE"
                  ? "destructive"
                  : row.original.eligible === "PROCESSING"
                    ? "secondary"
                    : "default"
              }
            >
              {row.original.eligible === "NOT_ELIGIBLE"
                ? "TIDAK LAYAK"
                : row.original.eligible === "PROCESSING"
                  ? "DI PROSES"
                  : "LAYAK"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {row.original.eligible === "NOT_ELIGIBLE"
                ? row.original.notEligibleReason
                : row.original.eligible === "PROCESSING"
                  ? "Sedang dalam proses pengecekan..."
                  : "Soal dapat dikerjakan peserta"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
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
  const trpc = useTRPC();
  const questionsQuery = useQuery(trpc.question.getQuestions.queryOptions());

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

        <TooltipProvider>
          <ReusableDataTable
            columns={columns}
            data={questionsQuery.data ?? []}
            queryIsPending={questionsQuery.isPending}
            queryIsError={questionsQuery.isError}
            queryErrorMessage={questionsQuery.error?.message}
            showTableControl
            additionalControl={(table) => (
              <>
                <Input
                  placeholder="Filter berdasarkan judul soal..."
                  value={
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    (table.getColumn("title")?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table.getColumn("title")?.setFilterValue(event.target.value)
                  }
                  className="w-full md:max-w-md"
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
              </>
            )}
          />
        </TooltipProvider>
      </div>
    </RoleContext.Provider>
  );
}
