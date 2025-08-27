"use client";

import type { RouterOutputs } from "@enpitsu/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ReusableDataTable } from "~/_components/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/trpc/react";
import { AcceptUser } from "./AcceptUser";

type PendingUserList = RouterOutputs["admin"]["getPendingUser"][number];

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
    id: "accept",
    enableHiding: false,
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const trpc = useTRPC();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const queryClient = useQueryClient();

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isOpen, setOpen] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const acceptUserMutation = useMutation(
        trpc.admin.acceptPendingUser.mutationOptions({
          async onSuccess() {
            toast.success("Berhasil menerima pengguna baru!", {
              description: "Pengguna berhasil di approve.",
            });

            toggleOpen();

            await queryClient.invalidateQueries(
              trpc.admin.getAllRegisteredUser.pathFilter(),
            );
          },
          onError(error) {
            toast.error("Operasi Gagal", {
              description: `Terjadi kesalahan, Error: ${error.message}`,
            });
          },
          async onSettled() {
            await queryClient.invalidateQueries(
              trpc.admin.getPendingUser.pathFilter(),
            );
          },
        }),
      );

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const triggerAcceptCallback = useCallback(
        (data: { role: "user" | "admin" }) =>
          acceptUserMutation.mutate({ id: row.original.id, role: data.role }),
        [acceptUserMutation, row.original.id],
      );

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const rejectUserMutation = useMutation(
        trpc.admin.rejectPendingUser.mutationOptions({
          onSuccess() {
            toast.success("Berhasil menolak pengguna!", {
              description: "Pengguna berhasil dihapus.",
            });
          },
          onError(error) {
            toast.error("Operasi Gagal", {
              description: `Terjadi kesalahan, Error: ${error.message}`,
            });
          },
          async onSettled() {
            await queryClient.invalidateQueries(
              trpc.admin.getPendingUser.pathFilter(),
            );
          },
        }),
      );

      return (
        <div className="space-x-5">
          <AcceptUser
            onSubmit={triggerAcceptCallback}
            isOpen={isOpen}
            toggleOpen={toggleOpen}
            isDisabled={
              rejectUserMutation.isPending || acceptUserMutation.isPending
            }
            isLoading={acceptUserMutation.isPending}
          />

          <Button
            variant="destructive"
            disabled={
              acceptUserMutation.isPending || rejectUserMutation.isPending
            }
            onClick={() => {
              rejectUserMutation.mutate({ id: row.original.id });
            }}
          >
            {rejectUserMutation.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Tolak
          </Button>
        </div>
      );
    },
  },
];

export function PendingUser() {
  const trpc = useTRPC();
  const pendingUserQuery = useQuery(trpc.admin.getPendingUser.queryOptions());

  return (
    <div className="w-full">
      <ReusableDataTable
        columns={columns}
        data={pendingUserQuery.data ?? []}
        queryIsPending={pendingUserQuery.isPending}
        queryIsError={pendingUserQuery.isError}
        queryErrorMessage={pendingUserQuery.error?.message}
      />
    </div>
  );
}
