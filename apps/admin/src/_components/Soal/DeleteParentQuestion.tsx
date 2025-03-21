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

export const DeleteParentQuestion = ({
  openDelete,
  setOpenDelete,
  title,
  id,
}: {
  openDelete: boolean;
  setOpenDelete: Dispatch<SetStateAction<boolean>>;
  title: string;
  id: number;
}) => {
  const apiUtils = api.useUtils();

  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () => confirmationText === "saya ingin menghapus soal ini",
    [confirmationText],
  );

  const deleteQuestionMutation = api.question.deleteQuestion.useMutation({
    async onSuccess() {
      setOpenDelete(false);

      setConfirmText("");

      await apiUtils.question.getQuestions.invalidate();

      toast.success("Penghapusan Berhasil!", {
        description: "Berhasil menghapus soal spesifik.",
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
        if (!deleteQuestionMutation.isPending) setOpenDelete((prev) => !prev);

        if (confirmationText.length > 0) setConfirmText("");
      }}
    >
      <DialogContent>
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle>Apakah anda yakin?</DialogTitle>
          <DialogDescription>
            Aksi yang anda lakukan dapat berakibat fatal. Jika anda melakukan
            hal ini, maka akan secara permanen menghapus data soal{" "}
            <b>{title}</b> bersama dengan respon jawaban dari peserta. Yakin?
          </DialogDescription>
          <DialogDescription className="text-start">
            Jika yakin, ketik <b>saya ingin menghapus soal ini</b> pada kolom
            dibawah:
          </DialogDescription>
          <Input
            type="text"
            autoComplete="false"
            autoCorrect="false"
            disabled={deleteQuestionMutation.isPending}
            value={confirmationText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={deleteQuestionMutation.isPending}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!reallySure || deleteQuestionMutation.isPending}
            onClick={() => {
              if (reallySure) deleteQuestionMutation.mutate({ id });
            }}
          >
            {deleteQuestionMutation.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
