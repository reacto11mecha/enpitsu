"use client";

import { memo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@enpitsu/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@enpitsu/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@enpitsu/ui/form";
import { Separator } from "@enpitsu/ui/separator";
import { Skeleton } from "@enpitsu/ui/skeleton";
import { Switch } from "@enpitsu/ui/switch";
import { Textarea } from "@enpitsu/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  X as NuhUh,
  RefreshCw,
  Trash2,
  Check as YuhUh,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "~/trpc/react";
import { useDebounce } from "./utils";

const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-10 w-full" />,
});

const formSchema = z.object({
  question: z.string().min(1, { message: "Pertanyaan wajib di isi!" }),
  answer: z.string().min(1, { message: "Jawaban harus di isi!" }),
  isStrictEqual: z.boolean(),
});

export const EssayEditor = memo(function EssayEditorConstructor({
  essayIqid,
  questionId,
  questionNo,
  title,
}: {
  essayIqid: number;
  questionId: number;
  questionNo: number;
  title: string;
}) {
  const [dataAlreadyInitialized, setInitialized] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isStrictEqual: false,
    },
  });

  const utils = api.useUtils();

  const specificEssayQuery = api.question.getSpecificEssayQuestion.useQuery(
    { essayIqid },
    {
      refetchOnWindowFocus: false,
    },
  );

  console.log("isPending: ", specificEssayQuery.isPending);
  console.log("dataAlreadyInitialized: ", dataAlreadyInitialized);

  useEffect(() => {
    if (!dataAlreadyInitialized) {
      if (specificEssayQuery.data) {
        if (Object.keys(form.getValues()).length > 0) {
          form.setValue("question", specificEssayQuery.data.question);
          form.setValue("answer", specificEssayQuery.data.answer);
          form.setValue("isStrictEqual", specificEssayQuery.data.isStrictEqual);

          console.log("masuk sini");

          setInitialized(true);
        }
      } else if (specificEssayQuery.error) {
        toast.error(`Gagal mengambil data soal nomor ${questionNo}`, {
          description: "Mohon refresh halaman ini",
        });

        setInitialized(true);
      }
    }
  }, [specificEssayQuery.data, specificEssayQuery.error, form]);

  const specificEssayMutation = api.question.updateSpecificEssay.useMutation({
    async onMutate(updatedChoice) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.question.getSpecificEssayQuestion.cancel({ essayIqid });

      // Get the data from the queryCache
      const prevData = utils.question.getSpecificEssayQuestion.getData({
        essayIqid,
      });

      // Optimistically update the data with our new post
      utils.question.getSpecificEssayQuestion.setData(
        { essayIqid },
        updatedChoice,
      );

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.question.getSpecificEssayQuestion.setData(
        { essayIqid },
        ctx!.prevData,
      );

      toast.error("Gagal memperbarui soal", {
        description: `Terjadi kesalahan, coba lagi nanti. Error: ${err.message}`,
      });
    },
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.question.getSpecificEssayQuestion.invalidate();
    },
  });

  const deleteEssayMutation = api.question.deleteSpecificEssay.useMutation({
    retry: false,
    async onMutate(deletedEssay) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.question.getEssaysIdByQuestionId.cancel({ questionId });

      // Get the data from the queryCache
      const prevData = utils.question.getEssaysIdByQuestionId.getData({
        questionId,
      });

      // Optimistically update the data with our new post
      utils.question.getEssaysIdByQuestionId.setData({ questionId }, (old) =>
        old?.filter((dat) => dat.iqid !== deletedEssay.essayIqid),
      );

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.question.getEssaysIdByQuestionId.setData(
        { questionId },
        ctx!.prevData,
      );

      toast.error("Gagal menghapus soal", {
        description: `Terjadi kesalahan, coba lagi nanti. Error: ${err.message}`,
      });
    },
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.question.getEssaysIdByQuestionId.invalidate({ questionId });
    },
  });

  const triggerUpdate = useDebounce(
    form.handleSubmit((d) =>
      specificEssayMutation.mutate({ ...d, iqid: essayIqid }),
    ),
  );

  useEffect(() => {
    const subscription = form.watch(() => {
      if (
        specificEssayQuery.data &&
        Object.keys(form.getValues()).length === 3
      ) {
        void triggerUpdate();
      }
    });

    return () => subscription.unsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specificEssayQuery.data]);

  return (
    <Form {...form}>
      <Card>
        <CardHeader>
          <CardTitle>Esai Nomor {questionNo}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Soal: {title}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {specificEssayQuery.isPending || !dataAlreadyInitialized ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pertanyaan</FormLabel>
                  <FormControl>
                    <Editor value={field.value} setValue={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {specificEssayQuery.isPending || !dataAlreadyInitialized ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jawaban</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukan jawaban benar disini"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {specificEssayQuery.isPending || !dataAlreadyInitialized ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <FormField
              control={form.control}
              name="isStrictEqual"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Jawaban Wajib Persis Sama
                    </FormLabel>
                    <FormDescription className="lg:w-[65%]">
                      Jika dinyalakan, jawaban yang dikirimkan oleh peserta
                      ujian akan di cocokan dengan jawaban yang wajib persis
                      sama dengan jawaban yang sudah ditentukan.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </CardContent>

        <Separator />

        <CardFooter className="flex flex-row p-5">
          <div className="flex w-full flex-row items-center justify-end">
            {specificEssayMutation.error ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <NuhUh className="h-8 w-8 text-red-600 dark:text-red-500" />
                <small className="font-mono text-muted-foreground text-red-600 dark:text-red-500">
                  Error, perubahan tidak disimpan
                </small>
              </div>
            ) : (
              <>
                {specificEssayMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="animate-spin text-muted-foreground" />
                    <small className="font-mono text-muted-foreground">
                      Menyimpan...
                    </small>
                  </div>
                ) : (
                  <YuhUh className="h-8 w-8 text-green-600 dark:text-green-500" />
                )}
              </>
            )}

            <div className="flex flex-row gap-2">
              <Button
                variant="ghost"
                disabled={
                  specificEssayQuery.isPending ||
                  specificEssayMutation.isPending ||
                  deleteEssayMutation.isPending
                }
                onClick={() =>
                  deleteEssayMutation.mutate({
                    essayIqid,
                  })
                }
              >
                <span className="sr-only">Hapus pertanyaan</span>
                {deleteEssayMutation.isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Trash2 />
                )}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Form>
  );
});
