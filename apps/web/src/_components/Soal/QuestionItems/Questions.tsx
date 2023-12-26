"use client";

import { useEffect } from "react";
import { Roboto } from "next/font/google";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClipboardCheck,
  Loader2,
  X as NuhUh,
  PlusCircle,
  RefreshCw,
  Trash2,
  Check as YuhUh,
} from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { api } from "~/utils/api";
import { NewLoadingQuestion } from "./NewLoadingQuestion";
import {
  findEssayUpdate,
  findMultipleChoiceUpdate,
  useDebounce,
} from "./utils";
import type { Props } from "./utils";

const robotoFont = Roboto({
  weight: "400",
  subsets: ["latin"],
});

const formSchema = z.object({
  multipleChoice: z
    .array(
      z.object({
        iqid: z.number(),
        question: z.string().min(1, { message: "Pertanyaan wajib di isi!" }),
        options: z
          .array(
            z.object({
              order: z.number().min(1).max(5),
              answer: z
                .string()
                .min(1, { message: "Opsi jawaban wajib di isi!" }),
            }),
          )
          .min(5)
          .max(5),

        correctAnswerOrder: z.number(),
      }),
    )
    .min(1),

  essay: z.array(
    z.object({
      iqid: z.number(),
      question: z.string().min(1, { message: "Pertanyaan wajib di isi!" }),
      answer: z.string().min(1, { message: "Jawaban harus di isi!" }),
    }),
  ),
});

