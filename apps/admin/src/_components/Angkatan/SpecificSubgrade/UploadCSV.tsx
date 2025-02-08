"use client";

import { useState } from "react";
import { validateId } from "@enpitsu/token-generator";
import { Button } from "@enpitsu/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@enpitsu/ui/dialog";
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
import { parse as parseCSV } from "csv-parse";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "~/trpc/react";

const FileValueSchema = z.array(
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
      .min(6, { message: "Panjang token wajib 6 karakter!" })
      .max(6, { message: "Panjang token tidak boleh dari 6 karakter!" })
      .refine(validateId, { message: "Format token tidak sesuai!" }),
  }),
);

export const UploadCSV = ({
  grade,
  subgrade,
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
}) => {
  const [open, setOpen] = useState(false);
  const [readLock, setReadLock] = useState(false);

  const apiUtils = api.useUtils();

  const formSchema = z.object({
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const createStudentManyMutation = api.grade.createStudentMany.useMutation({
    async onSuccess() {
      form.reset();

      await apiUtils.grade.getStudents.invalidate();

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
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

      const result = FileValueSchema.safeParse(records);

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
