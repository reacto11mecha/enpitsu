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
  desc,
  onOpenChange,
  triggerDownload,
  isLoading,
  title,
}: {
  open: boolean;
  desc: string;
  onOpenChange: () => void;
  triggerDownload: () => void;
  isLoading: boolean;
  title?: string;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button>
        <Sheet className="mr-2 h-4 md:w-4" />
        Unduh data peserta dalam excel
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Unduh Data Excel</DialogTitle>
        <DialogDescription>{desc}</DialogDescription>
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

export const ExcelStudentsByGradeDownload = ({
  gradeId,
}: {
  gradeId: number;
}) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const excelMutationApi = api.grade.downloadSpecificGradeExcel.useMutation({
    async onSuccess(result) {
      const workbook = new ExcelJS.Workbook();

      workbook.created = new Date();

      for (const subgrade of result.subgrades) {
        const worksheet = workbook.addWorksheet(
          `${result.label} ${subgrade.label}`,
        );

        worksheet.addRow(["Nama", "Token", "Nomor Peserta", "Ruangan"]);

        for (const student of subgrade.students) {
          worksheet.addRow([
            student.name,
            student.token,
            student.participantNumber,
            student.room,
          ]);
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `Data Seluruh Peserta-${+Date.now()}-Seluruh kelas ${
        result.label
      }-.xlsx`;

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
    () => excelMutationApi.mutate({ gradeId }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <ReusableDialog
      open={open}
      desc="Download data angkatan ini dalam bentuk excel. Mohon tunggu jika proses ini berjalan lama."
      onOpenChange={onOpenChange}
      isLoading={excelMutationApi.isLoading}
      triggerDownload={triggerDownload}
    />
  );
};
