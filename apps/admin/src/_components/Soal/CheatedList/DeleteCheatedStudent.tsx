import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

import { api } from "~/utils/api";

export const DeleteCheatedStudent = ({
  questionTitle,
  closeDialog,
  openDelete,
  name,
  id,
}: {
  questionTitle?: string;
  closeDialog: () => void;
  openDelete: boolean;
  name: string;
  id: number;
}) => {
  const apiUtils = api.useUtils();

  const { toast } = useToast();

  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () => confirmationText === "saya ingin menghapus kecurangan peserta ini",
    [confirmationText],
  );

  const deleteCheatedStatusMutation =
    api.question.deleteSpecificBlocklist.useMutation({
      async onSuccess() {
        closeDialog();

        setConfirmText("");

        if (questionTitle) {
          await apiUtils.question.getStudentBlocklists.invalidate();
        } else {
          await apiUtils.question.getStudentBlocklistByQuestion.invalidate();
        }

        toast({
          title: "Penghapusan Berhasil!",
          description: "Berhasil menghapus status kecurangan.",
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

  return (
    <Dialog
      open={openDelete}
      onOpenChange={() => {
        if (!deleteCheatedStatusMutation.isLoading) closeDialog();

        if (confirmationText.length > 0) setConfirmText("");
      }}
    >
      <DialogContent>
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle>Apakah anda yakin?</DialogTitle>
          <DialogDescription>
            Aksi yang anda lakukan dapat menimbulkan <i>butterfly effect</i>{" "}
            untuk keberadaan bangsa ini. Mohon pertimbangkan penghapusan status
            kecurangan pada peserta <b>{name}</b>
            {questionTitle ? (
              <>
                {" "}
                di soal <b>{questionTitle}</b>
              </>
            ) : null}
            , yakin?
          </DialogDescription>
          <DialogDescription className="text-start">
            Jika yakin, ketik <b>saya ingin menghapus kecurangan peserta ini</b>{" "}
            pada kolom dibawah:
          </DialogDescription>
          <Input
            type="text"
            autoComplete="false"
            autoCorrect="false"
            disabled={deleteCheatedStatusMutation.isLoading}
            value={confirmationText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={deleteCheatedStatusMutation.isLoading}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!reallySure || deleteCheatedStatusMutation.isLoading}
            onClick={() => {
              if (reallySure) deleteCheatedStatusMutation.mutate({ id });
            }}
          >
            {deleteCheatedStatusMutation.isLoading ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
