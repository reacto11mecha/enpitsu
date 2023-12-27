import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  // AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, ScanLine } from "lucide-react";
import QrScanner from "qr-scanner";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ModeToggle } from "../mode-toggle";

const formSchema = z.object({
  slug: z
    .string()
    .min(1, { message: "Kode soal wajib di isi!" })
    .min(4, { message: "Kode soal minimal memiliki panjang 4 karakter" }),
});

const Scanner = ({ mutate }: { mutate: (slug: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qrScanner = new QrScanner(
      videoRef.current,
      async ({ data: slug }) => {
        if (slug || slug !== "") {
          const result = await formSchema.safeParseAsync({ slug });

          if (!result.success) {
            const error = JSON.parse(result.error.message) as {
              message: string;
            }[];

            setError(error.at(0)!.message);

            return;
          }

          setError(null);

          qrScanner.stop();
          mutate(slug);
        }
      },
      {
        highlightCodeOutline: true,
        highlightScanRegion: true,
      },
    );

    qrScanner.start();

    return () => {
      qrScanner.destroy();
    };
  }, []);

  return (
    <>
      <AlertDialogTitle>Mulai Scan</AlertDialogTitle>
      <AlertDialogDescription>
        Izinkan web ini mengakses untuk mengakses kamera.
      </AlertDialogDescription>

      <video
        className={`h-72 w-full rounded-md border ${
          error ? "border-red-600" : ""
        }`}
        ref={videoRef}
      />

      {error ? (
        <p className="text-center text-sm text-red-600">{error}</p>
      ) : null}
    </>
  );
};

export const ScannerWrapper = ({
  sendMutate,
}: {
  sendMutate: (slug: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  const mutate = useCallback(
    (slug: string) => {
      setOpen(false);

      sendMutate(slug);
    },
    [sendMutate],
  );

  return (
    <AlertDialog open={open} onOpenChange={() => setOpen((prev) => !prev)}>
      <AlertDialogTrigger asChild>
        <Button
          className="mt-1 flex w-full flex-row gap-2 p-10 text-lg"
          variant="outline"
        >
          <ScanLine /> Scan QR Code
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <Scanner mutate={mutate} />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const ScanOrInputQuestionSlug = ({
  closeScanner,
}: {
  closeScanner: () => void;
}) => {
  const { toast } = useToast();

  const getQuestionMutation = api.exam.getQuestion.useMutation({
    onSuccess(result) {
      console.log(result);
    },
    onError(error) {
      toast({
        duration: 9500,
        variant: "destructive",
        description:
          error.message === "Failed to fetch"
            ? "Gagal meraih server"
            : error.message,
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
    },
  });

  const sendMutate = useCallback(
    (slug: string) => {
      form.setValue("slug", slug);

      getQuestionMutation.mutate({ slug });
    },
    [form, getQuestionMutation],
  );

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    getQuestionMutation.mutate(values);

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
                        disabled={getQuestionMutation.isLoading}
                        placeholder="Masukan kode soal"
                        autoComplete="off"
                        autoCorrect="off"
                        {...field}
                      />
                      <Button
                        type="submit"
                        disabled={getQuestionMutation.isLoading}
                      >
                        {getQuestionMutation.isLoading ? (
                          <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
                        ) : null}
                        Kerjakan
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <p className="text-muted-foreground mb-1 mt-5 text-center">atau</p>

        <ScannerWrapper sendMutate={sendMutate} />
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
