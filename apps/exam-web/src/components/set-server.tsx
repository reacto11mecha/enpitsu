import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { env } from "@/env";
import { systemServerAtom } from "@/lib/atom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import ky, { type HTTPError } from "ky";
import { ChevronsRight, DoorOpen, LoaderPinwheel } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ModeToggle } from "./mode-toggle";

const formSchema = z.object({
  npsn: z
    .union([
      z
        .string({ required_error: "Bidang ini wajib di isi." })
        .min(8, { message: "NPSN memiliki panjang 8 digit." })
        .max(8, { message: "NPSN memiliki panjang 8 digit." }),
      z.number({ required_error: "Bidang ini wajib di isi." }).int().positive(),
    ])
    .pipe(
      z.coerce.number({ required_error: "Bidang ini wajib di isi." }).min(1),
    ),
});

export function LogoutFromCurrentServer() {
  const [systemServer, setSystem] = useAtom(systemServerAtom);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <DoorOpen />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Yakin ingin mengganti server?</AlertDialogTitle>
          <AlertDialogDescription>
            Saat ini anda terhubung ke server <b>{systemServer.institution}</b>.
            Anda bisa terhubung kembali dengan memasukan NPSN dengan nomor{" "}
            <b>{systemServer.npsn}</b>. Lanjutkan?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={() => setSystem(RESET)}>
            Keluar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SetServer() {
  const setServerProps = useSetAtom(systemServerAtom);
  const { toast } = useToast();

  const [currNpsn, setNpsn] = useState<number | null>(null);
  const [serverUrl, setSU] = useState<string | null>(null);
  const [schoolName, setSN] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSU(null);
    setSN(null);
    setNpsn(null);

    try {
      const response = await ky
        .get(`${env.VITE_TRUTH_TABLE_URL}/api/school/${values.npsn}`)
        .json<{
          data: {
            npsn: number;
            uri: string;
            name: string;
          };
        }>();

      setSU(response.data.uri);
      setSN(response.data.name);
      setNpsn(response.data.npsn);
    } catch (error) {
      if ((error as { name: string }).name === "HTTPError") {
        const errorJson = await (error as unknown as HTTPError).response.json<{
          message: string;
        }>();

        toast({
          duration: 9500,
          variant: "destructive",
          title: "Gagal mengambil data sekolah",
          description: errorJson.message,
        });
      }
    }
  }

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 p-7">
        <h3 className="font-ibm text-4xl text-gray-700 dark:text-gray-300">
          enpitsu
        </h3>

        <div className="sm:w-[85%] md:w-[50%]">
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Masukan NPSN
              </h4>

              <p className="leading-6 [&:not(:first-child)]:mt-6">
                Masukan NPSN instansi pendidikan yang tertera pada kartu ujian
                anda. Proses ini hanya sekali dan bisa diganti jika salah. Cek
                kembali apakah nama instansi sudah sesuai atau belum. Jika
                sudah, silahkan lanjut ke proses input token.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="npsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPSN</FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          <Input
                            type="number"
                            placeholder="202xxxxx"
                            onChange={(el) =>
                              el.target.value.trim().length <= 8 &&
                              field.onChange(
                                el.target.value.toUpperCase().trim(),
                              )
                            }
                            value={field.value}
                            disabled={form.formState.isSubmitting}
                          />

                          <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                          >
                            {form.formState.isSubmitting ? (
                              <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Cek
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Masukan nomor pokok sekolah nasional.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            {currNpsn && serverUrl && schoolName ? (
              <Card className="w-full">
                <CardContent className="p-6">
                  <div className="flex flex-row justify-between">
                    <div>
                      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                        {schoolName}
                      </h4>
                      <p className="leading-7">{currNpsn}</p>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setServerProps({
                            institution: schoolName,
                            npsn: currNpsn as number,
                            serverUrl,
                          });
                        }}
                      >
                        Input token
                        <ChevronsRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="flex translate-y-7 justify-center">
            <ModeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
