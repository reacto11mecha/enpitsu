"use client";

import type { RouterOutputs } from "@enpitsu/api";
import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useTRPC } from "~/trpc/react";

type StudentTempoban = RouterOutputs["question"]["getStudentTempobans"];

export const DeleteSingleBannedStudent = ({
  id,
  studentName,
  studentClassName,
  isDialogOpen,
  setDialogOpen,
}: {
  id: number;
  studentName: string;
  studentClassName: string;
  isDialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteBannedStudent = useMutation(
    trpc.grade.deleteSingleTemporaryBan.mutationOptions({
      async onSuccess() {
        await queryClient.invalidateQueries(
          trpc.question.getStudentTempobans.pathFilter(),
        );

        toast.success("Penghapusan Larangan Berhasil!", {
          description: `Berhasil menghapus peserta!`,
        });

        setDialogOpen(false);
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
      open={isDialogOpen}
      onOpenChange={() => {
        if (deleteBannedStudent.isPending) return;

        setDialogOpen((prev) => !prev);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hapus Larangan Peserta</DialogTitle>
          <DialogDescription>
            Peserta atas nama <b>{studentName}</b> yang berasal dari kelas{" "}
            <b>{studentClassName}</b> akan dihapus status larangannya. Anda
            yakin ingin melanjutkan?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            onClick={() => deleteBannedStudent.mutate({ id })}
            disabled={deleteBannedStudent.isPending}
          >
            Hapus
          </Button>
          <DialogClose asChild disabled={deleteBannedStudent.isPending}>
            <Button
              type="button"
              variant="secondary"
              disabled={deleteBannedStudent.isPending}
            >
              Batal
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteManyBannedStudent = ({
  data,
  resetSelection,
}: {
  data: StudentTempoban;
  resetSelection: () => void;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const allIds = useMemo(() => data.map((d) => d.id), [data]);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteManyBannedStudent = useMutation(
    trpc.grade.deleteManyTemporaryBan.mutationOptions({
      async onSuccess() {
        setDialogOpen(false);

        await queryClient.invalidateQueries(
          trpc.question.getStudentTempobans.pathFilter(),
        );

        resetSelection();

        toast.success("Penghapusan Berhasil!", {
          description: "Berhasil menghapus banyak larangan sementara peserta.",
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
        if (deleteManyBannedStudent.isPending) return;

        setDialogOpen((prev) => !prev);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 md:w-4" />
          Hapus peserta yang dipilih
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-lg md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Hapus Banyak Larangan Sementara Peserta</DialogTitle>
          <DialogDescription>
            Anda akan menghapus status larangan sementara kepada beberapa
            peserta. Mohon untuk cek ulang, apakah sudah sesuai? Hapus jika
            sudah benar.
          </DialogDescription>
          <div className="max-h-[35vh] overflow-y-scroll">
            <ol className="my-2 ml-6 list-decimal [&>li]:mt-2">
              {data.map((d) => (
                <li key={d.id}>{d.student.name}</li>
              ))}
            </ol>
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            onClick={() => deleteManyBannedStudent.mutate({ ids: allIds })}
            disabled={deleteManyBannedStudent.isPending}
          >
            Hapus
          </Button>
          <DialogClose asChild disabled={deleteManyBannedStudent.isPending}>
            <Button
              type="button"
              variant="secondary"
              disabled={deleteManyBannedStudent.isPending}
            >
              Batal
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
