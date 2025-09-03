import Form from "next/form";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PencilLine } from "lucide-react";

import { asc, eq } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";

import { EligibleStatus } from "~/_components/Soal/QuestionItems/EligibleStatus";
import { NewQuestionButton } from "~/_components/Soal/QuestionItems/QuestionButton";
import {
  RemoveChoiceQuestion,
  RemoveEssayQuestion,
} from "~/_components/Soal/QuestionItems/RemoveItem";
import {
  createNewChoice,
  createNewEssay,
} from "~/_components/Soal/QuestionItems/server-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

import "katex/dist/katex.min.css";

import { Button } from "~/components/ui/button";

export default async function QuestionItemsPage({
  params,
}: {
  params: { id: string };
}) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id: idParams } = await params;
  const id = parseInt(idParams);

  if (isNaN(id)) return redirect("/admin/soal");

  const question = await db.query.questions.findFirst({
    where: eq(schema.questions.id, id),
    columns: {
      id: true,
      title: true,
      multipleChoiceOptions: true,
    },
  });

  if (!question) return redirect("/admin/soal");

  // @ts-expect-error aku ekspek ini error akan terjadi, tapi biarlah, aku nak question bisa di pass ke actionnya
  const newChoiceAction = createNewChoice.bind(null, null, question);
  // @ts-expect-error ini juga
  const newEssayAction = createNewEssay.bind(null, null, question);

  const choiceQuestions = await db.query.multipleChoices.findMany({
    where: eq(schema.multipleChoices.questionId, question.id),
    orderBy: [asc(schema.multipleChoices.iqid)],
  });

  const essayQuestions = await db.query.essays.findMany({
    where: eq(schema.essays.questionId, question.id),
    orderBy: [asc(schema.essays.iqid)],
  });

  return (
    <div className="mt-5 flex flex-col gap-7 px-5 py-5 md:items-center">
      <div className="w-full md:w-[80%]">
        <div className="mb-5 space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Butir Soal</h2>
          <p className="text-muted-foreground w-full md:w-[80%] lg:w-[70%]">
            Tambah, ubah, edit, dan hapus soal pilihan ganda dan esai pada
            halaman ini. Jangan lupa tentukan jawaban benar pada setiap soal.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-8 pb-16">
          <div className="flex flex-col gap-4">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Pilihan Ganda
            </h3>

            <div className="flex flex-col gap-5">
              {choiceQuestions.map((choice, idx) => (
                <Card key={choice.iqid} id={`choice-iqid-${choice.iqid}`}>
                  <CardHeader className="flex flex-row justify-between">
                    <div>
                      <CardTitle>Pilihan Ganda Nomor {idx + 1}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Judul Soal: {question.title}
                      </CardDescription>
                    </div>

                    <div className="flex flex-row items-center gap-3">
                      <RemoveChoiceQuestion
                        questionId={choice.questionId}
                        choiceId={choice.iqid}
                        questionNo={idx + 1}
                      />

                      <Button asChild variant="ghost">
                        <Link
                          href={`/admin/soal/butir/${choice.questionId}/pilgan/${choice.iqid}`}
                        >
                          <PencilLine />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-5">
                    {choice.isQuestionEmpty ? (
                      <h3 className="correction scroll-m-20 text-base tracking-tight">
                        <span className="italic opacity-60 select-none">
                          Pertanyaan ini belum ada isinya. Mohon tambahkan
                          konten pertanyaan dengan menekan simbol pensil di atas
                          kanan nomor ini.
                        </span>
                      </h3>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: choice.question,
                        }}
                      />
                    )}

                    <p className="scroll-m-10">Opsi Jawaban :</p>

                    <RadioGroup
                      defaultValue={String(choice.correctAnswerOrder)}
                    >
                      {choice.options.map((option, cidx) => (
                        <div
                          className="flex items-center space-x-3 rounded px-2 py-3"
                          key={`preview.${choice.iqid}.opt.${cidx}`}
                        >
                          <RadioGroupItem
                            disabled
                            className="disabled:opacity-100"
                            value={String(option.order)}
                            id={`preview.${choice.iqid}.opt.${cidx}`}
                          />
                          {option.isEmpty ? (
                            <Label
                              htmlFor={`preview.${choice.iqid}.opt.${cidx}`}
                              className="text-base"
                            >
                              <span className="italic opacity-60 select-none">
                                Opsi jawaban {cidx + 1} belum ada isinya. Mohon
                                tambahkan konten pertanyaan dengan menekan
                                simbol pensil di atas kanan nomor ini.
                              </span>
                            </Label>
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: option.answer,
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}

              <Form action={newChoiceAction}>
                <NewQuestionButton />
              </Form>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                Esai
              </h3>

              <div className="flex flex-col gap-5">
                {essayQuestions.map((essay, idx) => (
                  <Card key={essay.iqid}>
                    <CardHeader className="flex flex-row justify-between">
                      <div>
                        <CardTitle>Esai Nomor {idx + 1}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Judul Soal: {question.title}
                        </CardDescription>
                      </div>

                      <div className="flex flex-row items-center gap-3">
                        <RemoveEssayQuestion
                          questionId={essay.questionId}
                          essayId={essay.iqid}
                          questionNo={idx + 1}
                        />

                        <Button asChild variant="ghost">
                          <Link
                            href={`/admin/soal/butir/${essay.questionId}/essay/${essay.iqid}`}
                          >
                            <PencilLine />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {essay.isQuestionEmpty ? (
                        <h3 className="correction scroll-m-20 text-base tracking-tight">
                          <span className="italic opacity-60 select-none">
                            Pertanyaan ini belum ada isinya. Mohon tambahkan
                            konten pertanyaan dengan menekan simbol pensil di
                            atas kanan nomor ini.
                          </span>
                        </h3>
                      ) : (
                        <h3
                          className="correction scroll-m-20 text-base tracking-tight"
                          dangerouslySetInnerHTML={{ __html: essay.question }}
                        />
                      )}

                      <div className="flex flex-col gap-4">
                        <p>Jawaban Benar:</p>

                        {essay.answer === "" ? (
                          <p>
                            <span className="italic opacity-60 select-none">
                              Esai ini belum ada jawaban benarnya. Mohon
                              tambahkan dengan menekan simbol pensil di atas
                              kanan nomor ini.
                            </span>
                          </p>
                        ) : (
                          <p>{essay.answer}</p>
                        )}

                        <p className="mt-2 text-sm">
                          Jawaban wajib persis sama?{" "}
                          {essay.isStrictEqual ? "Ya" : "Tidak"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Form action={newEssayAction}>
                <NewQuestionButton />
              </Form>
            </div>

            <EligibleStatus questionId={question.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
