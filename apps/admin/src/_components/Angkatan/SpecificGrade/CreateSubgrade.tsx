"use client";

import { Button } from "@enpitsu/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@enpitsu/ui/form";
import { Input } from "@enpitsu/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useTRPC } from "~/trpc/react";

const formSchema = z.object({
  label: z.string().min(1, {
    message: "Nama kelas baru wajib di isi!",
  }),
});

export const CreateSubgrade = ({ gradeId }: { gradeId: number }) => {
  const queryClient = useQueryClient();

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

      toast.success("Penambahan Berhasil!", {
        description: "Berhasil menambahkan kelas baru.",
      });
    },

    onError(error) {
      toast.error("Operasi Gagal", {
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
                aria-disabled={createSubgradeMutation.isPending}
                className="w-full"
              >
                <FormLabel>Nama Sub Kelas</FormLabel>
                <div className="flex w-full flex-row gap-5">
                  <FormControl className="w-full">
                    <Input
                      placeholder="1"
                      {...field}
                      autoComplete="off"
                      disabled={createSubgradeMutation.isPending}
                    />
                  </FormControl>
                  <Button
                    disabled={createSubgradeMutation.isPending}
                    type="submit"
                  >
                    {createSubgradeMutation.isPending ? (
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
