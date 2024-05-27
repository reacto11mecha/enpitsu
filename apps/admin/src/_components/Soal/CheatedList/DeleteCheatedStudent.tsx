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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { RouterOutputs } from "@enpitsu/api";
import { Loader2, Trash2 } from "lucide-react";

import { api } from "~/utils/api";

type BlocklistByQuestion =
  RouterOutputs["question"]["getStudentBlocklistByQuestion"];

export const DeleteSingleCheatedStudent = ({
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

export const DeleteManyCheatedStudent = ({
  questionTitle,
  data,
  resetSelection,
}: {
  questionTitle: string;
  data: BlocklistByQuestion;
  resetSelection: () => void;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () =>
      confirmationText ===
      "saya ingin menghapus kecurangan seluruh peserta yang tertera dalam list ini",
    [confirmationText],
  );

  const allIds = useMemo(() => data.map((d) => d.id), [data]);

  const apiUtils = api.useUtils();

  const { toast } = useToast();

  const deleteManyCheatedStudent = api.question.deleteManyBlocklist.useMutation(
    {
      async onSuccess() {
        setDialogOpen(false);

        setConfirmText("");

        await apiUtils.question.getStudentBlocklistByQuestion.invalidate();

        resetSelection();

        toast({
          title: "Penghapusan Berhasil!",
          description: "Berhasil menghapus banyak kecurangan peserta.",
        });
      },
      onError(error) {
        toast({
          variant: "destructive",
          title: "Operasi Gagal",
          description: `Terjadi kesalahan, Error: ${error.message}`,
        });
      },
    },
  );

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={() => {
        if (deleteManyCheatedStudent.isLoading) return;

        setDialogOpen((prev) => !prev);
        setConfirmText("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 md:w-4" />
          Hapus semua kecurangan peserta yang dipilih
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-lg md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Hapus Banyak Kecurangan Peserta</DialogTitle>
          <DialogDescription>
            Anda akan menghapus beberapa kecurangan dari soal{" "}
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
                  saya ingin menghapus kecurangan seluruh peserta yang tertera
                  dalam list ini
                </b>{" "}
                pada kolom dibawah:
              </DialogDescription>
              <Input
                type="text"
                autoComplete="false"
                autoCorrect="false"
                disabled={deleteManyCheatedStudent.isLoading}
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
              disabled={deleteManyCheatedStudent.isLoading}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!reallySure || deleteManyCheatedStudent.isLoading}
            onClick={() => {
              if (reallySure) deleteManyCheatedStudent.mutate({ ids: allIds });
            }}
          >
            {deleteManyCheatedStudent.isLoading ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
