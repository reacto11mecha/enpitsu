import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { Button } from "@enpitsu/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@enpitsu/ui/dialog";
import { Input } from "@enpitsu/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

export const DeleteStudent = ({
  openDelete,
  setOpenDelete,
  name,
  id,
}: {
  openDelete: boolean;
  setOpenDelete: Dispatch<SetStateAction<boolean>>;
  name: string;
  id: number;
}) => {
  const apiUtils = api.useUtils();

  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () => confirmationText === "saya ingin menghapus murid ini",
    [confirmationText],
  );

  const studentDeleteMutation = api.grade.deleteStudent.useMutation({
    async onSuccess() {
      setOpenDelete(false);

      setConfirmText("");

      await apiUtils.grade.getStudents.invalidate();

      toast.success("Penghapusan Berhasil!", {
        description: "Berhasil menghapus murid spesifik.",
      });
    },
    onError(error) {
      toast.error("Operasi Gagal", {
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
  });

  return (
    <Dialog
      open={openDelete}
      onOpenChange={() => {
        if (!studentDeleteMutation.isPending) setOpenDelete((prev) => !prev);

        if (confirmationText.length > 0) setConfirmText("");
      }}
    >
      <DialogContent>
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle>Apakah anda yakin?</DialogTitle>
          <DialogDescription>
            Aksi yang anda lakukan dapat berakibat fatal. Jika anda melakukan
            hal ini, maka akan secara permanen menghapus data murid bernama{" "}
            <b>{name}</b>.
          </DialogDescription>
          <DialogDescription className="text-start">
            Sebelum menghapus, ketik <b>saya ingin menghapus murid ini</b> pada
            kolom dibawah:
          </DialogDescription>
          <Input
            type="text"
            autoComplete="false"
            autoCorrect="false"
            disabled={studentDeleteMutation.isPending}
            value={confirmationText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={studentDeleteMutation.isPending}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!reallySure || studentDeleteMutation.isPending}
            onClick={() => {
              if (reallySure) studentDeleteMutation.mutate(id);
            }}
          >
            {studentDeleteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
