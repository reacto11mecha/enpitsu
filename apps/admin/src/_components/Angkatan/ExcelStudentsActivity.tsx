"use client";

import { useCallback, useState } from "react";
import { validateId } from "@enpitsu/token-generator";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@enpitsu/ui/alert-dialog";
import { Button } from "@enpitsu/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@enpitsu/ui/form";
import { Input } from "@enpitsu/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import ExcelJS from "exceljs";
import { HardDriveUpload, Sheet } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "~/trpc/react";

const FileValueSchema = z.array(
  z.object({
    subgradeName: z.string(),
    data: z.array(
      z.object({
        Nama: z
          .string()
          .min(2, { message: "Nama wajib di isi!" })
          .max(255, { message: "Nama terlalu panjang!" }),
        "Nomor Peserta": z
          .string()
          .min(5, { message: "Nomor peserta wajib di isi!" })
          .max(50, { message: "Panjang maksimal hanya 50 karakter!" }),
        Ruang: z
          .string()
          .min(1, { message: "Ruangan peserta wajib di isi!" })
          .max(50, { message: "Panjang maksimal hanya 50 karakter!" }),
        Token: z
          .string()
          .min(13, { message: "Panjang token minimal 13 karakter!" })
          .max(14, { message: "Panjang token tidak boleh dari 14 karakter!" })
          .refine(validateId, { message: "Format token tidak sesuai!" }),
      }),
    ),
  }),
);

