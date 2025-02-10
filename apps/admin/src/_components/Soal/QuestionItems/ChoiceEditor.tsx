"use client";

import { memo, useEffect, useRef } from "react";
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
import { Checkbox } from "@enpitsu/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@enpitsu/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@enpitsu/ui/popover";
import { RadioGroup, RadioGroupItem } from "@enpitsu/ui/radio-group";
import { Separator } from "@enpitsu/ui/separator";
import { Skeleton } from "@enpitsu/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClipboardCheck,
  Loader2,
  X as NuhUh,
  RefreshCw,
  Trash2,
  Check as YuhUh,
} from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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
  options: z
    .array(
      z.object({
        order: z.number().min(1).max(5),
        answer: z.string().min(1, { message: "Opsi jawaban wajib di isi!" }),
      }),
    )
    .min(4)
    .max(5),

  correctAnswerOrder: z.number(),
});

export const ChoiceEditor = memo(function ChoiceEditorConstructor({
  choiceIqid,
  questionId,
  questionNo,
  title,
}: {
  choiceIqid: number;
  questionId: number;
  questionNo: number;
  title: string;
}) {
  const dataAlreadyInitialized = useRef(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const optionsField = useFieldArray({
    control: form.control,
    name: "options",
  });

  const utils = api.useUtils();

  const specificChoiceQuery = api.question.getSpecificChoiceQuestion.useQuery(
    { choiceIqid },
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (!dataAlreadyInitialized.current) {
      if (specificChoiceQuery.data) {
        if (Object.keys(form.getValues()).length >= 1) {
          form.setValue("question", specificChoiceQuery.data.question);

          specificChoiceQuery.data.options.forEach((d, idx) =>
            optionsField.update(idx, d),
          );

          form.setValue(
            "correctAnswerOrder",
            specificChoiceQuery.data.correctAnswerOrder,
          );

          dataAlreadyInitialized.current = true;
        }
      } else if (specificChoiceQuery.error) {
        toast.error(`Gagal mengambil data soal nomor ${questionNo}`, {
          description: "Mohon refresh halaman ini",
        });

        dataAlreadyInitialized.current = true;
      }
    }
  }, [
    specificChoiceQuery.data,
    specificChoiceQuery.error,
    form,
    optionsField.update,
  ]);

  const specificChoiceMutation = api.question.updateSpecificChoice.useMutation({
    async onMutate(updatedChoice) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.question.getSpecificChoiceQuestion.cancel({ choiceIqid });

      // Get the data from the queryCache
      const prevData = utils.question.getSpecificChoiceQuestion.getData({
        choiceIqid,
      });

      // Optimistically update the data with our new post
      utils.question.getSpecificChoiceQuestion.setData(
        { choiceIqid },
        updatedChoice,
      );

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.question.getSpecificChoiceQuestion.setData(
        { choiceIqid },
        ctx!.prevData,
      );

      toast.error("Gagal memperbarui soal", {
        description: `Terjadi kesalahan, coba lagi nanti. Error: ${err.message}`,
      });
    },
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.question.getSpecificChoiceQuestion.invalidate();
      await utils.question.getEligibleStatusFromQuestion.invalidate();
    },
  });

  const deleteChoiceMutation = api.question.deleteSpecificChoice.useMutation({
    retry: false,
    async onMutate(deletedChoice) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.question.getChoicesIdByQuestionId.cancel({ questionId });

      // Get the data from the queryCache
      const prevData = utils.question.getChoicesIdByQuestionId.getData({
        questionId,
      });

      // Optimistically update the data with our new post
      utils.question.getChoicesIdByQuestionId.setData({ questionId }, (old) =>
        old?.filter((dat) => dat.iqid !== deletedChoice.id),
      );

      // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    onError(err, newPost, ctx) {
      // If the mutation fails, use the context-value from onMutate
      utils.question.getChoicesIdByQuestionId.setData(
        { questionId },
        ctx?.prevData,
      );

      toast.error("Gagal menghapus soal", {
        description: `Terjadi kesalahan, coba lagi nanti. Error: ${err.message}`,
      });
    },
    async onSettled() {
      // Sync with server once mutation has settled
      await utils.question.getChoicesIdByQuestionId.invalidate({ questionId });
      await utils.question.getEligibleStatusFromQuestion.invalidate();
    },
  });

  const triggerUpdate = useDebounce(
    form.handleSubmit((d) =>
      specificChoiceMutation.mutate({ ...d, iqid: choiceIqid }),
    ),
  );

  useEffect(() => {
    const subscription = form.watch(() => {
      if (
        specificChoiceQuery.data &&
        Object.keys(form.getValues()).length === 3
      ) {
        void triggerUpdate();
      }
    });

    return () => subscription.unsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specificChoiceQuery.data]);

  return (
    <Form {...form}>
      <Card id={`choice-iqid-${choiceIqid}`}>
        <CardHeader>
          <CardTitle>Soal Nomor {questionNo}</CardTitle>
          <CardDescription className="text-muted-foreground">
            Soal: {title}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {specificChoiceQuery.isPending || !dataAlreadyInitialized.current ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <FormField
              control={form.control}
              name={"question"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pertanyaan</FormLabel>
                  <FormControl>
                    <Editor
                      needAudioInput
                      value={field.value}
                      setValue={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {specificChoiceQuery.isPending || !dataAlreadyInitialized.current ? (
            <div className="space-y-5">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="options"
              render={() => (
                <FormItem>
                  <FormLabel>Opsi Jawaban</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-3">
                      {optionsField.fields.map((option, optIndex) => (
                        <FormField
                          key={`options.${option.order}.${optIndex}`}
                          control={form.control}
                          name={`options.${optIndex}.answer` as const}
                          render={({ field: currentField }) => (
                            <FormItem>
                              <FormControl>
                                <div
                                  className="flex flex-row items-center gap-3"
                                  onPaste={(e) => {
                                    if (
                                      form
                                        .getValues("options")
                                        .every(
                                          (field) =>
                                            field.answer === "" ||
                                            field.answer === "<p><br></p>",
                                        )
                                    ) {
                                      e.preventDefault();

                                      const textArray = e.clipboardData
                                        .getData("text")
                                        .trim()
                                        .split(/\r?\n/)
                                        .filter((t) => t !== "")
                                        .map((text) =>
                                          text
                                            .trim()
                                            .replace(/^[a-eA-E]\.\s/, "")
                                            .trim(),
                                        );

                                      optionsField.fields.forEach((_, idx) =>
                                        form.setValue(
                                          `options.${idx}.answer` as const,
                                          textArray.at(idx) ?? "",
                                        ),
                                      );
                                    }
                                  }}
                                >
                                  <Checkbox disabled className="rounded-full" />

                                  <Editor
                                    value={currentField.value}
                                    setValue={currentField.onChange}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </CardContent>

        <Separator />

        <CardFooter className="flex flex-row p-5">
          <div className="flex w-full flex-row justify-between">
            <div className="flex flex-row items-center gap-5">
              {dataAlreadyInitialized.current ? (
                <Popover>
                  <PopoverTrigger className="flex flex-row items-center gap-2 text-sky-600 dark:text-sky-500">
                    <ClipboardCheck />
                    Kunci jawaban
                  </PopoverTrigger>
                  <PopoverContent className="space-y-4">
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                      Pilih jawaban benar
                    </h4>

                    <FormField
                      control={form.control}
                      name={"correctAnswerOrder"}
                      render={({ field: currentField }) => (
                        <FormItem className="space-y-5">
                          <FormControl>
                            <RadioGroup
                              onValueChange={(val) =>
                                currentField.onChange(parseInt(val))
                              }
                              defaultValue={String(currentField.value)}
                              className="flex flex-col space-y-1"
                            >
                              {form.getValues("options").map((option) => (
                                <FormItem
                                  key={`answer.${option.order}`}
                                  className="flex items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <RadioGroupItem
                                      value={String(option.order)}
                                    />
                                  </FormControl>
                                  <FormLabel
                                    className="font-base font-normal"
                                    dangerouslySetInnerHTML={{
                                      __html: option.answer,
                                    }}
                                  />
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                false
              )}

              {form.getValues("correctAnswerOrder") < 1 ? (
                <NuhUh className="h-8 w-8 text-red-600 dark:text-red-500" />
              ) : (
                <YuhUh className="h-8 w-8 text-green-600 dark:text-green-500" />
              )}
            </div>

            <div className="flex flex-row items-center gap-2">
              {specificChoiceMutation.error ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <NuhUh className="h-8 w-8 text-red-600 dark:text-red-500" />
                  <small className="font-mono text-muted-foreground text-red-600 dark:text-red-500">
                    Error, perubahan tidak disimpan
                  </small>
                </div>
              ) : (
                <>
                  {specificChoiceMutation.isPending ? (
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

              <Button
                variant="ghost"
                disabled={
                  specificChoiceQuery.isPending ||
                  specificChoiceMutation.isPending ||
                  deleteChoiceMutation.isPending
                }
                onClick={() =>
                  deleteChoiceMutation.mutate({
                    id: choiceIqid,
                  })
                }
              >
                <span className="sr-only">Hapus pertanyaan</span>
                {deleteChoiceMutation.isPending ? (
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
