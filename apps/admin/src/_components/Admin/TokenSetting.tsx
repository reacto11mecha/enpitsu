"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { TTokenSettingFormSchema } from "@enpitsu/validator/admin";
import { TokenSettingFormSchema } from "@enpitsu/validator/admin";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { useTRPC } from "~/trpc/react";

let formUpdated = false;

export function TokenSetting() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);

  const getCurrentTokenSettingQuery = useQuery(
    trpc.admin.getTokenSettings.queryOptions(),
  );

  const updateTokenSettingMutation = useMutation(
    trpc.admin.updateTokenSettings.mutationOptions({
      onSuccess() {
        toast.success("Berhasil memperbarui token!", {
          description: "Seluruh pengaturan token berhasil diperbarui.",
        });
        setDialogOpen(false);
      },
      onError(error) {
        toast.error("Operasi Gagal", {
          description: `Terjadi kesalahan, Error: ${error.message}`,
        });
      },
      async onSettled() {
        await queryClient.invalidateQueries(
          trpc.admin.getTokenSettings.pathFilter(),
        );
      },
    }),
  );

  const form = useForm<TTokenSettingFormSchema>({
    resolver: zodResolver(TokenSettingFormSchema),
    defaultValues: {
      tokenSource: "^[A-Z]{2}-[0-9]{3}$",
      tokenFlags: "",
      minimalTokenLength: 6,
      maximalTokenLength: 6,
    },
  });

  useEffect(() => {
    if (!formUpdated) {
      if (getCurrentTokenSettingQuery.data) {
        const data = getCurrentTokenSettingQuery.data;

        form.setValue("tokenSource", data.tokenSource);
        form.setValue("tokenFlags", data.tokenFlags);
        form.setValue("minimalTokenLength", data.minimalTokenLength);
        form.setValue("maximalTokenLength", data.maximalTokenLength);

        formUpdated = true;
      }
    }
  }, [getCurrentTokenSettingQuery, form]);

  const tokenSource = form.watch("tokenSource");
  const tokenFlags = form.watch("tokenFlags");

  const regexVisualization = useMemo(() => {
    try {
      return {
        error: false,
        message: new RegExp(tokenSource, tokenFlags).toString(),
      };
    } catch (e: unknown) {
      return {
        error: true,
        message: "Error: source/flags tidak sesuai dengan ketentuan!",
      };
    }
  }, [tokenSource, tokenFlags]);

  const [confirmationText, setConfirmText] = useState("");

  const reallySure = useMemo(
    () => confirmationText === "saya yakin akan mengubah pengaturan pola token",
    [confirmationText],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Token Peserta</CardTitle>
        <CardDescription>
          Dibawah ini adalah pengaturan bagaimana identitas peserta pada
          kegiatan asesmen kali ini berjalan. Pola token yang berfungsi sebagai
          penentu bentuk token juga minimal dan maksimal jumlah karakter dapat
          berpengaruh pada integritas data. Jangan diubah apabila tidak yakin
          dengan apa yang anda lakukan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            // untuk validasi terlebih dahulu
            onSubmit={form.handleSubmit(() => setDialogOpen(true))}
            className="mb-5 w-full space-y-5"
          >
            <FormField
              control={form.control}
              name="tokenSource"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Token Source</FormLabel>
                  <FormControl className="w-full">
                    <div className="flex w-full flex-row items-center gap-5">
                      <Input
                        disabled={
                          updateTokenSettingMutation.isPending ||
                          getCurrentTokenSettingQuery.isPending
                        }
                        className="w-full font-mono"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Pola regex berbentuk string untuk digunakan sebagai pola
                    token.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tokenFlags"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Token Flags</FormLabel>
                  <FormControl className="w-full">
                    <div className="flex w-full flex-row items-center gap-5">
                      <Input
                        disabled={
                          updateTokenSettingMutation.isPending ||
                          getCurrentTokenSettingQuery.isPending
                        }
                        className="w-full font-mono"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Minimal jumlah karakter yang memenuhi kriteria token.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <p>
                Regex:{" "}
                <span className="font-mono text-pink-700 dark:text-pink-600">
                  {regexVisualization.message}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-5 md:flex-row md:gap-3">
              <FormField
                control={form.control}
                name="minimalTokenLength"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Minimal Panjang Token</FormLabel>
                    <FormControl className="w-full">
                      <div className="flex w-full flex-row items-center gap-5">
                        <Input
                          disabled={
                            updateTokenSettingMutation.isPending ||
                            getCurrentTokenSettingQuery.isPending
                          }
                          className="w-full"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Jumlah minimal karakter yang memenuhi kriteria token.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximalTokenLength"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Maksimal Panjang Token</FormLabel>
                    <FormControl className="w-full">
                      <div className="flex w-full flex-row items-center gap-5">
                        <Input
                          disabled={
                            updateTokenSettingMutation.isPending ||
                            getCurrentTokenSettingQuery.isPending
                          }
                          className="w-full"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Jumlah maksimal karakter yang memenuhi kriteria token.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={regexVisualization.error}>
              Simpan
            </Button>
          </form>
        </Form>

        <AlertDialog
          open={dialogOpen}
          onOpenChange={() => {
            if (!updateTokenSettingMutation.isPending)
              setDialogOpen((prev) => !prev);

            if (confirmationText.length > 0) setConfirmText("");
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Apabila anda mengubah pengaturan pola, pastikan kompatibel
                dengan data yang sudah ada karena dapat mengakibatkan seluruh
                peserta tidak dapat menggunakan aplikasi apabila terdapat
                kesalahan konfigurasi.
              </AlertDialogDescription>
              <AlertDialogDescription className="text-start">
                Jika semua sudah benar, ketik{" "}
                <b>saya yakin akan mengubah pengaturan pola token</b> pada kolom
                dibawah:
              </AlertDialogDescription>
              <Input
                type="text"
                autoComplete="false"
                autoCorrect="false"
                value={confirmationText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={form.handleSubmit((data) =>
                  updateTokenSettingMutation.mutate(data),
                )}
                disabled={
                  !reallySure ||
                  regexVisualization.error ||
                  updateTokenSettingMutation.isPending
                }
              >
                Simpan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
