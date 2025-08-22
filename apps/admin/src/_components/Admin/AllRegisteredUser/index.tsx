"use client";

import type { RouterOutputs } from "@enpitsu/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { Space_Mono } from "next/font/google";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MoreHorizontal, PencilLine } from "lucide-react";

import { ReusableDataTable } from "~/_components/data-table";
import { useTRPC } from "~/trpc/react";
import { UpdateRole } from "./UpdateRole";

type PendingUserList = RouterOutputs["admin"]["getAllRegisteredUser"][number];

const MonoFont = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

export const columns: ColumnDef<PendingUserList>[] = [
  {
    accessorKey: "user",
    header: "Informasi Akun",
    cell: ({ row }) => (
      <div className="flex flex-row items-center gap-4">
        <Avatar>
          {row.original.image ? <AvatarImage src={row.original.image} /> : null}
          <AvatarFallback className="uppercase">
            {row.original.name ? row.original.name.slice(0, 2) : "N/A"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p>{row.original.name ?? "N/A"}</p>
          <small className="text-muted-foreground">
            {row.original.email ? row.original.email : "N/A"}
          </small>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Tingkatan Pengguna",
    cell: ({ row }) => (
      <p>
        {row.getValue("role") === "admin" ? "Administrator" : "Pengguna Biasa"}
      </p>
    ),
  },
  {
    accessorKey: "emailVerified",
    header: "Waktu Pengguna Terverifikasi",
    cell: ({ row }) => (
      <pre className={MonoFont.className}>
        {format(row.getValue("emailVerified"), "dd MMMM yyyy, kk.mm", {
          locale: id,
        })}
      </pre>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [openUpdate, setOpenUpdate] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const toggleOpen = useCallback(() => setOpenUpdate((prev) => !prev), []);

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
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setOpenUpdate(true)}
              >
                <PencilLine className="mr-2 h-4 md:w-4" />
                Perbarui Tingkatan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <UpdateRole
            isOpen={openUpdate}
            toggleOpen={toggleOpen}
            currRole={user.role}
            userId={user.id}
          />
        </>
      );
    },
  },
];

export function AllRegisteredUser() {
  const trpc = useTRPC();
  const allRegisteredUserQuery = useQuery(
    trpc.admin.getAllRegisteredUser.queryOptions(),
  );

  return (
    <div className="w-full">
      <ReusableDataTable
        columns={columns}
        data={allRegisteredUserQuery.data ?? []}
        queryIsPending={allRegisteredUserQuery.isPending}
        queryIsError={allRegisteredUserQuery.isError}
        queryErrorMessage={allRegisteredUserQuery.error?.message}
      />
    </div>
  );
}
