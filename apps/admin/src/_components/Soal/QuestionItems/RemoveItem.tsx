"use client";

import { useState, useTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useTRPC } from "~/trpc/react";
import { refreshQuestionPage } from "./server-actions";

export function RemoveChoiceQuestion({
  choiceId,
  questionId,
  questionNo,
}: {
  choiceId: number;
  questionId: number;
  questionNo: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const trpc = useTRPC();

  const deleteChoiceMutation = useMutation(
    trpc.question.deleteSpecificChoice.mutationOptions({
      onError(err) {
        toast.error("Gagal menghapus soal", {
          description: `Terjadi kesalahan. ${err.message}`,
        });
      },
      onSuccess() {
        toast.success("Berhasil menghapus soal");

        startTransition(async () => {
          await refreshQuestionPage(questionId);
        });
      },
    }),
  );

  return (
    <Popover
      open={isPending || deleteChoiceMutation.isPending || open}
      onOpenChange={() => setOpen((prev) => !prev)}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" className="text-lg">
          <Trash2 className="h-10 w-10 text-rose-500/95" size={64} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">
              Hapus soal pilihan ganda
            </h4>
            <p className="text-muted-foreground text-sm">
              Anda akan menghapus soal pilihan ganda nomor {questionNo}. Klik
              tombol di bawah ini untuk melanjutkan.
            </p>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => deleteChoiceMutation.mutate({ id: choiceId })}
              disabled={isPending || deleteChoiceMutation.isPending}
            >
              {deleteChoiceMutation.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : null}
              Hapus nomor ini
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function RemoveEssayQuestion({
  essayId,
  questionId,
  questionNo,
}: {
  essayId: number;
  questionId: number;
  questionNo: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const trpc = useTRPC();

  const deleteChoiceMutation = useMutation(
    trpc.question.deleteSpecificEssay.mutationOptions({
      onError(err) {
        toast.error("Gagal menghapus soal", {
          description: `Terjadi kesalahan. ${err.message}`,
        });
      },
      onSuccess() {
        toast.success("Berhasil menghapus soal");

        startTransition(async () => {
          await refreshQuestionPage(questionId);
        });
      },
    }),
  );

  return (
    <Popover
      open={isPending || deleteChoiceMutation.isPending || open}
      onOpenChange={() => setOpen((prev) => !prev)}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" className="text-lg">
          <Trash2 className="h-10 w-10 text-rose-500/95" size={64} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">
              Hapus soal pilihan ganda
            </h4>
            <p className="text-muted-foreground text-sm">
              Anda akan menghapus soal pilihan ganda nomor {questionNo}. Klik
              tombol di bawah ini untuk melanjutkan.
            </p>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => deleteChoiceMutation.mutate({ id: essayId })}
              disabled={isPending || deleteChoiceMutation.isPending}
            >
              {deleteChoiceMutation.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : null}
              Hapus nomor ini
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
