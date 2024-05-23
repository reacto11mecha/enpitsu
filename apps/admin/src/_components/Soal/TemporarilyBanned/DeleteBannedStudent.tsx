"use client";

import type { Dispatch, SetStateAction } from "react";
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
import { useToast } from "@/components/ui/use-toast";

import { api } from "~/utils/api";

export function DeleteBannedStudent({
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
}) {
  const { toast } = useToast();

  const apiUtils = api.useUtils();

  const deleteBannedStudent = api.grade.deleteTemporaryBan.useMutation({
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
}
