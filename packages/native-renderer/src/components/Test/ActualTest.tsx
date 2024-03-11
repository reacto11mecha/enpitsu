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
import { useToast } from "@/components/ui/use-toast";
import { useCountdown } from "@/hooks/useCountdown";
import { useNetworkState } from "@/hooks/useNetworkState";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { studentAnswerAtom, studentTokenAtom } from "@/lib/atom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue, useSetAtom } from "jotai";
import katex from "katex";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useDebounceCallback } from "usehooks-ts";
import { z } from "zod";

import { ModeToggle } from "../mode-toggle";
import {
  AnsweredQuestionsList,
  BadInternetAlert,
  DishonestyAlert,
  DishonestyCountAlert,
  GoToHome,
  ScreenWakeLockFail,
} from "./AllAlert";
import {
  formSchema,
  shuffleArray,
  type Props,
  type TFormSchema,
} from "./utils";

import "katex/dist/katex.min.css";
import "react-quill/dist/quill.snow.css";

window.katex = katex;

export const CountdownIsolation = memo(function Countdown({
  endedAt,
  theEndHasCome,
}: {
  endedAt: Date;
  theEndHasCome: () => void;
}) {
  const { countdown, isEnded } = useCountdown(endedAt);

  useEffect(() => {
    if (isEnded) theEndHasCome();
  }, [isEnded, theEndHasCome]);

  return (
    <Button variant="outline" className="font-space">
      {countdown}
    </Button>
  );
});

