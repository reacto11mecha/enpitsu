"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfDay } from "date-fns";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";

const formSchema = z
  .object({
    title: z
      .string({ required_error: "Judul soal harus di isi!" })
      .min(5, { message: "Minimal memiliki 5 karakter!" }),
    slug: z
      .string({ required_error: "Kode soal wajib di isi!" })
      .min(4, { message: "Minimal memiliki 4 karakter!" }),
    startedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian dimulai!",
    }),
    endedAt: z.date({
      required_error: "Diperlukan kapan waktu ujian selesai!",
    }),
  })
  .refine((data) => data.startedAt < data.endedAt, {
    path: ["endedAt"],
    message: "Waktu selesai tidak boleh kurang dari waktu mulai!",
  });

export default function NewQuestion() {
  const router = useRouter();

  const { toast } = useToast();

  const apiUtils = api.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const createQuestionMutation = api.question.createQuestion.useMutation({
    async onSuccess(result) {
      form.reset();

      await apiUtils.grade.getStudents.invalidate();

      toast({
        title: "Penambahan Berhasil!",
        description: `Berhasil menambahkan soal baru!`,
      });

      router.replace(`/admin/soal/butir/${result.at(0)!.id}`);
    },

    onError(error) {
      toast({
        variant: "destructive",
        title: "Operasi Gagal",
        description: `Terjadi kesalahan, Error: ${error.message}`,
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createQuestionMutation.mutate({ ...values });
  }

  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[85%]">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight">Soal Baru</h2>
          <p className="text-muted-foreground">
            Buat soal baru untuk dikerjakan oleh peserta ujian. Pada halaman ini
            terlebih dahulu menambahkan idetitas soal, jika sudah dan berhasil
            maka akan diarahkan ke halaman pembuatan soal.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Soal</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="MATEMATIKA WAJIB XII"
                      disabled={createQuestionMutation.isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukan judul soal yang akan menjadi keterangan soal.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Soal</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="MATWA-XII"
                      disabled={createQuestionMutation.isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukan kode soal yang nantinya akan menjadi Kode QR yang
                    dapat di scan oleh peserta.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
              <FormField
                control={form.control}
                name="startedAt"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Waktu Mulai</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        type="datetime-local"
                        min={format(
                          startOfDay(new Date()),
                          "yyyy-MM-dd'T'HH:mm",
                        )}
                        value={
                          field.value
                            ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                        disabled={createQuestionMutation.isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Tentukan kapan peserta bisa mulai mengerjakan soal.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endedAt"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Waktu Selesai</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        min={
                          form.getValues("startedAt")
                            ? format(
                                form.getValues("startedAt"),
                                "yyyy-MM-dd'T'HH:mm",
                              )
                            : ""
                        }
                        value={
                          field.value
                            ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                        disabled={
                          !form.getValues("startedAt") ||
                          createQuestionMutation.isLoading
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Tentukan kapan batas waktu maksimal peserta dapat
                      mengumpulkan jawaban.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={createQuestionMutation.isLoading}>
              {createQuestionMutation.isLoading ? (
                <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
              ) : null}
              Buat
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
