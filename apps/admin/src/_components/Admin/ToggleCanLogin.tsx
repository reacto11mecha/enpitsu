"use client";

import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@enpitsu/ui/form";
import { Switch } from "@enpitsu/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useTRPC } from "~/trpc/react";

const FormSchema = z.object({
  canLogin: z.boolean(),
});

export const ToggleCanLogin = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const canLoginQuery = useQuery(trpc.admin.getCanLoginStatus.queryOptions());

  useEffect(() => {
    if (!canLoginQuery.isPending && canLoginQuery.data)
      form.setValue("canLogin", canLoginQuery.data.canLogin);
  }, [canLoginQuery, form]);

  const canLoginMutation = useMutation(
    trpc.admin.updateCanLogin.mutationOptions({
      async onMutate(_newValue) {
        await queryClient.cancelQueries(
          trpc.admin.getCanLoginStatus.pathFilter(),
        );

        // queryClient.setQueryData(trpc.admin.getCanLoginStatus, () => newValue);
      },
      onError(err) {
        // queryClient.admin.getCanLoginStatus.setData(undefined, { canLogin: false });

        toast.error("Gagal memperbarui status login", {
          description: err.message,
        });
      },
      onSuccess() {
        toast.success("Berhasil memperbarui status login!");
      },
      async onSettled() {
        await queryClient.invalidateQueries(
          trpc.admin.getCanLoginStatus.pathFilter(),
        );
      },
    }),
  );

  const onSubmit = (data: z.infer<typeof FormSchema>) =>
    canLoginMutation.mutate(data);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="canLogin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Masih Bisa Login
                    </FormLabel>
                    <FormDescription>
                      Ini hanya berlaku untuk pengguna yang belum login, yang
                      sudah tidak akan terpengaruh sama sekali.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      disabled={
                        canLoginQuery.isPending || canLoginMutation.isPending
                      }
                      checked={field.value}
                      onCheckedChange={(val) => {
                        field.onChange(val);

                        canLoginMutation.mutate({ canLogin: val });
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
};
