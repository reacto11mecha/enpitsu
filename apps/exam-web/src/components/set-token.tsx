import { studentTokenAtom } from "@/lib/atom";
import { validateId } from "@enpitsu/token-generator";
import { Button } from "@enpitsu/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@enpitsu/ui/form";
import { Input } from "@enpitsu/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { ModeToggle } from "./mode-toggle";

const formSchema = z.object({
  token: z
    .string()
    .min(1, {
      message: "Token wajib di isi!",
    })
    .min(6, { message: "Panjang token wajib 6 karakter!" })
    .max(6, { message: "Panjang token tidak boleh dari 6 karakter!" })
    .refine(validateId, { message: "Format token tidak sesuai!" }),
});

const NonInitVer = () => {
  const navigate = useNavigate();

  const [token, setToken] = useAtom(studentTokenAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setToken(values.token);

    navigate("/");
  };

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 p-7">
        <h3 className="font-ibm text-3xl text-gray-700 dark:text-gray-300">
          enpitsu
        </h3>

        <div className="sm:w-[85%] md:w-[50%]">
          <div className="flex flex-col gap-5">
            <div className="space-y-1">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Pengaturan
              </h4>

              <p className="leading-6 [&:not(:first-child)]:mt-6">
                Atur token dan mode aplikasi ulangan pada halaman ini. Tap
                tombol kembali jika dianggap semua pengaturan aman.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token</FormLabel>
                      <FormControl>
                        <Input
                          className="font-space"
                          placeholder="AZ-XXX"
                          onChange={(el) =>
                            el.target.value.trim().length <= 6 &&
                            field.onChange(el.target.value.toUpperCase().trim())
                          }
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        Token yang tertera pada kartu ujian.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Simpan
                </Button>
              </form>
            </Form>
          </div>

          <div className="flex translate-y-16 justify-around">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft />
              <span className="sr-only">Kembali</span>
            </Button>

            <ModeToggle />
          </div>
        </div>
      </div>
    </>
  );
};

const InitVersion = () => {
  const [token, setToken] = useAtom(studentTokenAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    setToken(values.token);

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 p-7">
        <h3 className="font-ibm text-3xl text-gray-700 dark:text-gray-300">
          enpitsu
        </h3>

        <div className="sm:w-[85%] md:w-[50%]">
          <div className="flex flex-col gap-5">
            <div className="space-y-1">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Masukan Token
              </h4>

              <p className="leading-6 [&:not(:first-child)]:mt-6">
                Masukan token yang tertera pada kartu ujian pada kolom input
                dibawah ini. Proses ini hanya di awal saja, namun bisa diganti
                kapan saja di halaman pengaturan.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token</FormLabel>
                      <FormControl>
                        <Input
                          className="font-space"
                          placeholder="AZ-XXX"
                          onChange={(el) =>
                            el.target.value.trim().length <= 6 &&
                            field.onChange(el.target.value.toUpperCase().trim())
                          }
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        Token yang tertera pada kartu ujian.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Simpan
                </Button>
              </form>
            </Form>
          </div>

          <div className="flex translate-y-16 justify-center">
            <ModeToggle />
          </div>
        </div>
      </div>
    </>
  );
};

export default function SetToken({ init }: { init?: boolean }) {
  if (init) return <InitVersion />;

  return <NonInitVer />;
}
