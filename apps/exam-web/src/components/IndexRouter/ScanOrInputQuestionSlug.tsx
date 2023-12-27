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
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ScanLine } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ModeToggle } from "../mode-toggle";

// import { api } from "@/utils/api"

const formSchema = z.object({
  slug: z
    .string()
    .min(1, { message: "Kode soal wajib di isi!" })
    .min(4, { message: "Kode soal minimal memiliki panjang 4 karakter" }),
});

export const ScanOrInputQuestionSlug = ({
  closeScanner,
}: {
  closeScanner: () => void;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => console.log(values);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center px-5">
      <div className="w-[85%] md:w-[55%] lg:w-[50%]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode soal</FormLabel>
                  <FormControl>
                    <div className="flex flex-row gap-3">
                      <Input
                        placeholder="Masukan kode soal"
                        autoComplete="off"
                        autoCorrect="off"
                        {...field}
                      />
                      <Button type="submit">Kerjakan</Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <p className="text-muted-foreground mt-5 text-center">atau</p>

        <Button
          className="mt-1 flex w-full flex-row gap-2 p-10 text-lg"
          variant="outline"
        >
          <ScanLine /> Scan QR Code
        </Button>
      </div>

      <div className="flex w-full translate-y-16 justify-around">
        <Button variant="outline" size="icon" onClick={() => closeScanner()}>
          <ArrowLeft />
          <span className="sr-only">Kembali</span>
        </Button>

        <ModeToggle />
      </div>
    </div>
  );
};
