"use client";

import { Fragment, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parse as parseCSV } from "csv-parse";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { AppSettings } from "@enpitsu/settings";
import type { TCompleteCSVUploadSchema } from "@enpitsu/validator/grade";
import { FirstStepFullCSVConstructor } from "@enpitsu/validator/grade";

import type { TUploadCSVFormSchema } from "./SpecificSubgrade/UploadCSV";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
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
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useTRPC } from "~/trpc/react";
import { UploadCSVFormSchema } from "./SpecificSubgrade/UploadCSV";

const ultimateRegex = /^([a-zA-Z]+)[-_](.+)$/;

export function CompleteCSVUpload({
  appSettings,
}: {
  appSettings: AppSettings;
}) {
  const [open, setOpen] = useState(false);
  const [readLock, setReadLock] = useState(false);

  const [processedData, setProcessedData] = useState<TCompleteCSVUploadSchema>(
    [],
  );
  const [isSecondPage, setSecondPage] = useState(false);

  const [isValidationError, setIsValidationError] = useState(false);
  const [errorIssues, setErrorIssues] = useState<
    {
      id: number;
      line: number;
      field: string;
      value: string;
      errorMessage: string;
    }[]
  >([]);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const completeCsvUploadMutation = useMutation(
    trpc.grade.completeCSVUpload.mutationOptions({
      async onSuccess() {
        await queryClient.invalidateQueries(trpc.grade.getGrades.pathFilter());

        setOpen(false);
        form.reset();
        setProcessedData([]);
        setSecondPage(false);

        toast.success("Unggah data berhasil!", {
          description: `Berhasil mengunggah seluruh data CSV.`,
        });
      },

      onError(error) {
        toast.error("Operasi Gagal", {
          description: `Terjadi kesalahan, Error: ${error.message}`,
        });
      },
    }),
  );

  const form = useForm<TUploadCSVFormSchema>({
    resolver: zodResolver(UploadCSVFormSchema),
  });

  const FirstStepFullCSVSchema = useMemo(
    () =>
      FirstStepFullCSVConstructor({
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

  async function onSubmit(values: TUploadCSVFormSchema) {
    setIsValidationError(false);
    setErrorIssues([]);

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

      const validatedResult = FirstStepFullCSVSchema.safeParse(records);

      if (!validatedResult.success) {
        toast.error("Format file tidak sesuai!", {
          description: `Mohon periksa kembali format file yang ingin di upload, masih ada kesalahan.`,
        });

        setErrorIssues(
          validatedResult.error.errors.map((err, id) => ({
            id,
            line: err.path[0] as number,
            field: err.path[1] as string,
            value: records[err.path[0] as number][
              err.path[1] as string
            ] as string,
            errorMessage: err.message,
          })),
        );
        setIsValidationError(true);

        setReadLock(false);

        return;
      }

      const data = validatedResult.data;

      const groupingMap = new Map<
        string,
        Map<string, Omit<(typeof data)[number], "Kelas">[]>
      >();

      for (const item of data) {
        const match = item.Kelas.match(ultimateRegex);

        if (!match) continue;

        const grade = match[1];
        const subgrade = match[2];

        if (!groupingMap.has(grade)) {
          groupingMap.set(grade, new Map());
        }
        const subgradeMap = groupingMap.get(grade)!;

        if (!subgradeMap.has(subgrade)) {
          subgradeMap.set(subgrade, []);
        }

        const { Kelas, ...participantData } = item;
        subgradeMap.get(subgrade)!.push(participantData);
      }

      const sortedGrades = Array.from(groupingMap.keys()).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      );

      const restructuredData = sortedGrades.map((grade) => {
        const subMap = groupingMap.get(grade)!;

        const sortedSubgrades = Array.from(subMap.keys()).sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
        );

        return {
          grade,
          subgrade: sortedSubgrades.map((subLabel) => ({
            label: subLabel,
            participants: subMap.get(subLabel)!,
          })),
        };
      });

      setProcessedData(restructuredData);

      setSecondPage(true);
      form.reset();

      setReadLock(false);
    });
  }

  return (
    <AlertDialog
      open={!readLock ? open : true}
      onOpenChange={() => {
        if (!completeCsvUploadMutation.isPending || !readLock) {
          if (isSecondPage) {
            setSecondPage(false);
            setProcessedData([]);
          }

          setOpen((prev) => !prev);
          form.reset();
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button>
          Unggah Keseluruhan Data (CSV)
          <FileSpreadsheet className="ml-2 h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="!max-w-4xl">
        {isSecondPage ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Unggah Keseluruhan Data Peserta
              </AlertDialogTitle>
              <AlertDialogDescription>
                Data lolos validasi. Mohon periksa kembali data yang akan anda
                unggah berikut ini.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <ScrollArea className="h-72 w-full rounded-md border">
              <div className="flex flex-col gap-3 p-4">
                {processedData.map((data) => (
                  <div key={data.grade} className="space-y-5">
                    <h1 className="text-2xl font-bold">Kelas {data.grade}</h1>

                    {data.subgrade.map((subgrade) => (
                      <div key={subgrade.label} className="space-y-10">
                        <h2 className="mb-3 text-center text-xl leading-none font-medium">
                          {data.grade} {subgrade.label}
                        </h2>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">Nama</TableHead>
                              <TableHead>Nomor Peserta</TableHead>
                              <TableHead>Ruangan</TableHead>
                              <TableHead className="text-right">
                                Token
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subgrade.participants.map((participant) => (
                              <TableRow key={participant.Token}>
                                <TableCell className="font-medium">
                                  {participant.Nama}
                                </TableCell>
                                <TableCell>
                                  {participant["Nomor Peserta"]}
                                </TableCell>
                                <TableCell>{participant.Ruang}</TableCell>
                                <TableCell className="text-right">
                                  {participant.Token}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <AlertDialogFooter>
              <Button
                type="button"
                variant="secondary"
                disabled={completeCsvUploadMutation.isPending}
                onClick={() => {
                  setSecondPage(false);
                  setProcessedData([]);
                }}
              >
                Batal
              </Button>
              <Button
                disabled={completeCsvUploadMutation.isPending}
                onClick={() => completeCsvUploadMutation.mutate(processedData)}
              >
                {completeCsvUploadMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
                ) : null}
                Unggah Data
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Persiapan Unggah Data</AlertDialogTitle>
              <AlertDialogDescription>
                Untuk mengunggah seluruh data, pastikan data yang anda unggah
                mengikuti format berikut ini.
              </AlertDialogDescription>
              <Table className="my-2">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Nomor Peserta</TableHead>
                    <TableHead>Ruang</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Token</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="italic">
                      nama lengkap peserta
                    </TableCell>
                    <TableCell className="italic">
                      nomor peserta yang sudah panitia tetapkan
                    </TableCell>
                    <TableCell className="italic">ruangan peserta</TableCell>
                    <TableCell className="italic">kelas asal peserta</TableCell>
                    <TableCell className="italic">token akses</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <AlertDialogDescription className="text-center">
                Urutan kolom boleh acak tetapi judul kolom wajib ada dan sama
                dengan contoh.
              </AlertDialogDescription>
            </AlertDialogHeader>
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
                          disabled={readLock}
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
            {isValidationError ? (
              <div>
                <ScrollArea className="h-72 w-full rounded-md border">
                  <div className="p-4">
                    <h4 className="mb-4 text-sm leading-none font-medium text-rose-400">
                      Data yang perlu diperbaiki.
                    </h4>
                    {errorIssues.map((issue) => (
                      <Fragment key={issue.id}>
                        <div className="text-sm">
                          Pada baris <b>{issue.line + 1}</b> di kolom{" "}
                          <b>{issue.field}</b> memiliki nilai{" "}
                          <b>"{issue.value}"</b>. Error: {issue.errorMessage}
                        </div>
                        <Separator className="my-2" />
                      </Fragment>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button type="button" variant="secondary" disabled={readLock}>
                  Batal
                </Button>
              </AlertDialogCancel>
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={readLock}
              >
                {readLock ? (
                  <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
                ) : null}
                Proses File CSV
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
