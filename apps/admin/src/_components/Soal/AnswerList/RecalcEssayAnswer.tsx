"use client";

import { useState } from "react";
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
import { ListRestart } from "lucide-react";

import { api } from "~/utils/api";

export const RecalcEssayAnswer = ({
  questionId,
  title,
}: {
  questionId: number;
  title: string;
}) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const recalcMutationApi = api.question.recalcEssayScore.useMutation({
    onSuccess() {
      toast({
        title: "Berhasil dikalkulasi ulang!",
        description: "Semua respon jawaban dari peserta berhasil terkalkulasi!",
      });
      setOpen(false);
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
      open={open}
      onOpenChange={() => {
        if (!recalcMutationApi.isLoading) setOpen((prev) => !prev);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <ListRestart className="mr-2 h-4 md:w-4" />
          Kalkulasi ulang jawaban esai
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kalkulasi ulang jawaban esai</DialogTitle>
          <DialogDescription>
            Anda akan mengkalkulasi ulang <b>semua jawaban esai peserta</b> pada
            soal <b>{title}</b>, karena anda mengubah sesuatu pada soal esai.
            Proses ini bisa{" "}
            <b>berjalan lama tergantung banyaknya jawaban yang ada</b> dan akan{" "}
            <b>memakan sumber daya aplikasi</b>, oleh karena itu dimohon
            kebijaksanaanya.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={recalcMutationApi.isLoading}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            onClick={() => recalcMutationApi.mutate({ questionId })}
            disabled={recalcMutationApi.isLoading}
          >
            Kalkulasi Ulang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
