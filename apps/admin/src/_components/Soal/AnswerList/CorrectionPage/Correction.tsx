"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";

import { api } from "~/utils/api";

export const Correction = ({
  questionId,
  questionTitle,
  studentName,
  studentClass,
  checkIn,
  submittedAt,
  choices,
  essays,
}: {
  questionId: number;
  questionTitle: string;
  studentName: string;
  studentClass: string;
  checkIn: Date;
  submittedAt: Date;
  choices: { choicesId: number; answer: number }[];
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
  const essaysQuery = api.question.getEssays.useQuery(
    {
      questionId,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <>
      <div className="mb-5">
        <p className="w-full md:w-[80%] lg:w-[70%]">Soal: {questionTitle}</p>
        <p className="w-full md:w-[80%] lg:w-[70%]">Nama: {studentName}</p>
        <p className="w-full md:w-[80%] lg:w-[70%]">Kelas: {studentClass}</p>
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
      </div>

      <div className="mt-5 flex flex-col gap-8 pb-16">
        <div className="flex flex-col gap-4">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Pilihan Ganda
          </h3>

          <div className="flex flex-col gap-5">
            {multipleChoicesQuery.isLoading ? (
              <>
                {Array.from({ length: 10 }).map((_, idx) => (
                  <Skeleton className="h-[18rem] w-full" />
                ))}
              </>
            ) : null}
            {multipleChoicesQuery.data?.map((choice) => (
              <Card key={choice.iqid}>
                <CardHeader>
                  <h3 className="scroll-m-20 text-base tracking-tight">
                    {choice.question}
                  </h3>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    className="space-y-2"
                    defaultValue={String(
                      choices.find((c) => c.choiceId === choice.iqid)!.answer,
                    )}
                  >
                    {choice.options.map((option, idx) => (
                      <div
                        className="flex items-center space-x-2"
                        key={`preview.${choice.iqid}.opt.${idx}`}
                      >
                        <RadioGroupItem
                          disabled
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
            {essaysQuery.isLoading ? (
              <>
                {Array.from({ length: 10 }).map((_, idx) => (
                  <Skeleton className="h-[18rem] w-full" />
                ))}
              </>
            ) : null}
            {essaysQuery.data?.map((essay) => (
              <Card key={essay.iqid}>
                <CardHeader>
                  <h3 className="scroll-m-20 text-base tracking-tight">
                    {essay.question}
                  </h3>
                </CardHeader>
                <CardContent>
                  <Textarea
                    disabled
                    value={essays.find((e) => e.essayId === essay.iqid)!.answer}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
