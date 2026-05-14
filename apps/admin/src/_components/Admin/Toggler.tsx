"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type {
  TToggleCanLoginSchema,
  TToggleEnforceAndroid,
} from "@enpitsu/validator/admin";
import {
  ToggleCanLoginSchema,
  ToggleEnforceAndroid,
} from "@enpitsu/validator/admin";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { useTRPC } from "~/trpc/react";

export const ToggleCanLogin = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<TToggleCanLoginSchema>({
    resolver: zodResolver(ToggleCanLoginSchema),
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

  const onSubmit = (data: TToggleCanLoginSchema) =>
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

export const ToggleEnforceAndroidUsage = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<TToggleEnforceAndroid>({
    resolver: zodResolver(ToggleEnforceAndroid),
  });

  const enforceMobileOnAndroidQuery = useQuery(
    trpc.admin.getEnforceAndroidSetting.queryOptions(),
  );

  useEffect(() => {
    if (
      !enforceMobileOnAndroidQuery.isPending &&
      enforceMobileOnAndroidQuery.data
    )
      form.setValue(
        "enforceMobileIfAndroid",
        enforceMobileOnAndroidQuery.data.enforceMobileIfAndroid,
      );
  }, [enforceMobileOnAndroidQuery, form]);

  const updateEnforcingMutation = useMutation(
    trpc.admin.updateAndroidEnforcingSetting.mutationOptions({
      async onMutate(_newValue) {
        await queryClient.cancelQueries(
          trpc.admin.getEnforceAndroidSetting.pathFilter(),
        );

        // queryClient.setQueryData(trpc.admin.getCanLoginStatus, () => newValue);
      },
      onError(err) {
        // queryClient.admin.getCanLoginStatus.setData(undefined, { canLogin: false });

        toast.error("Gagal memperbarui perilaku aplikasi", {
          description: err.message,
        });
      },
      onSuccess() {
        toast.success("Berhasil memperbarui perilaku aplikasi!");
      },
      async onSettled() {
        await queryClient.invalidateQueries(
          trpc.admin.getEnforceAndroidSetting.pathFilter(),
        );
      },
    }),
  );

  const onSubmit = (data: TToggleEnforceAndroid) =>
    updateEnforcingMutation.mutate(data);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="enforceMobileIfAndroid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Wajib Menggunakan Aplikasi Android
                    </FormLabel>
                    <FormDescription>
                      Anda dapat mewajibkan peserta pengguna Android untuk
                      beralih dari web ke aplikasi android agar fitur
                      keamanannya dapat diperketat lagi.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      disabled={
                        enforceMobileOnAndroidQuery.isPending ||
                        updateEnforcingMutation.isPending
                      }
                      checked={field.value}
                      onCheckedChange={(val) => {
                        field.onChange(val);

                        updateEnforcingMutation.mutate({
                          enforceMobileIfAndroid: val,
                        });
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
