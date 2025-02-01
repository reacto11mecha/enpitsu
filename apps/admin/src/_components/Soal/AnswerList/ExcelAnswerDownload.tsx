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

import { api } from "~/trpc/react";
import { excelNormalizeTime } from "~/utils/time";

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

        const worksheet = workbook.addWorksheet(result.slug, {
          views: [{ state: "frozen", ySplit: 1 }],
        });

        const essayIsAThing = result.essayLength > 0;
        const headerRow = [
          "Nama",
          "Kelas",
          "Ruangan",
          "Mulai Mengerjakan",
          "Waktu Submit",
          "Durasi Pengerjaan",
          "Skor PG",
          "Soal PG",
          "Skor Esai",
          "Soal Esai",
          "Nilai Akhir",
        ].filter((d) => (essayIsAThing ? true : !d.includes("Esai")));

        worksheet.addRow(headerRow);

        const firstRow = worksheet.getRow(1);

        for (let i = 1; i <= headerRow.length; i++) {
          worksheet.getColumn(i).alignment = {
            vertical: "middle",
            horizontal:
              i === headerRow.length ? "right" : i > 1 ? "center" : "left",
          };

          firstRow.getCell(i).border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }

        firstRow.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        firstRow.font = {
          bold: true,
        };

        result.data.forEach((res, idx) => {
          const adjustedCheckIn = excelNormalizeTime(res.checkIn);
          const adjustedSubmittedAt = excelNormalizeTime(res.submittedAt);

          const rowValue = essayIsAThing
            ? [
                res.name,
                res.className,
                res.room,
                adjustedCheckIn,
                adjustedSubmittedAt,
                "",
                res.choiceRightAnswered,
                result.choiceLength,
                res.essayScore,
                result.essayLength,
              ]
            : [
                res.name,
                res.className,
                res.room,
                adjustedCheckIn,
                adjustedSubmittedAt,
                "",
                res.choiceRightAnswered,
                result.choiceLength,
              ];

          worksheet.addRow(rowValue);

          worksheet.getCell(`F${idx + 2}`).value = {
            formula: `E${idx + 2}-D${idx + 2}`,
          };

          worksheet.getCell(
            essayIsAThing ? `K${idx + 2}` : `I${idx + 2}`,
          ).value = {
            formula: essayIsAThing
              ? // Komposisi pilihan ganda 70% dan esai 30%
                // - Pak ade
                `((G${idx + 2}/H${idx + 2}*0.7)+(I${idx + 2}/J${
                  idx + 2
                })*0.3)*100`
              : `G${idx + 2}/H${idx + 2}*100`,
          };

          const currentRow = worksheet.getRow(idx + 2);

          for (let i = 1; i <= headerRow.length; i++) {
            currentRow.getCell(i).border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }
        });

        worksheet.getColumn(1).width = 40;
        worksheet.getColumn(4).numFmt = "dddd!, dd mmmm yyyy!, HH:MM:ss";
        worksheet.getColumn(4).width = 33;
        worksheet.getColumn(5).numFmt = "dddd!, dd mmmm yyyy!, HH:MM:ss";
        worksheet.getColumn(5).width = 33;
        worksheet.getColumn(6).width = 19;
        worksheet.getColumn(6).numFmt = "HH:MM:ss";

        worksheet.getColumn(headerRow.length).width = 11;

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
    if (!excelMutationApi.isPending) setOpen((prev) => !prev);
  }, [excelMutationApi.isPending]);

  const triggerDownload = useCallback(
    () => excelMutationApi.mutate({ questionId }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <ReusableDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={excelMutationApi.isPending}
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
          const worksheet = workbook.addWorksheet(result.slug, {
            views: [{ state: "frozen", ySplit: 1 }],
          });

          const essayIsAThing = result.essayLength > 0;
          const headerRow = [
            "Nama",
            "Kelas",
            "Ruangan",
            "Mulai Mengerjakan",
            "Waktu Submit",
            "Durasi Pengerjaan",
            "Skor PG",
            "Soal PG",
            "Skor Esai",
            "Soal Esai",
            "Nilai Akhir",
          ].filter((d) => (essayIsAThing ? true : !d.includes("Esai")));

          worksheet.addRow(headerRow);

          const firstRow = worksheet.getRow(1);

          for (let i = 1; i <= headerRow.length; i++) {
            worksheet.getColumn(i).alignment = {
              vertical: "middle",
              horizontal:
                i === headerRow.length ? "right" : i > 1 ? "center" : "left",
            };

            firstRow.getCell(i).border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }

          firstRow.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
          firstRow.font = {
            bold: true,
          };

          result.data.forEach((res, idx) => {
            const adjustedCheckIn = excelNormalizeTime(res.checkIn);
            const adjustedSubmittedAt = excelNormalizeTime(res.submittedAt);

            const rowValue = essayIsAThing
              ? [
                  res.name,
                  res.className,
                  res.room,
                  adjustedCheckIn,
                  adjustedSubmittedAt,
                  "",
                  res.choiceRightAnswered,
                  result.choiceLength,
                  res.essayScore,
                  result.essayLength,
                ]
              : [
                  res.name,
                  res.className,
                  res.room,
                  adjustedCheckIn,
                  adjustedSubmittedAt,
                  "",
                  res.choiceRightAnswered,
                  result.choiceLength,
                ];

            worksheet.addRow(rowValue);

            worksheet.getCell(`F${idx + 2}`).value = {
              formula: `E${idx + 2}-D${idx + 2}`,
            };

            worksheet.getCell(
              essayIsAThing ? `K${idx + 2}` : `I${idx + 2}`,
            ).value = {
              formula: essayIsAThing
                ? // Komposisi pilihan ganda 70% dan esai 30%
                  // - Pak ade
                  `((G${idx + 2}/H${idx + 2}*0.7)+(I${idx + 2}/J${
                    idx + 2
                  })*0.3)*100`
                : `G${idx + 2}/H${idx + 2}*100`,
            };

            const currentRow = worksheet.getRow(idx + 2);

            for (let i = 1; i <= headerRow.length; i++) {
              currentRow.getCell(i).border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              };
            }
          });

          worksheet.getColumn(1).width = 40;
          worksheet.getColumn(4).numFmt = "dddd!, dd mmmm yyyy!, HH:MM:ss";
          worksheet.getColumn(4).width = 33;
          worksheet.getColumn(5).numFmt = "dddd!, dd mmmm yyyy!, HH:MM:ss";
          worksheet.getColumn(5).width = 33;
          worksheet.getColumn(6).width = 19;
          worksheet.getColumn(6).numFmt = "HH:MM:ss";

          worksheet.getColumn(headerRow.length).width = 11;
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
    if (!excelMutationApi.isPending) setOpen((prev) => !prev);
  }, [excelMutationApi.isPending]);

  const triggerDownload = useCallback(
    () => excelMutationApi.mutate(),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <ReusableDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={excelMutationApi.isPending}
      triggerDownload={triggerDownload}
    />
  );
};