const ReusableAlertDialog = ({
  open,
  desc,
  onOpenChange,
  triggerDownload,
  isLoading,
}: {
  open: boolean;
  desc: string;
  onOpenChange: () => void;
  triggerDownload: () => void;
  isLoading: boolean;
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogTrigger asChild>
      <Button className="w-full md:w-fit">
        <Sheet className="mr-2 h-4 md:w-4" />
        Unduh data peserta dalam bentuk excel
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="sm:max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle>Unduh Data Excel</AlertDialogTitle>
        <AlertDialogDescription>{desc}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="sm:justify-start">
        <AlertDialogCancel asChild>
          <Button type="button" variant="secondary" disabled={isLoading}>
            Batal
          </Button>
        </AlertDialogCancel>
        <Button onClick={triggerDownload} disabled={isLoading}>
          Unduh Data
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const ExcelStudentsByGradeDownload = ({
  gradeId,
}: {
  gradeId: number;
}) => {
  const [open, setOpen] = useState(false);

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
      toast.error("Operasi Gagal", {
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
  });

  const onOpenChange = useCallback(() => {
    if (!excelMutationApi.isPending) setOpen((prev) => !prev);
  }, [excelMutationApi.isPending]);

  const triggerDownload = useCallback(
    () => excelMutationApi.mutate({ gradeId }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <ReusableAlertDialog
      open={open}
      desc="Unduh data angkatan ini dalam bentuk excel. Mohon tunggu jika proses ini berjalan lama."
      onOpenChange={onOpenChange}
      isLoading={excelMutationApi.isPending}
      triggerDownload={triggerDownload}
    />
  );
};

export const ExcelStudentsBySubgradeDownload = ({
  subgradeId,
}: {
  subgradeId: number;
}) => {
  const [open, setOpen] = useState(false);

  const excelMutationApi = api.grade.downloadSpecificSubgradeExcel.useMutation({
    async onSuccess(result) {
      const workbook = new ExcelJS.Workbook();

      workbook.created = new Date();

      const worksheet = workbook.addWorksheet(
        `${result.grade.label} ${result.label}`,
      );

      worksheet.addRow(["Nama", "Token", "Nomor Peserta", "Ruangan"]);

      for (const student of result.students) {
        worksheet.addRow([
          student.name,
          student.token,
          student.participantNumber,
          student.room,
        ]);
      }

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `Data Peserta-${+Date.now()}-Spesifik kelas ${
        result.grade.label
      } ${result.label}.xlsx`;

      anchor.click();
      anchor.remove();

      setOpen(false);
    },
    onError(error) {
      toast.error("Operasi Gagal", {
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
  });

  const onOpenChange = useCallback(() => {
    if (!excelMutationApi.isPending) setOpen((prev) => !prev);
  }, [excelMutationApi.isPending]);

  const triggerDownload = useCallback(
    () => excelMutationApi.mutate({ subgradeId }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <ReusableAlertDialog
      open={open}
      desc="Unduh data kelas ini dalam bentuk excel. Mohon tunggu jika proses ini berjalan lama."
      onOpenChange={onOpenChange}
      isLoading={excelMutationApi.isPending}
      triggerDownload={triggerDownload}
    />
  );
};

export const ExcelUploadStudentsByGrade = ({
  gradeId,
}: {
  gradeId: number;
}) => {
  const [open, setOpen] = useState(false);

  const excelMutationApi = api.grade.uploadSpecificGradeExcel.useMutation({
    onSuccess() {
      setOpen(false);

      form.reset();

      toast.success("Upload Data Peserta Berhasil!", {
        description:
          "Mohon untuk mengecek kembali apakah data yang di upload sudah sesuai atau belum.",
      });
    },
    onError(error) {
      toast.error("Operasi Upload Gagal", {
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
  });

  const onOpenChange = useCallback(() => {
    if (!excelMutationApi.isPending) setOpen((prev) => !prev);
  }, [excelMutationApi.isPending]);

  const formSchema = z.object({
    xlsx: z
      .instanceof(FileList, { message: "Dibutuhkan file xlsx!" })
      .refine((files) => files.length > 0, `Dibutuhkan file xlsx!`)
      .refine(
        (files) => files.length <= 1,
        `Hanya diperbolehkan upload 1 file saja!`,
      )
      .refine(
        (files) =>
          Array.from(files).every(
            (file) =>
              file.type ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ),
        "Hanya bisa file xlsx saja!",
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onXLSXSubmit(values: z.infer<typeof formSchema>) {
    const file = values.xlsx.item(0)!;
    const buffer = await file.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const records = workbook.worksheets.map((w) => {
      type TSheetValue = string[];

      const sheetValues = w.getSheetValues() as TSheetValue[];
      const sheetVal = sheetValues
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .filter((d) => !!d)
        .map((d) => d.filter((e) => !!e));
      const keys = sheetVal.shift()!;

      const data = sheetVal.map((d) => {
        const tmpObj: Record<string, string> = {};

        keys.forEach((key, idx: number) => {
          tmpObj[key] = d[idx] ?? "";
        });

        return tmpObj;
      });

      return { subgradeName: w.name, data };
    });

    const result = await FileValueSchema.safeParseAsync(records);

    console.log(result, records);

    if (!result.success) {
      toast.error("Format file tidak sesuai!", {
        description:
          "Mohon periksa kembali format file yang ingin di upload, masih ada kesalahan.",
      });

      return;
    }

    excelMutationApi.mutate({ gradeId, data: result.data });
  }

  return (
    <AlertDialog
      open={form.formState.isSubmitting || open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogTrigger asChild>
        <Button className="w-full md:w-fit">
          <HardDriveUpload className="mr-2 h-4 md:w-4" />
          Unggah data peserta dalam bentuk excel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Unggah Data Excel</AlertDialogTitle>
          <AlertDialogDescription>
            Unggah seluruh data peserta angkatan ini dalam bentuk excel supaya
            memudahkan kegiatan input data. Nama sheet yang ada wajib memiliki
            korelasi dengan nama yang sudah tercantum pada sistem.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onXLSXSubmit)}>
            <FormField
              control={form.control}
              name="xlsx"
              render={() => (
                <FormItem>
                  <FormLabel>File XLSX</FormLabel>
                  <FormControl>
                    <Input
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      type="file"
                      disabled={
                        form.formState.isSubmitting ||
                        excelMutationApi.isPending
                      }
                      {...form.register("xlsx")}
                    />
                  </FormControl>
                  <FormDescription>
                    Pilih file excel untuk menambahkan banyak murid sekaligus.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter className="mt-3 sm:justify-start">
              <AlertDialogCancel asChild>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={
                    form.formState.isSubmitting || excelMutationApi.isPending
                  }
                >
                  Batal
                </Button>
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || excelMutationApi.isPending
                }
              >
                Unggah Data
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
