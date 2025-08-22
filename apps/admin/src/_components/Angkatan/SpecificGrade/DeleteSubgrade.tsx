import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "~/trpc/react";

export const DeleteSubgrade = ({
  openDelete,
  setOpenDelete,
  label,
  id,
}: {
  openDelete: boolean;
  setOpenDelete: Dispatch<SetStateAction<boolean>>;
  label: string;
  id: number;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () => confirmationText === "saya ingin menghapus subkelas ini",
    [confirmationText],
  );

  const subgradeDeleteMutation = useMutation(
    trpc.grade.deleteSubgrade.mutationOptions({
      async onSuccess() {
        setOpenDelete(false);

        setConfirmText("");

        await queryClient.invalidateQueries(
          trpc.grade.getSubgrades.pathFilter(),
        );

        toast.success("Penghapusan Berhasil!", {
          description: "Berhasil menghapus seluruh kelas spesifik.",
        });
      },
      onError(error) {
        toast.error("Operasi Gagal", {
          description: `Terjadi kesalahan, Error: ${error.message}`,
        });
      },
    }),
  );

  return (
    <Dialog
      open={openDelete}
      onOpenChange={() => {
        if (!subgradeDeleteMutation.isPending) setOpenDelete((prev) => !prev);

        if (confirmationText.length > 0) setConfirmText("");
      }}
    >
      <DialogContent>
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle>Apakah anda yakin?</DialogTitle>
          <DialogDescription>
            Aksi yang anda lakukan dapat berakibat fatal. Jika anda melakukan
            hal ini, maka akan secara permanen menghapus data angkatan{" "}
            <b>kelas {label}</b>.
          </DialogDescription>
          <DialogDescription className="text-start">
            Sebelum menghapus, ketik <b>saya ingin menghapus subkelas ini</b>{" "}
            pada kolom dibawah:
          </DialogDescription>
          <Input
            type="text"
            autoComplete="false"
            autoCorrect="false"
            disabled={subgradeDeleteMutation.isPending}
            value={confirmationText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={subgradeDeleteMutation.isPending}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!reallySure || subgradeDeleteMutation.isPending}
            onClick={() => {
              if (reallySure) subgradeDeleteMutation.mutate(id);
            }}
          >
            {subgradeDeleteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
