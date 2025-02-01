"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";

const formSchema = z.object({
  label: z.string().min(1, {
    message: "Nama kelas baru wajib di isi!",
  }),
});

export const NewAngkatan = () => {
  const { toast } = useToast();

  const apiUtils = api.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
    },
  });

  const gradeMutation = api.grade.createGrade.useMutation({
    async onSuccess() {
      form.reset();

      await apiUtils.grade.getGrades.invalidate();

      toast({
        title: "Penambahan Berhasil!",
        description: "Berhasil menambahkan kelas baru.",
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
    gradeMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-row items-end gap-5">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem
                aria-disabled={gradeMutation.isLoading}
                className="w-full"
              >
                <FormLabel>Nama Kelas</FormLabel>
                <div className="flex w-full flex-row gap-5">
                  <FormControl className="md:w-[25rem]">
                    <Input
                      placeholder="X"
                      {...field}
                      autoComplete="off"
                      disabled={gradeMutation.isLoading}
                    />
                  </FormControl>
                  <Button disabled={gradeMutation.isLoading} type="submit">
                    {gradeMutation.isLoading ? (
                      <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
                    ) : null}
                    Tambah
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
