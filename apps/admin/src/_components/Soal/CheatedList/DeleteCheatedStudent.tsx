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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "~/trpc/react";

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
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () => confirmationText === "saya ingin menghapus kecurangan peserta ini",
    [confirmationText],
  );

  const deleteCheatedStatusMutation = useMutation(
    trpc.question.deleteSpecificBlocklist.mutationOptions({
      async onSuccess() {
        closeDialog();

        setConfirmText("");

        if (questionTitle) {
          await queryClient.invalidateQueries(
            trpc.question.getStudentBlocklists.pathFilter(),
          );
        } else {
          await queryClient.invalidateQueries(
            trpc.question.getStudentBlocklistByQuestion.pathFilter(),
          );
        }

        toast.success("Penghapusan Berhasil!", {
          description: "Berhasil menghapus status kecurangan.",
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
        if (!deleteCheatedStatusMutation.isPending) closeDialog();

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
            disabled={deleteCheatedStatusMutation.isPending}
            value={confirmationText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={deleteCheatedStatusMutation.isPending}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!reallySure || deleteCheatedStatusMutation.isPending}
            onClick={() => {
              if (reallySure) deleteCheatedStatusMutation.mutate({ id });
            }}
          >
            {deleteCheatedStatusMutation.isPending ? (
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

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteManyCheatedStudent = useMutation(
    trpc.question.deleteManyBlocklist.mutationOptions({
      async onSuccess() {
        setDialogOpen(false);

        setConfirmText("");

        await queryClient.invalidateQueries(
          trpc.question.getStudentBlocklistByQuestion.pathFilter(),
        );

        resetSelection();

        toast.success("Penghapusan Berhasil!", {
          description: "Berhasil menghapus banyak kecurangan peserta.",
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
      open={dialogOpen}
      onOpenChange={() => {
        if (deleteManyCheatedStudent.isPending) return;

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
                disabled={deleteManyCheatedStudent.isPending}
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
              disabled={deleteManyCheatedStudent.isPending}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!reallySure || deleteManyCheatedStudent.isPending}
            onClick={() => {
              if (reallySure) deleteManyCheatedStudent.mutate({ ids: allIds });
            }}
          >
            {deleteManyCheatedStudent.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AggregateDeleteCheatedStudent = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () =>
      confirmationText ===
      "saya ingin menghapus seluruh data kecurangan peserta pada aplikasi ini",
    [confirmationText],
  );

  const wipeCheatedStudentRecord = useMutation(
    trpc.question.wipeBlocklistRecord.mutationOptions({
      async onSuccess() {
        setDialogOpen(false);

        setConfirmText("");

        await queryClient.invalidateQueries(
          trpc.question.getStudentBlocklists.pathFilter(),
        );

        toast.success("Penghapusan Berhasil!", {
          description: "Berhasil mengosongkan catatan kecurangan peserta.",
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
      open={dialogOpen}
      onOpenChange={() => {
        if (wipeCheatedStudentRecord.isPending) return;

        setDialogOpen((prev) => !prev);
        setConfirmText("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Trash2 className="mr-2 h-4 md:w-4" />
          Hapus seluruh data kecurangan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-lg md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Hapus Seluruh Data Kecurangan Peserta</DialogTitle>
          <DialogDescription>
            Anda akan menghapus seluruh data kecurangan yang tercatat pada
            sistem. Mohon pikirkan kembali apakah aksi yang akan anda lakukan
            berada pada waktu yang tepat atau tidak. Data yang anda hapus tidak
            bisa dikembalikan.
          </DialogDescription>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <DialogDescription className="text-start">
                Jika anda yakin dan ingin melanjutkan, ketik{" "}
                <b className="select-none">
                  saya ingin menghapus seluruh data kecurangan peserta pada
                  aplikasi ini
                </b>{" "}
                pada kolom dibawah:
              </DialogDescription>
              <Input
                type="text"
                autoComplete="false"
                autoCorrect="false"
                onPaste={(e) => e.preventDefault()}
                disabled={wipeCheatedStudentRecord.isPending}
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
              disabled={wipeCheatedStudentRecord.isPending}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!reallySure || wipeCheatedStudentRecord.isPending}
            onClick={() => {
              if (reallySure) wipeCheatedStudentRecord.mutate();
            }}
          >
            {wipeCheatedStudentRecord.isPending ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
