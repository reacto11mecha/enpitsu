import type { RouterOutputs } from "@enpitsu/api";
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
  DialogTrigger,
} from "@enpitsu/ui/dialog";
import { Input } from "@enpitsu/ui/input";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

type AnsweredListByQuestion =
  RouterOutputs["question"]["getStudentAnswersByQuestion"];

export const DeleteSingleStudentAnswer = ({
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

  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () => confirmationText === "saya ingin menghapus jawaban peserta ini",
    [confirmationText],
  );

  const deleteSpecificAnswerMutation =
    api.question.deleteSpecificAnswer.useMutation({
      async onSuccess() {
        closeDialog();

        setConfirmText("");

        if (questionTitle) {
          await apiUtils.question.getStudentAnswers.invalidate();
        } else {
          await apiUtils.question.getStudentAnswersByQuestion.invalidate();
        }

        toast.success("Penghapusan Berhasil!", {
          description: "Berhasil menghapus jawaban peserta.",
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
        if (!deleteSpecificAnswerMutation.isPending) closeDialog();

        if (confirmationText.length > 0) setConfirmText("");
      }}
    >
      <DialogContent>
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle>Apakah anda yakin?</DialogTitle>
          <DialogDescription>
            Aksi yang anda lakukan akan menghapus keseluruhan jawaban yang sudah
            dikerjakan oleh peserta <b>{name}</b>
            {questionTitle ? (
              <>
                {" "}
                pada soal <b>{questionTitle}</b>
              </>
            ) : null}{" "}
            dan data tidak bisa dikembalikan, yakin?
          </DialogDescription>
          <DialogDescription className="text-start">
            Jika yakin, ketik <b>saya ingin menghapus jawaban peserta ini</b>{" "}
            pada kolom dibawah:
          </DialogDescription>
          <Input
            type="text"
            autoComplete="false"
            autoCorrect="false"
            disabled={deleteSpecificAnswerMutation.isPending}
            value={confirmationText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={deleteSpecificAnswerMutation.isPending}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!reallySure || deleteSpecificAnswerMutation.isPending}
            onClick={() => {
              if (reallySure) deleteSpecificAnswerMutation.mutate({ id });
            }}
          >
            {deleteSpecificAnswerMutation.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteManyStudentAnswer = ({
  questionTitle,
  data,
  resetSelection,
}: {
  questionTitle: string;
  data: AnsweredListByQuestion;
  resetSelection: () => void;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () =>
      confirmationText ===
      "saya ingin menghapus jawaban seluruh peserta yang tertera dalam list ini",
    [confirmationText],
  );

  const allIds = useMemo(() => data.map((d) => d.id), [data]);

  const apiUtils = api.useUtils();

  const deleteManyStudentAnswers = api.question.deleteManyAnswer.useMutation({
    async onSuccess() {
      setDialogOpen(false);

      setConfirmText("");

      await apiUtils.question.getStudentAnswersByQuestion.invalidate();

      resetSelection();

      toast.success("Penghapusan Berhasil!", {
        description: "Berhasil menghapus banyak jawaban peserta.",
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
      open={dialogOpen}
      onOpenChange={() => {
        if (deleteManyStudentAnswers.isPending) return;

        setDialogOpen((prev) => !prev);
        setConfirmText("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 md:w-4" />
          Hapus jawaban yang dipilih
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-lg md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Hapus Banyak Jawaban Peserta</DialogTitle>
          <DialogDescription>
            Anda akan menghapus beberapa jawaban dari soal{" "}
            <b>{questionTitle}</b>. Mohon periksa kembali apakah nama yang
            tertera di bawah ini sudah benar. Data yang dihapus tidak bisa di
            kembalikan, yakin? Berikut adalah listnya.
          </DialogDescription>
          <div className="flex flex-col gap-3">
            <div className="max-h-[35vh] overflow-y-scroll">
              <ol className="my-2 ml-6 list-decimal [&>li]:mt-2">
                {data.map((d) => (
                  <li key={d.id}>{d.student.name}</li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-2">
              <DialogDescription className="text-start">
                Jika yakin, ketik{" "}
                <b>
                  saya ingin menghapus jawaban seluruh peserta yang tertera
                  dalam list ini
                </b>{" "}
                pada kolom dibawah:
              </DialogDescription>
              <Input
                type="text"
                autoComplete="false"
                autoCorrect="false"
                disabled={deleteManyStudentAnswers.isPending}
                value={confirmationText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <DialogClose asChild>
            <Button
              variant="secondary"
              disabled={deleteManyStudentAnswers.isPending}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!reallySure || deleteManyStudentAnswers.isPending}
            onClick={() => {
              if (reallySure) deleteManyStudentAnswers.mutate({ ids: allIds });
            }}
          >
            {deleteManyStudentAnswers.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
