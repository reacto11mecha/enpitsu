import { useCallback, useState } from "react";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ModeToggle } from "../mode-toggle";
import { Precaution } from "./Precaution";
import { ScannerWrapper } from "./Scanner";
import { formSchema } from "./schema";

export const ScanOrInputQuestionSlug = ({
  closeScanner,
}: {
  closeScanner: () => void;
}) => {
  const { toast } = useToast();
  const [isPrecautionOpen, setOpen] = useState(false);

  const getQuestionMutation = api.exam.getQuestion.useMutation({
    onSuccess() {
      setOpen(true);
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

  const closePrecaution = useCallback(() => setOpen(false), []);

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

      <Precaution
        open={isPrecautionOpen}
        close={closePrecaution}
        data={getQuestionMutation.data}
      />
    </div>
  );
};
