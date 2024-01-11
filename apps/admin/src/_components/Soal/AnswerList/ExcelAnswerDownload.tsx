"use client";

import { useCallback, useState } from "react";
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
import ExcelJS from "exceljs";
import { Sheet } from "lucide-react";

import { api } from "~/utils/api";

const ReusableDialog = ({
  open,
  onOpenChange,
  triggerDownload,
  isLoading,
  title,
}: {
  open: boolean;
  onOpenChange: () => void;
  triggerDownload: () => void;
  isLoading: boolean;
  title?: string;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
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
              soal <b>{title}</b>
            </>
          ) : (
            <b>seluruh soal</b>
          )}{" "}
          dalam bentuk excel. Mohon tunggu jika prosesnya akan berjalan lama.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary" disabled={isLoading}>
            Batal
          </Button>
        </DialogClose>
        <Button onClick={triggerDownload} disabled={isLoading}>
          Unduh Data
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const SpecificExcelAnswerDownload = ({
  questionId,
  title,
}: {
  questionId: number;
  title: string;
}) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const excelMutationApi =
    api.question.downloadStudentResponsesExcelById.useMutation({
      async onSuccess(result) {
        const workbook = new ExcelJS.Workbook();

        workbook.created = new Date();

        const worksheet = workbook.addWorksheet(result.slug);

        worksheet.addRow([
          "Nama",
          "Kelas",
          "Ruangan",
          "Mulai Mengerjakan",
          "Waktu Submit",
          "Skor PG",
          "Soal PG",
          "Skor Esai",
          "Soal Esai",
          "Nilai Akhir",
        ]);

        result.data.forEach((res) => {
          worksheet.addRow([
            res.name,
            res.className,
            res.room,
            res.checkIn,
            res.submittedAt,
            res.choiceRightAnswered,
            result.choiceLength,
            res.essayScore,
            result.essayLength,
          ]);
        });

        for (let i = 2; i <= result.data.length + 1; i++) {
          // Komposisi pilihan ganda 70% dan esai 30%
          // - Pak ade
          worksheet.getCell(`J${i}`).value = {
            formula: `((F${i}/G${i}*0.7)+(H${i}/i${i})*0.3)*100`,
          };
        }

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer]);
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = `Data Nilai-${+Date.now()}-${result.title}.xlsx`;

        anchor.click();
        anchor.remove();

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

  const onOpenChange = useCallback(() => {
    if (!excelMutationApi.isLoading) setOpen((prev) => !prev);
  }, [excelMutationApi.isLoading]);

  const triggerDownload = useCallback(
    () => excelMutationApi.mutate({ questionId }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <ReusableDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={excelMutationApi.isLoading}
      triggerDownload={triggerDownload}
      title={title}
    />
  );
};

export const AggregateExcelAnswerDownload = () => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const excelMutationApi =
    api.question.downloadStudentResponsesExcelAggregate.useMutation({
      async onSuccess(results) {
        const workbook = new ExcelJS.Workbook();

        workbook.created = new Date();

        for (const result of results) {
          const worksheet = workbook.addWorksheet(result.slug);

          worksheet.addRow([
            "Nama",
            "Kelas",
            "Ruangan",
            "Mulai Mengerjakan",
            "Waktu Submit",
            "Skor PG",
            "Soal PG",
            "Skor Esai",
            "Soal Esai",
            "Nilai Akhir",
          ]);

          result.data.forEach((res) => {
            worksheet.addRow([
              res.name,
              res.className,
              res.room,
              res.checkIn,
              res.submittedAt,
              res.choiceRightAnswered,
              res.choiceLength,
              res.essayScore,
              res.essayLength,
            ]);
          });

          for (let i = 2; i <= result.data.length + 1; i++) {
            // Komposisi pilihan ganda 70% dan esai 30%
            // - Pak ade
            worksheet.getCell(`J${i}`).value = {
              formula: `((F${i}/G${i}*0.7)+(H${i}/i${i})*0.3)*100`,
            };
          }
        }

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer]);
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = `Data Nilai-${+Date.now()}-Nilai Agregat.xlsx`;

        anchor.click();
        anchor.remove();

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

  const onOpenChange = useCallback(() => {
    if (!excelMutationApi.isLoading) setOpen((prev) => !prev);
  }, [excelMutationApi.isLoading]);

  const triggerDownload = useCallback(
    () => excelMutationApi.mutate(),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <ReusableDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={excelMutationApi.isLoading}
      triggerDownload={triggerDownload}
    />
  );
};
