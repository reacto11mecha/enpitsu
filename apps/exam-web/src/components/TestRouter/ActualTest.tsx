import { memo, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  // FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCountdown } from "@/hooks/useCountdown";
import { useNetworkState } from "@/hooks/useNetworkState";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { studentAnswerAtom } from "@/lib/atom";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import katex from "katex";
import { ArrowLeft, Globe, Loader2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useWakeLock } from "react-screen-wake-lock";
import { z } from "zod";

import { ModeToggle } from "../mode-toggle";
import { useToast } from "../ui/use-toast";
import {
  BadInternetAlert,
  DishonestyAlert,
  ScreenWakeLockFail,
} from "./AllAlert";
import {
  formSchema,
  shuffleArray,
  useDebounce,
  type Props,
  type TFormSchema,
} from "./utils";

import "katex/dist/katex.min.css";
import "react-quill/dist/quill.snow.css";

window.katex = katex;

const Test = ({ data, initialData }: Props) => {
  const [checkIn] = useState(
    initialData.find((d) => d.slug === data.slug)?.checkIn
      ? new Date(
          initialData.find((d) => d.slug === data.slug)!
            .checkIn as unknown as string,
        )
      : new Date(),
  );

  const { toast } = useToast();

  const [studentAnswers, setStudentAnswers] = useAtom(studentAnswerAtom);

  const blocklistMutation = api.exam.storeBlocklist.useMutation({
    onSuccess() {
      setStudentAnswers(
        studentAnswers.filter((answer) => answer.slug !== data.slug),
      );
    },
    onError(error) {
      toast({
        variant: "destructive",
        title: "Operasi Gagal",
        description: `Gagal menyimpan status kecurangan. Error: ${error.message}`,
      });
    },
    retry: false,
  });
  const submitAnswerMutation = api.exam.submitAnswer.useMutation({
    onSuccess() {
      setStudentAnswers(
        studentAnswers.filter((answer) => answer.slug !== data.slug),
      );
    },
    onError(error) {
      toast({
        variant: "destructive",
        title: "Operasi Gagal",
        description: `Gagal menyimpan jawaban. Error: ${error.message}`,
      });
    },
    retry: false,
  });

  const [dishonestyCount, setDishonestyCount] = useState(
    initialData.find((d) => d.slug === data.slug)?.dishonestCount ?? 0,
  );

  const { isPageVisible } = usePageVisibility();
  const { isOnline } = useNetworkState();

  // Toggle this initial state value for prod and dev
  const [canUpdateDishonesty, setCanUpdateDishonesty] = useState(true);

  const [dishonestyWarning, setDishonestyWarning] = useState(false);
  const [badInternetAlert, setBadInternet] = useState(false);
  const [wakeLockError, setWakeLockError] = useState(false);

  const closeAlertCallback = useCallback(() => {
    setCanUpdateDishonesty(true);
    setDishonestyWarning(false);
  }, []);
  const closeBadInternet = useCallback(() => {
    if (isOnline) {
      setCanUpdateDishonesty(true);
      setBadInternet(false);
    }
  }, [isOnline]);
  const closeWakeLock = useCallback(() => {
    setCanUpdateDishonesty(true);
    setWakeLockError(false);
  }, []);

  const { isSupported, request, release } = useWakeLock({
    onError: () => {
      setCanUpdateDishonesty(false);
    },
  });

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    },
  });

  const multipleChoicesField = useFieldArray({
    control: form.control,
    name: "multipleChoices",
  });

  const essaysField = useFieldArray({
    control: form.control,
    name: "essays",
  });

  const { countdown, isEnded } = useCountdown(data.endedAt);

  // Increment dishonesty count up to 3 tab changes.
  // The first two will ask kindly to not to cheat on their exam.
  useEffect(() => {
    if (!isPageVisible && canUpdateDishonesty)
      setDishonestyCount((prev) => {
        const newValue = ++prev;

        if (newValue > 2) setCanUpdateDishonesty(false);
        else if (newValue < 3) {
          setCanUpdateDishonesty(false);
          setDishonestyWarning(true);
        }

        return newValue;
      });
  }, [canUpdateDishonesty, isPageVisible]);

  // Track changes of user network status. User can turned on their
  // internet connection and safely continue their exam like normal.
  useEffect(() => {
    if (!isOnline) {
      setCanUpdateDishonesty(false);
      setBadInternet(true);
    }
  }, [isOnline]);

  const multipleChoiceDebounced = useDebounce(
    (updatedData: { iqid: number; choosedAnswer: number }) => {
      const updatedAnswers = studentAnswers.map((answer) =>
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
      );

      setStudentAnswers(updatedAnswers);
    },
  );
  const essayDebounce = useDebounce(
    (updatedData: { iqid: number; answer: string }) => {
      const updatedAnswers = studentAnswers.map((answer) =>
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
      );

      setStudentAnswers(updatedAnswers);
    },
  );

  const updateDishonestAtom = useCallback(
    (count: number) => {
      const updatedAnswers = studentAnswers.map((answer) =>
        answer.slug === data.slug
          ? { ...answer, dishonestCount: count }
          : answer,
      );

      setStudentAnswers(updatedAnswers);
    },
    [data.slug, setStudentAnswers, studentAnswers],
  );

  useEffect(() => {
    updateDishonestAtom(dishonestyCount);

    if (dishonestyCount > 2) {
      blocklistMutation.mutate({ questionId: data.id, time: new Date() });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishonestyCount]);

  useEffect(() => {
    if (!studentAnswers.find((answer) => answer.slug === data.slug))
      setStudentAnswers([
        ...studentAnswers,
        {
          slug: data.slug,
          checkIn,
          dishonestCount: 0,
          multipleChoices: [],
          essays: [],
        },
      ]);

    if (isSupported) request();
    else {
      setCanUpdateDishonesty(false);
      setWakeLockError(true);
    }

    return () => {
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setCanUpdateDishonesty(false);

    submitAnswerMutation.mutate({
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
  };

  if (submitAnswerMutation.isSuccess)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 p-3">
        <h2 className="font-monospace scroll-m-20 pb-2 text-center text-3xl font-semibold tracking-tight text-green-600 first:mt-0 dark:text-green-500">
          Berhasil Submit
        </h2>
        <p className="text-center text-lg md:w-[75%]">
          Jawaban anda sudah di simpan, anda bisa menunjukan ini ke pengawas
          ruangan bahwa jawaban anda sudah di submit dengan aman.
        </p>

        <Button variant="outline" size="icon" asChild>
          <Link to="/">
            <ArrowLeft />
            <span className="sr-only">Kembali ke halaman depan</span>
          </Link>
        </Button>
      </div>
    );

  if (dishonestyCount > 2)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 p-3">
        <h2 className="font-monospace scroll-m-20 pb-2 text-center text-3xl font-semibold tracking-tight text-red-600 first:mt-0 dark:text-red-500">
          Anda Melakukan Kecurangan
        </h2>
        <p className="text-center text-lg md:w-[75%]">
          Anda sudah tiga kali beralih dari tab ini,{" "}
          {!blocklistMutation.isLoading && blocklistMutation.isSuccess ? (
            <>
              kami berhasil menyimpan status anda sudah melakukan kecurangan.
              Anda akan terlihat oleh panitia sudah melakukan kecurangan, lain
              kali jangan di ulangi lagi.
            </>
          ) : (
            <>
              {blocklistMutation.isError ? (
                <>
                  kami gagal menyimpan status kecurangan anda, anda bisa logout
                  untuk me-reset status kecurangan pada browser perangkat anda
                  dan login kembali.
                </>
              ) : (
                <>kami sedang menyimpan status kecurangan anda...</>
              )}
            </>
          )}
        </p>

        <Button variant="outline" size="icon" asChild>
          <Link to="/">
            <ArrowLeft />
            <span className="sr-only">Kembali ke halaman depan</span>
          </Link>
        </Button>
      </div>
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
      <BadInternetAlert
        backOnline={isOnline}
        open={badInternetAlert}
        closeBadInternet={closeBadInternet}
      />
      <ScreenWakeLockFail open={wakeLockError} closeWakeLock={closeWakeLock} />

      <header className="fixed inset-x-0 top-0 z-50 flex w-full justify-center border-solid">
        <div className="flex h-full w-full flex-wrap items-center justify-center gap-2 border border-b bg-white p-2 px-5 dark:bg-stone-900 sm:gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <Globe />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Platform saat ini: web</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">{dishonestyCount}</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Jumlah kecurangan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline">{countdown}</Button>

          <ModeToggle size="default" />
        </div>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex justify-center px-4 pb-16 pt-20"
        >
          <div className="flex w-full max-w-lg flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Pilihan Ganda
              </h3>

              <div className="flex flex-col gap-5">
                {multipleChoicesField.fields.map((field, index) => (
                  <Card key={field.id} className="w-full">
                    <CardHeader>
                      <h3
                        className="no-copy scroll-m-20 text-lg tracking-tight"
                        dangerouslySetInnerHTML={{ __html: field.question }}
                      />
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name={`multipleChoices.${index}.choosedAnswer` as const}
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
                                      disabled={submitAnswerMutation.isLoading}
                                    />
                                    <Label
                                      htmlFor={`options.${field.iqid}.opt.${idx}`}
                                      className="no-copy text-base font-normal"
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

            {essaysField.fields.length >= 1 ? (
              <div className="flex flex-col gap-3">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  Esai
                </h3>

                <div className="flex flex-col gap-5">
                  {essaysField.fields.map((field, index) => (
                    <Card key={field.iqid}>
                      <CardHeader>
                        <h3
                          className="no-copy scroll-m-20 text-base tracking-tight"
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
              <Button
                type="submit"
                variant="ghost"
                className="uppercase"
                disabled={submitAnswerMutation.isLoading}
              >
                {submitAnswerMutation.isLoading ? (
                  <Loader2 className="mr-2 h-4 animate-spin md:w-4" />
                ) : null}{" "}
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
