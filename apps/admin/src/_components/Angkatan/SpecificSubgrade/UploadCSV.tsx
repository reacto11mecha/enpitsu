"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parse as parseCSV } from "csv-parse";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { AppSettings } from "@enpitsu/settings";
import { UploadCSVConstructor } from "@enpitsu/validator/grade";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useTRPC } from "~/trpc/react";

export const UploadCSVFormSchema = z.object({
  csv: z
    .instanceof(FileList, { message: "Dibutuhkan file csv!" })
    .refine((files) => files.length > 0, `Dibutuhkan file csv!`)
    .refine(
      (files) => files.length <= 1,
      `Hanya diperbolehkan upload 1 file saja!`,
    )
    .refine(
      (files) => Array.from(files).every((file) => file.type === "text/csv"),
      "Hanya bisa file csv saja!",
    ),
});

export type TUploadCSVFormSchema = z.infer<typeof UploadCSVFormSchema>;

export const UploadCSV = ({
  grade,
  subgrade,
  appSettings,
}: {
  grade: {
    id: number;
    label: string;
  };
  subgrade: {
    id: number;
    label: string;
    gradeId: number;
  };
  appSettings: AppSettings;
}) => {
  const [open, setOpen] = useState(false);
  const [readLock, setReadLock] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const UploadCSVSchema = useMemo(
    () =>
      UploadCSVConstructor({
        validator: (txt: string) => {
          try {
            return new RegExp(appSettings.tokenSource).test(txt);
          } catch (e: unknown) {
            return false;
          }
        },
        minimalTokenLength: appSettings.minimalTokenLength,
        maximalTokenLength: appSettings.maximalTokenLength,
      }),
    [appSettings],
  );

  const form = useForm<TUploadCSVFormSchema>({
    resolver: zodResolver(UploadCSVFormSchema),
  });

  const createStudentManyMutation = useMutation(
    trpc.grade.createStudentMany.mutationOptions({
      async onSuccess() {
        form.reset();

        await queryClient.invalidateQueries(
          trpc.grade.getStudents.pathFilter(),
        );

        setOpen(false);

        toast.success("Penambahan Berhasil!", {
          description: `Berhasil menambahkan banyak murid baru di kelas ${grade.label} ${subgrade.label}.`,
        });
      },

      onError(error) {
        toast.error("Operasi Gagal", {
          description: `Terjadi kesalahan, Error: ${error.message}`,
        });
      },
    }),
  );

  async function onSubmit(values: TUploadCSVFormSchema) {
    setReadLock(true);

    const file = values.csv.item(0)!;
    const text = await file.text();

    parseCSV(text, { columns: true, trim: true }, (err, records) => {
      if (err) {
        setReadLock(false);
        toast.error("Gagal Membaca File", {
          description: `Terjadi kesalahan, Error: ${err.message}`,
        });
        return;
      }

      const result = UploadCSVSchema.safeParse(records);

      if (!result.success) {
        toast.error("Format file tidak sesuai!", {
          description: `Mohon periksa kembali format file yang ingin di upload, masih ada kesalahan.`,
        });

        setReadLock(false);

        return;
      }

      setReadLock(false);

      createStudentManyMutation.mutate(
        result.data.map((val) => ({
          name: val.Nama,
          participantNumber: val["Nomor Peserta"],
          room: val.Ruang,
          subgradeId: subgrade.id,
          token: val.Token,
        })),
      );
    });
  }

  return (
    <Dialog
      open={!createStudentManyMutation.isPending || !readLock ? open : true}
      onOpenChange={() => {
        if (!createStudentManyMutation.isPending || !readLock) {
          setOpen((prev) => !prev);
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          Upload CSV <FileSpreadsheet className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload File CSV</DialogTitle>
          <DialogDescription>
            Upload file csv untuk menambah murid baru di kelas{" "}
            <b>
              {grade.label} {subgrade.label}
            </b>
            . Nama akan otomatis tersortir dari A ke Z.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="csv"
              render={() => (
                <FormItem>
                  <FormLabel>File CSV</FormLabel>
                  <FormControl>
                    <Input
                      accept="text/csv"
                      type="file"
                      disabled={createStudentManyMutation.isPending}
                      {...form.register("csv")}
                    />
                  </FormControl>
                  <FormDescription>
                    Pilih file csv untuk menambahkan banyak murid sekaligus.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={createStudentManyMutation.isPending || readLock}
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={createStudentManyMutation.isPending || readLock}
          >
            {createStudentManyMutation.isPending || readLock ? (
              <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
            ) : null}
            Tambah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