const Test = ({ data, initialData, studentToken }: Props) => {
  const [checkIn] = useState(
    // initialData.find((d) => d.slug === data.slug)?.checkIn
    //   ? new Date(
    //       initialData.find((d) => d.slug === data.slug)!
    //         .checkIn as unknown as string,
    //     )
    //   : new Date(),
    new Date(),
  );
  const [isEnded, setEnded] = useState(false);

  const { toast } = useToast();

  const setStudentAnswers = useSetAtom(studentAnswerAtom);

  const [dishonestyCount, setDishonestyCount] = useState(
    // initialData.find((d) => d.slug === data.slug)?.dishonestCount ?? 0,
    0,
  );

  // Toggle this initial state value for prod and dev
  const [canUpdateDishonesty, setCanUpdateDishonesty] = useState(false);

  const [dishonestyWarning, setDishonestyWarning] = useState(false);
  const [answeredDrawerOpen, setDrawerOpen] = useState(false);

  const closeAlertCallback = useCallback(() => {
    setCanUpdateDishonesty(true);
    setDishonestyWarning(false);
  }, []);
  const theEndHasCome = useCallback(() => setEnded(true), []);

  const defaultFormValues = useMemo(
    () => ({
      multipleChoices: shuffleArray(
        data.multipleChoices.map((d) => {
          const savedAnswer = initialData.find((d) => d.slug === data.slug);

          return {
            ...d,
            options: shuffleArray(d.options),
            choosedAnswer:
              savedAnswer?.multipleChoices.find(
                (choice) => choice.iqid === d.iqid,
              )?.choosedAnswer ?? 0,
          };
        }),
      ),
      essays: shuffleArray(
        data.essays.map((d) => {
          const savedAnswer = initialData.find((d) => d.slug === data.slug);

          return {
            ...d,
            answer:
              savedAnswer?.essays.find((choice) => choice.iqid === d.iqid)
                ?.answer ?? "",
          };
        }),
      ),
    }),
    [data.essays, data.multipleChoices, data.slug, initialData],
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

  const multipleChoiceDebounced = useDebounceCallback(
    (updatedData: { iqid: number; choosedAnswer: number }) => {
      setStudentAnswers((prev) =>
        prev.map((answer) =>
          answer.slug === data.slug
            ? {
                ...answer,
                multipleChoices: !answer.multipleChoices.find(
                  (choice) => choice.iqid === updatedData.iqid,
                )
                  ? [...answer.multipleChoices, updatedData]
                  : answer.multipleChoices.map((choice) =>
                      choice.iqid === updatedData.iqid ? updatedData : choice,
                    ),
              }
            : answer,
        ),
      );
    },
    250,
  );
  const essayDebounce = useDebounceCallback(
    (updatedData: { iqid: number; answer: string }) => {
      setStudentAnswers((prev) =>
        prev.map((answer) =>
          answer.slug === data.slug
            ? {
                ...answer,
                essays: !answer.essays.find(
                  (choice) => choice.iqid === updatedData.iqid,
                )
                  ? [...answer.essays, updatedData]
                  : answer.essays.map((essay) =>
                      essay.iqid === updatedData.iqid ? updatedData : essay,
                    ),
              }
            : answer,
        ),
      );
    },
    250,
  );

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      setCanUpdateDishonesty(false);

      console.log({
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
      });
    },
    [checkIn, data.id],
  );

  if (isEnded)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 p-5">
        <h2 className="font-monospace scroll-m-20 pb-2 text-center text-3xl font-semibold tracking-tight text-red-600 first:mt-0 dark:text-red-500">
          Waktu Habis
        </h2>
        <p className="text-center text-lg">
          Waktu ulangan sudah selesai, anda tidak bisa mengerjakan soal ini
          lagi.
        </p>

        <Button variant="outline" size="icon" asChild>
          <Link to="/">
            <ArrowLeft />
            <span className="sr-only">Kembali ke halaman depan</span>
          </Link>
        </Button>
      </div>
    );

  return (
    <>
      <DishonestyAlert
        open={dishonestyWarning}
        closeAlert={closeAlertCallback}
      />

      <header className="no-copy fixed inset-x-0 top-0 z-50 flex w-full justify-center border-solid">
        <div className="flex h-full w-full flex-wrap items-center justify-center gap-2 border border-b bg-white p-2 px-5 dark:bg-stone-900 sm:gap-4">
          <GoToHome canUpdateDishonesty={setCanUpdateDishonesty} />

          <DishonestyCountAlert dishonestyCount={dishonestyCount} />

          <CountdownIsolation
            endedAt={data.endedAt}
            theEndHasCome={theEndHasCome}
          />

          <AnsweredQuestionsList
            open={answeredDrawerOpen}
            toggleDrawer={setDrawerOpen}
            slug={data.slug}
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
              <div className="h-3 rounded-t-lg rounded-tr-lg bg-green-700 dark:bg-green-800" />
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
                  <CardHeader className="rounded-t-lg rounded-tr-lg bg-green-700 dark:bg-green-800">
                    <h4 className="scroll-m-20 text-xl font-semibold uppercase tracking-tight text-green-50">
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

                                    multipleChoiceDebounced({
                                      iqid: field.iqid,
                                      choosedAnswer: parseInt(val),
                                    });
                                  }}
                                  disabled={submitAnswerMutation.isLoading}
                                >
                                  {field.options.map((option, idx) => (
                                    <div
                                      className="flex items-center space-x-2"
                                      key={`options.${field.iqid}.opt.${idx}`}
                                    >
                                      <RadioGroupItem
                                        value={String(option.order)}
                                        id={`options.${field.iqid}.opt.${idx}`}
                                        disabled={
                                          submitAnswerMutation.isLoading
                                        }
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
                  <CardHeader className="rounded-t-lg rounded-tr-lg bg-green-700 dark:bg-green-800">
                    <h4 className="scroll-m-20 text-xl font-semibold uppercase tracking-tight text-green-50">
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
                                    essayDebounce({
                                      iqid: field.iqid,
                                      answer: e.target.value,
                                    });
                                  }}
                                  disabled={submitAnswerMutation.isLoading}
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
              <Button type="submit" variant="ghost" className="uppercase">
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
  (prev, next) => JSON.stringify(prev.data) === JSON.stringify(next.data),
);
