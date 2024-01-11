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
import { Sheet } from "lucide-react";
import { utils, writeFile } from "xlsx";

import { api } from "~/utils/api";

export const ExcelAnswerDownload = ({
  questionId,
  title,
}: {
  questionId?: number;
  title?: string;
}) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const excelMutationApi =
    api.question.downloadStudentResponsesExcelById.useMutation({
      onSuccess(result) {
        const workbook = utils.book_new();
        const worksheet = utils.json_to_sheet(result.data);

        utils.book_append_sheet(workbook, worksheet, result.title);

        writeFile(workbook, `Jawaban ${+Date.now()} ${result.title}.xlsx`, {
          compression: true,
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
        if (!excelMutationApi.isLoading) setOpen((prev) => !prev);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Sheet className="mr-2 h-4 md:w-4" />
          Unduh nilai dalam excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unduh Nilai</DialogTitle>
          <DialogDescription>
            Unduh data nilai{" "}
            {title ? (
              <>
                kelas <b>{title}</b>
              </>
            ) : (
              <b>seluruh sekolah</b>
            )}{" "}
            dalam bentuk excel. Mohon tunggu jika prosesnya akan berjalan lama.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={excelMutationApi.isLoading}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            onClick={() => excelMutationApi.mutate({ questionId })}
            disabled={excelMutationApi.isLoading}
          >
            Unduh Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
