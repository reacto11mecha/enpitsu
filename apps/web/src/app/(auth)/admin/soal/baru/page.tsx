"use client";

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
import { format } from "date-fns";
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
  const { toast } = useToast();

  const apiUtils = api.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
    },
  });

  const createQuestionMutation = api.question.createQuestion.useMutation({
    async onSuccess() {
      form.reset();

      await apiUtils.grade.getStudents.invalidate();

      toast({
        title: "Penambahan Berhasil!",
        description: `Berhasil menambahkan soal baru!`,
      });
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
    console.log(values);
  }

  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[85%]">
        <div className="mb-3">
          <h2 className="text-2xl font-bold tracking-tight">Soal Baru</h2>
          <p className="text-muted-foreground">
            Buat soal baru untuk dikerjakan oleh peserta ujian.
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
                      placeholder="MATEMATIKA WAJIB XII"
                      {...field}
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
                      placeholder="MATWA-XII"
                      {...field}
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
                      Tentukan kapan peserta harus mengumpulkan jawaban.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={createQuestionMutation.isLoading}>
              Buat
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
