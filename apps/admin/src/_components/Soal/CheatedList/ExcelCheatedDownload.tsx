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
        Unduh kecurangan dalam excel
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Unduh Data Kecurangan</DialogTitle>
        <DialogDescription>
          Unduh data kecurangan{" "}
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

export const SpecificExcelBlockedDownload = ({
  questionId,
  title,
}: {
  questionId: number;
  title: string;
}) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const excelMutationApi =
    api.question.downloadStudentBlocklistsExcelById.useMutation({
      async onSuccess(result) {
        const workbook = new ExcelJS.Workbook();

        workbook.created = new Date();

        const worksheet = workbook.addWorksheet(result.slug, {
          views: [{ state: "frozen", ySplit: 1 }],
        });

        worksheet.addRow(["Nama", "Kelas", "Ruangan", "Waktu Kecurangan"]);

        const firstRow = worksheet.getRow(1);

        for (let i = 1; i <= 4; i++) {
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
          worksheet.addRow([
            res.name,
            res.className,
            res.room,
            new Date(res.time.getTime() + 7 * 60 * 60 * 1000),
          ]);

          const currentRow = worksheet.getRow(idx + 2);

          for (let i = 1; i <= 4; i++) {
            currentRow.getCell(i).alignment = {
              vertical: "middle",
              horizontal: i === 4 ? "right" : i > 1 ? "center" : "left",
            };

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

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer]);
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = `Data Kecurangan-${+Date.now()}-${result.slug}.xlsx`;

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

export const AggregateExcelCheatDownload = () => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const excelMutationApi =
    api.question.downloadStudentBlocklistsExcelAggregate.useMutation({
      async onSuccess(results) {
        const workbook = new ExcelJS.Workbook();

        workbook.created = new Date();

        for (const result of results) {
          const worksheet = workbook.addWorksheet(result.slug, {
            views: [{ state: "frozen", ySplit: 1 }],
          });

          worksheet.addRow(["Nama", "Kelas", "Ruangan", "Waktu Kecurangan"]);

          const firstRow = worksheet.getRow(1);

          for (let i = 1; i <= 4; i++) {
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
            worksheet.addRow([
              res.name,
              res.className,
              res.room,
              new Date(res.time.getTime() + 7 * 60 * 60 * 1000),
            ]);

            const currentRow = worksheet.getRow(idx + 2);

            for (let i = 1; i <= 4; i++) {
              currentRow.getCell(i).alignment = {
                vertical: "middle",
                horizontal: i === 4 ? "right" : i > 1 ? "center" : "left",
              };

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
        }

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer]);
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = `Data Kecurangan-${+Date.now()}-Agregat.xlsx`;

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
