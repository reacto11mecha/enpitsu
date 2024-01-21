"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";

const FormSchema = z.object({
  canLogin: z.boolean(),
});

export const ToggleCanLogin = () => {
  const utils = api.useUtils();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const canLoginQuery = api.admin.getCanLoginStatus.useQuery(undefined, {
    onSuccess(result) {
      form.setValue("canLogin", result.canLogin);
    },
  });

  const canLoginMutation = api.admin.updateCanLogin.useMutation({
    async onMutate(newValue) {
      await utils.admin.getCanLoginStatus.cancel();

      utils.admin.getCanLoginStatus.setData(undefined, () => newValue);
    },
    onError(err) {
      utils.admin.getCanLoginStatus.setData(undefined, { canLogin: false });

      toast({
        title: "Gagal memperbarui status login",
        description: err.message,
        variant: "destructive",
      });
    },
    onSuccess() {
      toast({
        title: "Berhasil memperbarui status login!",
      });
    },
    async onSettled() {
      await utils.admin.getCanLoginStatus.invalidate();
    },
  });

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
                        canLoginQuery.isLoading || canLoginMutation.isLoading
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
