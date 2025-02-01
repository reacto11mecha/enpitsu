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

import { api } from "~/trpc/react";

const formSchema = z.object({
  label: z.string().min(1, {
    message: "Nama kelas baru wajib di isi!",
  }),
});

export const CreateSubgrade = ({ gradeId }: { gradeId: number }) => {
  const { toast } = useToast();

  const apiUtils = api.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
    },
  });

  const createSubgradeMutation = api.grade.createSubgrade.useMutation({
    async onSuccess() {
      form.reset();

      await apiUtils.grade.getSubgrades.invalidate();

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
    createSubgradeMutation.mutate({ ...values, gradeId });
  }

  return (
    <Form {...form}>
      <form className="w-full pb-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-row items-end gap-5">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem
                aria-disabled={createSubgradeMutation.isLoading}
                className="w-full"
              >
                <FormLabel>Nama Sub Kelas</FormLabel>
                <div className="flex w-full flex-row gap-5">
                  <FormControl className="w-full">
                    <Input
                      placeholder="1"
                      {...field}
                      autoComplete="off"
                      disabled={createSubgradeMutation.isLoading}
                    />
                  </FormControl>
                  <Button
                    disabled={createSubgradeMutation.isLoading}
                    type="submit"
                  >
                    {createSubgradeMutation.isLoading ? (
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
