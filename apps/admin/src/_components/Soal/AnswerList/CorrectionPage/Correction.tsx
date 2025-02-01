"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  // CardDescription,
  CardFooter,
  CardHeader,
  // CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";

import { api } from "~/trpc/react";

import "katex/dist/katex.min.css";

import { Separator } from "@/components/ui/separator";

import { UpdateEssayScore } from "./UpdateEssayScore";

export const Correction = ({
  respondId,
  questionId,
  questionTitle,
  studentName,
  studentClass,
  checkIn,
  submittedAt,
  choices,
  essays,
}: {
  respondId: number;
  questionId: number;
  questionTitle: string;
  studentName: string;
  studentClass: string;
  checkIn: Date;
  submittedAt: Date;
  choices: { choiceId: number; answer: number }[];
  essays: { id: number; essayId: number; answer: string }[];
}) => {
  const multipleChoicesQuery = api.question.getMultipleChoices.useQuery(
    {
      questionId,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const essayScoresQuery = api.question.getEssaysScore.useQuery(
    {
      respondId,
    },
    {
      enabled: false,
    },
  );
  const essaysQuery = api.question.getEssays.useQuery(
    {
      questionId,
    },
    {
      refetchOnWindowFocus: false,
      async onSuccess() {
        await essayScoresQuery.refetch();
      },
    },
  );

  useEffect(() => {
    void import("katex").then((katex) => {
      window.katex = katex;
    });
  }, []);

  return (
    <>
      <div className="mb-5">
        <Card>
          <CardContent className="space-y-1 p-6">
            <p className="w-full md:w-[80%] lg:w-[70%]">
              Soal: {questionTitle}
            </p>
            <p className="w-full md:w-[80%] lg:w-[70%]">Nama: {studentName}</p>
            <p className="w-full md:w-[80%] lg:w-[70%]">
              Kelas: {studentClass}
            </p>
            <p className="w-full md:w-[80%] lg:w-[70%]">
              Mulai Mengerjakan:{" "}
              {format(checkIn, "dd MMMM yyy, kk.mm", {
                locale: id,
              })}
            </p>
            <p className="w-full md:w-[80%] lg:w-[70%]">
              Dikumpulkan Jawaban:{" "}
              {format(submittedAt, "dd MMMM yyy, kk.mm", {
                locale: id,
              })}
            </p>
            <p className="w-full md:w-[80%] lg:w-[70%]">
              Durasi pengerjaan:{" "}
              {formatDuration(
                intervalToDuration({
                  start: checkIn,
                  end: submittedAt,
                }),
                { locale: id },
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 flex flex-col gap-8 pb-16">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Pilihan Ganda
            </h3>

            {multipleChoicesQuery.isPending ? (
              <Skeleton className="w-15 h-6" />
            ) : !multipleChoicesQuery.isError ? (
              <span>
                Jumlah Benar:{" "}
                {
                  multipleChoicesQuery.data
                    .map(
                      (choice) =>
                        choices.find((c) => c.choiceId === choice.iqid)!
                          .answer === choice.correctAnswerOrder,
                    )
                    .filter((a) => !!a).length
                }{" "}
                / {multipleChoicesQuery.data.length}
              </span>
            ) : (
              <pre className="text-rose-600">N.A</pre>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {multipleChoicesQuery.isPending ? (
              <>
                {Array.from({ length: 10 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-[18rem] w-full" />
                ))}
              </>
            ) : null}
            {multipleChoicesQuery.data?.map((choice) => (
              <Card key={choice.iqid}>
                <CardHeader>
                  <h3
                    className={`correction scroll-m-20 text-base tracking-tight ${
                      choice.correctAnswerOrder ===
                      choices.find((c) => c.choiceId === choice.iqid)!.answer
                        ? "text-green-600"
                        : "text-rose-600"
                    }`}
                    dangerouslySetInnerHTML={{ __html: choice.question }}
                  />
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    defaultValue={String(
                      choices.find((c) => c.choiceId === choice.iqid)!.answer,
                    )}
                  >
                    {choice.options.map((option, idx) => (
                      <div
                        className={`flex min-h-10 items-center space-x-3 rounded px-2 py-3 ${
                          option.order === choice.correctAnswerOrder
                            ? "bg-green-500/40 dark:bg-green-700/30"
                            : choices.find((c) => c.choiceId === choice.iqid)!
                                  .answer === option.order
                              ? "bg-rose-500/40 dark:bg-rose-700/30"
                              : ""
                        }`}
                        key={`preview.${choice.iqid}.opt.${idx}`}
                      >
                        <RadioGroupItem
                          disabled
                          value={String(option.order)}
                          id={`preview.${choice.iqid}.opt.${idx}`}
                        />
                        <Label
                          htmlFor={`preview.${choice.iqid}.opt.${idx}`}
                          className="text-base"
                          dangerouslySetInnerHTML={{ __html: option.answer }}
                        />
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Esai
            </h3>

            {essaysQuery.isPending || essayScoresQuery.isPending ? (
              <Skeleton className="w-15 h-6" />
            ) : !essaysQuery.isError && !essayScoresQuery.isError ? (
              <span>
                Jumlah Benar:{" "}
                {essayScoresQuery.data
                  .map(({ score }) => parseFloat(score))
                  .reduce((curr, acc) => curr + acc, 0)}{" "}
                / {essaysQuery.data.length}
              </span>
            ) : (
              <pre className="text-rose-600">N.A</pre>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {essaysQuery.isPending ? (
              <>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-[18rem] w-full" />
                ))}
              </>
            ) : null}
            {essaysQuery.data?.map((essay) => (
              <Card key={essay.iqid}>
                <CardHeader>
                  <h3
                    className="correction scroll-m-20 text-base tracking-tight"
                    dangerouslySetInnerHTML={{ __html: essay.question }}
                  />
                </CardHeader>
                <CardContent className="mb-3">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      <p>Respon Peserta:</p>
                      <Textarea
                        disabled
                        className="disabled:opacity-100"
                        value={
                          essays.find((e) => e.essayId === essay.iqid)!.answer
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <p>Jawaban Benar:</p>

                      <p dangerouslySetInnerHTML={{ __html: essay.answer }} />
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="space-x-5 p-6">
                  <p>Poin:</p>
                  {essayScoresQuery.isPending && !essayScoresQuery.data ? (
                    <Skeleton className="h-30 w-full" />
                  ) : (
                    <UpdateEssayScore
                      id={
                        essayScoresQuery.data!.find(
                          (d) => d.essayId === essay.iqid,
                        )!.id
                      }
                      score={
                        essayScoresQuery.data!.find(
                          (d) => d.essayId === essay.iqid,
                        )!.score
                      }
                      respondId={respondId}
                    />
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