export const Questions = ({ question }: Props) => {
  const apiUtils = api.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      multipleChoice: question.multipleChoices,
      essay: question.essays,
    },
    mode: "onChange",
  });

  const mutlipleChoiceField = useFieldArray({
    control: form.control,
    name: "multipleChoice",
  });

  const essayField = useFieldArray({
    control: form.control,
    name: "essay",
  });

  const multipleChoice = useWatch({
    control: form.control,
    name: "multipleChoice",
  });

  const multipleChoicesQuery = api.question.getMultipleChoices.useQuery(
    {
      questionId: question.id,
    },
    {
      initialData: question.multipleChoices,
      refetchOnWindowFocus: false,
    },
  );
  const essaysQuery = api.question.getEssays.useQuery(
    {
      questionId: question.id,
    },
    {
      initialData: question.essays,
      refetchOnWindowFocus: false,
    },
  );

  const createNewChoiceMutation = api.question.createChoice.useMutation({
    async onSuccess(result) {
      await apiUtils.question.getMultipleChoices.invalidate();

      mutlipleChoiceField.append(
        result.map(({ questionId: _, ...rest }) => rest).at(0)!,
      );
    },
  });
  const updateChoiceMutation = api.question.updateChoice.useMutation({
    retry: false,
    async onSuccess() {
      await apiUtils.question.getMultipleChoices.invalidate();
    },
  });
  const deleteChoiceMutation = api.question.deleteChoice.useMutation({
    async onSuccess(result) {
      await apiUtils.question.getMultipleChoices.invalidate();

      const resIqid = result.at(0);

      // Prevent deleting all field
      if (resIqid)
        mutlipleChoiceField.remove(
          mutlipleChoiceField.fields.findIndex(
            (field) => field.iqid === resIqid.iqid,
          ),
        );
    },
  });

  const createNewEssayMutation = api.question.createEssay.useMutation({
    async onSuccess(result) {
      await apiUtils.question.getEssays.invalidate();

      essayField.append(
        result.map(({ questionId: _, ...rest }) => rest).at(0)!,
      );
    },
  });
  const updateEssayMutation = api.question.updateEssay.useMutation({
    retry: false,
    async onSuccess() {
      await apiUtils.question.getEssays.invalidate();
    },
  });
  const deleteEssayMutation = api.question.deleteEssay.useMutation({
    async onSuccess(result) {
      await apiUtils.question.getEssays.invalidate();

      const resIqid = result.at(0);

      // Prevent deleting all field
      if (resIqid)
        essayField.remove(
          essayField.fields.findIndex((field) => field.iqid === resIqid.iqid),
        );
    },
  });

  const multipleChouceDebounced = useDebounce((data: typeof multipleChoice) => {
    const updatedData = findMultipleChoiceUpdate(
      multipleChoicesQuery.data,
      data,
    );

    if (updatedData) {
      updateChoiceMutation.mutate(updatedData);
    }
  });

  useEffect(() => {
    multipleChouceDebounced(multipleChoice);
  }, [multipleChoice, multipleChouceDebounced]);

  const essay = useWatch({
    control: form.control,
    name: "essay",
  });

  const essayDebounced = useDebounce((data: typeof essay) => {
    const updatedData = findEssayUpdate(essaysQuery.data, data);

    if (updatedData) {
      updateEssayMutation.mutate(updatedData);
    }
  });

  useEffect(() => {
    essayDebounced(essay);
  }, [essay, essayDebounced]);

  return (
    <>
      <Tabs defaultValue="edit" className="w-full">
        <TabsList>
          <TabsTrigger value="edit">Edit Soal</TabsTrigger>
          <TabsTrigger value="preview">Pratinjau Soal</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <div className="mt-5 flex flex-col gap-8 pb-16">
            <Form {...form}>
              <div className="flex flex-col gap-4">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  Pilihan Ganda
                </h3>

                <div className="flex flex-col gap-5">
                  {mutlipleChoiceField.fields.map((field, index) => (
                    <Card key={field.iqid}>
                      <CardHeader>
                        <CardTitle>Soal Nomor {index + 1}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Soal: {question.title}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-col gap-5">
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`multipleChoice.${index}.question` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pertanyaan</FormLabel>
                              <FormControl>
                                <Textarea
                                  className="text-base font-normal"
                                  placeholder="Masukan pertanyaan soal disini"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="multipleChoice"
                          render={() => (
                            <FormItem>
                              <FormLabel>Opsi Jawaban</FormLabel>
                              <FormControl>
                                <div className="flex flex-col gap-3">
                                  {field.options.map((option, optIndex) => (
                                    <FormField
                                      key={`options.${field.iqid}.${option.order}.${optIndex}`}
                                      control={form.control}
                                      name={
                                        `multipleChoice.${index}.options.${optIndex}.answer` as const
                                      }
                                      render={({ field: currentField }) => (
                                        <FormItem>
                                          <FormControl>
                                            <div className="flex flex-row items-center gap-3">
                                              <Checkbox
                                                disabled
                                                className="rounded-full"
                                              />

                                              <Textarea
                                                className="text-base font-normal"
                                                placeholder="Masukan jawaban disini"
                                                {...currentField}
                                                onPaste={(e) => {
                                                  if (
                                                    currentField.value === "" &&
                                                    optIndex === 0
                                                  ) {
                                                    e.preventDefault();

                                                    const textArray =
                                                      e.clipboardData
                                                        .getData("text")
                                                        .trim()
                                                        .split(/\r?\n/)
                                                        .filter(
                                                          (t) => t !== "",
                                                        );

                                                    field.options.forEach(
                                                      (_, idx) =>
                                                        form.setValue(
                                                          `multipleChoice.${index}.options.${idx}.answer` as const,
                                                          textArray.at(idx) ??
                                                            "",
                                                        ),
                                                    );
                                                  }
                                                }}
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
                      </CardContent>

                      <Separator />

                      <CardFooter className="flex flex-row p-5">
                        <div className="flex w-full flex-row justify-between">
                          <div className="flex flex-row items-center gap-5">
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
                                  name={
                                    `multipleChoice.${index}.correctAnswerOrder` as const
                                  }
                                  render={({ field: currentField }) => (
                                    <FormItem className="space-y-3">
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={(val) =>
                                            currentField.onChange(parseInt(val))
                                          }
                                          defaultValue={String(
                                            currentField.value,
                                          )}
                                          className="flex flex-col space-y-1"
                                        >
                                          {field.options.map((option) => (
                                            <FormItem
                                              key={`answer.${field.iqid}.${option.order}`}
                                              className="flex items-center space-x-3 space-y-0"
                                            >
                                              <FormControl>
                                                <RadioGroupItem
                                                  value={String(option.order)}
                                                />
                                              </FormControl>
                                              <FormLabel className="font-base font-normal">
                                                {option.answer}
                                              </FormLabel>
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

                            {field.correctAnswerOrder < 1 ? (
                              <NuhUh className="h-8 w-8 text-red-600 dark:text-red-500" />
                            ) : (
                              <YuhUh className="h-8 w-8 text-green-600 dark:text-green-500" />
                            )}
                          </div>

                          <div className="flex flex-row gap-2">
                            <Button
                              variant="ghost"
                              disabled={
                                deleteChoiceMutation.variables?.id ===
                                  field.iqid && deleteChoiceMutation.isLoading
                              }
                              onClick={() =>
                                deleteChoiceMutation.mutate({
                                  id: field.iqid,
                                })
                              }
                            >
                              <span className="sr-only">Hapus pertanyaan</span>
                              {deleteChoiceMutation.isLoading ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <Trash2 />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}

                  {createNewChoiceMutation.isLoading && <NewLoadingQuestion />}

                  {multipleChoicesQuery.isLoading ? (
                    <Button
                      className="h-full w-full p-5"
                      variant="outline"
                      disabled
                    >
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-full w-full p-5"
                      onClick={() =>
                        createNewChoiceMutation.mutate({
                          questionId: question.id,
                        })
                      }
                    >
                      <PlusCircle className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  Esai
                </h3>

                <div className="flex flex-col gap-5">
                  {essayField.fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader>
                        <CardTitle>Esai Nomor {index + 1}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Soal: {question.title}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-col gap-5">
                        <FormField
                          key={field.iqid}
                          control={form.control}
                          name={`essay.${index}.question` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pertanyaan</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Masukan pertanyaan soal disini"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`essay.${index}.answer` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jawaban</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Masukan jawaban soal disini"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>

                      <Separator />

                      <CardFooter className="flex flex-row p-5">
                        <div className="flex w-full flex-row justify-end">
                          <div className="flex flex-row gap-2">
                            <Button
                              variant="ghost"
                              disabled={deleteEssayMutation.isLoading}
                              onClick={() =>
                                deleteEssayMutation.mutate({
                                  id: field.iqid,
                                })
                              }
                            >
                              <span className="sr-only">Hapus pertanyaan</span>
                              {deleteEssayMutation.isLoading ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <Trash2 />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}

                  {createNewEssayMutation.isLoading && <NewLoadingQuestion />}

                  {essaysQuery.isLoading ? (
                    <Button
                      variant="outline"
                      disabled
                      className="h-full w-full p-5"
                    >
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-full w-full p-5"
                      onClick={() =>
                        createNewEssayMutation.mutate({
                          questionId: question.id,
                        })
                      }
                    >
                      <PlusCircle className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          </div>
        </TabsContent>
        <TabsContent value="preview">
          <div
            className={`mt-5 flex flex-col gap-8 pb-16 ${robotoFont.className}`}
          >
            <div className="flex flex-col gap-4">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Pilihan Ganda
              </h3>

              <div className="flex flex-col gap-5">
                {multipleChoicesQuery.data?.map((choice) => (
                  <Card key={choice.iqid}>
                    <CardHeader>
                      <h3 className="scroll-m-20 text-base tracking-tight">
                        {choice.question}
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup className="space-y-2">
                        {choice.options.map((option, idx) => (
                          <div
                            className="flex items-center space-x-2"
                            key={`preview.${choice.iqid}.opt.${idx}`}
                          >
                            <RadioGroupItem
                              value={String(option.order)}
                              id={`preview.${choice.iqid}.opt.${idx}`}
                            />
                            <Label
                              htmlFor={`preview.${choice.iqid}.opt.${idx}`}
                              className="text-base "
                            >
                              {option.answer}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Esai
              </h3>

              <div className="flex flex-col gap-5">
                {essaysQuery.data?.map((essay) => (
                  <Card key={essay.iqid}>
                    <CardHeader>
                      <h3 className="scroll-m-20 text-base tracking-tight">
                        {essay.question}
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <Textarea placeholder="jawab disini" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <footer className="fixed inset-x-0 bottom-0 flex w-full justify-center border-solid">
        <div className="flex h-full w-full flex-wrap items-center justify-between rounded-t-3xl border bg-white p-4 dark:bg-neutral-800 md:w-[85%]">
          <div className="flex flex-row items-center gap-3">
            <p>Pilihan Ganda :</p>

            {updateChoiceMutation.error ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <NuhUh className="h-8 w-8 text-red-600 dark:text-red-500" />
                <small className="text-muted-foreground font-mono text-red-600 dark:text-red-500">
                  Error.
                </small>
              </div>
            ) : (
              <>
                {updateChoiceMutation.isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="text-muted-foreground animate-spin" />
                    <small className="text-muted-foreground font-mono">
                      Menyimpan...
                    </small>
                  </div>
                ) : (
                  <YuhUh className="h-8 w-8 text-green-600 dark:text-green-500" />
                )}
              </>
            )}
          </div>

          <div className="flex flex-row items-center gap-3">
            <p>Esai :</p>

            {updateEssayMutation.error ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <NuhUh className="h-8 w-8 text-red-600 dark:text-red-500" />
                <small className="text-muted-foreground font-mono text-red-600 dark:text-red-500">
                  Error.
                </small>
              </div>
            ) : (
              <>
                {updateEssayMutation.isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="text-muted-foreground animate-spin" />
                    <small className="text-muted-foreground font-mono">
                      Menyimpan...
                    </small>
                  </div>
                ) : (
                  <YuhUh className="h-8 w-8 text-green-600 dark:text-green-500" />
                )}
              </>
            )}
          </div>
        </div>
      </footer>
    </>
  );
};
