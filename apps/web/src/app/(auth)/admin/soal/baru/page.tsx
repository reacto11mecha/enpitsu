"use client";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CalendarIcon } from "lucide-react"

import { api } from "~/utils/api";

const formSchema = z.object({
  title: z.string().min(3, { message: "Judul soal harus di isi!" }),
  slug: z.string().min(2, { message: "Kode soal wajib di isi!" }),
  startedAt: z.date(),
  endedAt: z.date(),
})

export default function NewQuestion() {
  const { toast } = useToast()

  const apiUtils = api.useUtils()


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

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
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return <div className="mt-5 flex flex-col gap-7 px-5">
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight">Soal Baru</h2>
      <p className="text-muted-foreground">
        Buat soal baru untuk dikerjakan oleh peserta ujian.
      </p>
    </div>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Soal</FormLabel>
              <FormControl>
                <Input placeholder="MATEMATIKA WAJIB XII" {...field} disabled={createQuestionMutation.isLoading} />
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
                <Input placeholder="MATWA-XII" {...field} disabled={createQuestionMutation.isLoading} />
              </FormControl>
              <FormDescription>
                Masukan kode soal yang nantinya akan menjadi Kode QR yang dapat di scan oleh peserta.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waktu Mulai</FormLabel>
              <FormControl>
                <Input type="time" {...field} disabled={createQuestionMutation.isLoading} />
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
          render={() => (
            <FormItem>
              <FormLabel>Waktu Selesai</FormLabel>
              <FormControl>
                <div className="flex flex-row ">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Pilih tanggal</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        className="w-[50%]"
                        mode="single"
                        // selected={date}
                        // onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Input type="time" disabled={createQuestionMutation.isLoading} />
                </div>
              </FormControl>
              <FormDescription>
                Tentukan kapan peserta harus mengumpulkan jawaban.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createQuestionMutation.isLoading}>Buat</Button>
      </form>
    </Form>
  </div>
}
