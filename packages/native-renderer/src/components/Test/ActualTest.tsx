import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCountdown } from "@/hooks/useCountdown";
import { zodResolver } from "@hookform/resolvers/zod";
import katex from "katex";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";

import { ModeToggle } from "../mode-toggle";
import {
  AnsweredQuestionsList,
  DishonestyCountAlert,
  GoToHome,
} from "./AllAlert";
import { formSchema, shuffleArray } from "./utils";
import type { Props, TFormSchema } from "./utils";

import "katex/dist/katex.min.css";
import "react-quill/dist/quill.snow.css";

window.katex = katex;

export const CountdownIsolation = memo(function Countdown({
  endedAt,
}: {
  endedAt: Date;
}) {
  const { countdown, isEnded } = useCountdown(endedAt);

  useEffect(() => {
    if (isEnded) {
      if (window.isNativeApp && "ReactNativeWebView" in window)
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ key: "CLIENT:TIMES_UP" }),
        );
    }
  }, [isEnded]);

  return (
    <Button variant="outline" className="font-space">
      {countdown}
    </Button>
  );
});

const Test = ({ data, initialData, studentToken }: Props) => {
  const [checkIn] = useState(initialData.checkIn ?? new Date());

  const [dishonestyCount] = useState(initialData.dishonestCount ?? 0);

  const [isSubmitting, setSubmitting] = useState(false);
  const [answeredDrawerOpen, setDrawerOpen] = useState(false);

  const defaultFormValues = useMemo(
    () => ({
      multipleChoices: shuffleArray(
        data.multipleChoices.map((d) => {
          const savedAnswer = initialData.multipleChoices.find(
            (choice) => choice.iqid === d.iqid,
          );

          return {
            ...d,
            options: shuffleArray(d.options),
            choosedAnswer: savedAnswer?.choosedAnswer ?? 0,
          };
        }),
      ),

      essays: shuffleArray(
        data.essays.map((d) => {
          const savedAnswer = initialData.essays.find(
            (choice) => choice.iqid === d.iqid,
          );

          return {
            ...d,
            answer: savedAnswer?.answer ?? "",
          };
        }),
      ),
    }),
    [data.essays, data.multipleChoices, initialData],
  );

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const multipleChoicesField = useFieldArray({
    control: form.control,
    name: "multipleChoices",
  });

  const essaysField = useFieldArray({
    control: form.control,
    name: "essays",
  });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (window.isNativeApp && "ReactNativeWebView" in window)
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            key: "CLIENT:SUBMIT",
            value: {
              multipleChoices: values.multipleChoices.map((choice) => ({
                iqid: choice.iqid,
                choosedAnswer: choice.choosedAnswer,
              })),
              essays: values.essays.map((essay) => ({
                iqid: essay.iqid,
                answer: essay.answer,
              })),
              questionId: data.id,
              checkIn,
              submittedAt: new Date(),
            },
          }),
        );
    },
    [data, checkIn],
  );

  useEffect(() => {
    window.updateIsSubmitting = (submitting: boolean) =>
      setSubmitting(submitting);
  }, []);

  return (
    <>
      <header className="no-copy fixed inset-x-0 top-0 z-50 flex w-full justify-center border-solid">
        <div className="flex h-full w-full flex-wrap items-center justify-center gap-2 border border-b bg-white p-2 px-5 dark:bg-stone-900 sm:gap-4">
          <GoToHome />

          <DishonestyCountAlert dishonestyCount={dishonestyCount} />

          <CountdownIsolation endedAt={data.endedAt} />

          <AnsweredQuestionsList
            open={answeredDrawerOpen}
            toggleDrawer={setDrawerOpen}
            multipleChoices={multipleChoicesField.fields}
            essays={essaysField.fields}
          />

          <ModeToggle size="default" />
        </div>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, () => setDrawerOpen(true))}
          className="no-copy flex justify-center px-4 pb-16 pt-20"
        >
          <div className="flex w-full max-w-lg flex-col gap-8">
            <Card>
              <div className="h-3 rounded-t-lg rounded-tr-lg bg-blue-700 dark:bg-blue-800" />
              <CardHeader>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  {data.title}
                </h4>
              </CardHeader>
              <Separator />
              <CardContent className="p-6">
                <ul>
                  <li>
                    Kode Soal : <span className="font-space">{data.slug}</span>
                  </li>
                  <li>
                    Token Peserta :{" "}
                    <span className="font-space">{studentToken}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {multipleChoicesField.fields.length >= 1 ? (
              <div className="flex flex-col gap-4">
                <Card>
                  <CardHeader className="rounded-t-lg rounded-tr-lg bg-blue-700 dark:bg-blue-800">
                    <h4 className="scroll-m-20 text-xl font-semibold uppercase tracking-tight text-blue-50">
                      Soal Pilihan Ganda
                    </h4>
                  </CardHeader>
                  <Separator />
                  <CardContent className="p-6">
                    <p className="font-semibold leading-7 [&:not(:first-child)]:mt-6">
                      Pilih salah satu jawaban yang paling benar di antara lima
                      (5) opsi yang ada!
                    </p>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-5">
                  {multipleChoicesField.fields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="w-full"
                      id={`choice-${field.iqid}`}
                    >
                      <CardHeader>
                        <h3
                          className="no-copy actual-question scroll-m-20 text-lg tracking-tight"
                          dangerouslySetInnerHTML={{ __html: field.question }}
                        />
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name={
                            `multipleChoices.${index}.choosedAnswer` as const
                          }
                          render={({ field: currentField }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <RadioGroup
                                  className="space-y-2"
                                  value={String(currentField.value)}
                                  onValueChange={(val) => {
                                    currentField.onChange(parseInt(val));

                                    if (
                                      window.isNativeApp &&
                                      "ReactNativeWebView" in window
                                    ) {
                                      window.ReactNativeWebView.postMessage(
                                        JSON.stringify({
                                          key: "CLIENT:UPDATE_ESSAY",
                                          value: {
                                            iqid: field.iqid,
                                            choosedAnswer: parseInt(val),
                                          },
                                        }),
                                      );
                                    }
                                  }}
                                  disabled={isSubmitting}
                                >
                                  {field.options.map((option, idx) => (
                                    <div
                                      className="flex items-center space-x-2"
                                      key={`options.${field.iqid}.opt.${idx}`}
                                    >
                                      <RadioGroupItem
                                        value={String(option.order)}
                                        id={`options.${field.iqid}.opt.${idx}`}
                                        disabled={isSubmitting}
                                      />
                                      <Label
                                        htmlFor={`options.${field.iqid}.opt.${idx}`}
                                        className="no-copy w-full text-base font-normal"
                                        dangerouslySetInnerHTML={{
                                          __html: option.answer,
                                        }}
                                      />
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}

            {essaysField.fields.length >= 1 ? (
              <div className="flex flex-col gap-3">
                <Card>
                  <CardHeader className="rounded-t-lg rounded-tr-lg bg-blue-700 dark:bg-blue-800">
                    <h4 className="scroll-m-20 text-xl font-semibold uppercase tracking-tight text-blue-50">
                      Soal Esai
                    </h4>
                  </CardHeader>
                  <Separator />
                  <CardContent className="p-6">
                    <p className="font-semibold leading-7 [&:not(:first-child)]:mt-6">
                      Isi jawaban esai dengan jawaban paling benar!
                    </p>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-5">
                  {essaysField.fields.map((field, index) => (
                    <Card key={field.iqid} id={`essay-${field.iqid}`}>
                      <CardHeader>
                        <h3
                          className="no-copy actual-question scroll-m-20 text-base tracking-tight"
                          dangerouslySetInnerHTML={{ __html: field.question }}
                        />
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name={`essays.${index}.answer` as const}
                          render={({ field: currentField }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Jawab disini"
                                  value={currentField.value}
                                  onPaste={(e) => e.preventDefault()}
                                  onChange={(e) => {
                                    currentField.onChange(e.target.value);

                                    if (
                                      window.isNativeApp &&
                                      "ReactNativeWebView" in window
                                    ) {
                                      window.ReactNativeWebView.postMessage(
                                        JSON.stringify({
                                          key: "CLIENT:UPDATE_ESSAY",
                                          value: {
                                            iqid: field.iqid,
                                            answer: e.target.value,
                                          },
                                        }),
                                      );
                                    }
                                  }}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="ghost"
                className="uppercase"
                disabled={isSubmitting}
              >
                Submit
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export const ActualTest = memo(
  Test,

  // This is intended, theoritically we just retrieve data just once,
  // after the user refresh on react native side, it will recreate
  // new instance of this browser
  () => false,
);
