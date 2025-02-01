"use client";

import type { RouterOutputs } from "@enpitsu/api";
import type { Dispatch, SetStateAction } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

import { api } from "~/utils/api";

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
  const { toast } = useToast();

  const apiUtils = api.useUtils();

  const deleteBannedStudent = api.grade.deleteSingleTemporaryBan.useMutation({
    async onSuccess() {
      await apiUtils.question.getStudentTempobans.invalidate();

      toast({
        title: "Penghapusan Larangan Berhasil!",
        description: `Berhasil menghapus peserta!`,
      });

      setDialogOpen(false);
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
      open={isDialogOpen}
      onOpenChange={() => {
        if (deleteBannedStudent.isLoading) return;

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
            disabled={deleteBannedStudent.isLoading}
          >
            Hapus
          </Button>
          <DialogClose asChild disabled={deleteBannedStudent.isLoading}>
            <Button
              type="button"
              variant="secondary"
              disabled={deleteBannedStudent.isLoading}
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

  const apiUtils = api.useUtils();

  const { toast } = useToast();

  const deleteManyBannedStudent = api.grade.deleteManyTemporaryBan.useMutation({
    async onSuccess() {
      setDialogOpen(false);

      await apiUtils.question.getStudentTempobans.invalidate();

      resetSelection();

      toast({
        title: "Penghapusan Berhasil!",
        description: "Berhasil menghapus banyak larangan sementara peserta.",
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
      open={dialogOpen}
      onOpenChange={() => {
        if (deleteManyBannedStudent.isLoading) return;

        setDialogOpen((prev) => !prev);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 md:w-4" />
          Hapus semua larangan peserta yang dipilih
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
            disabled={deleteManyBannedStudent.isLoading}
          >
            Hapus
          </Button>
          <DialogClose asChild disabled={deleteManyBannedStudent.isLoading}>
            <Button
              type="button"
              variant="secondary"
              disabled={deleteManyBannedStudent.isLoading}
            >
              Batal
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
