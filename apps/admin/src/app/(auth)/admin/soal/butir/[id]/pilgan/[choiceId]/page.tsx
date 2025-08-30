import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@enpitsu/auth";
import { and, asc, eq } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";
import { ArrowLeft } from "lucide-react";

import { MainEditor } from "~/_components/Editor/MainEditor";
import { badgeVariants } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AnswerOptions } from "./answers";

const getRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export default async function ChoiceEditor({
  params,
}: {
  params: {
    choiceId: string;
    id: string;
  };
}) {
  const identity = await auth();

  if (!identity) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id: _id, choiceId: _choiceId } = await params;

  const id = parseInt(_id);
  const choiceId = parseInt(_choiceId);

  if (isNaN(id) || isNaN(choiceId)) redirect("/admin/soal");

  const parentQuestion = await db.query.questions.findFirst({
    where: eq(schema.questions.id, id),
    columns: {
      id: true,
      title: true,
      multipleChoiceOptions: true,
    },
  });

  if (!parentQuestion) redirect("/admin/soal");

  const currentChoiceQuestion = await db.query.multipleChoices.findFirst({
    where: and(
      eq(schema.multipleChoices.questionId, id),
      eq(schema.multipleChoices.iqid, choiceId),
    ),
  });

  if (!currentChoiceQuestion) redirect(`/admin/soal/butir/${id}`);

  const multipleChoiceIds = await db.query.multipleChoices.findMany({
    where: eq(schema.multipleChoices.questionId, id),
    orderBy: [asc(schema.multipleChoices.iqid)],
    columns: {
      iqid: true,
    },
  });

  const currentIdx = multipleChoiceIds.findIndex(
    (q) => q.iqid === currentChoiceQuestion.iqid,
  );
  const currentNumber = currentIdx + 1;

  const isNextNumberExist = !!multipleChoiceIds[currentNumber];
  const nextNumberIdentity = isNextNumberExist
    ? multipleChoiceIds[currentNumber]
    : null;

  const isPrevNumberExist = !!multipleChoiceIds[currentIdx - 1];
  const prevNumberIdentity = isPrevNumberExist
    ? multipleChoiceIds[currentIdx - 1]
    : null;

  const cursorColor = getRandomColor();

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-0">
        <Link
          href={`/admin/soal/butir/${id}`}
          className={badgeVariants({ variant: "secondary" })}
        >
          <ArrowLeft className="mr-2" />
          Kembali ke halaman butir soal
        </Link>

        <div className="flex flex-row justify-between md:justify-normal md:gap-3">
          {isPrevNumberExist ? (
            <Button asChild variant="outline">
              <Link
                href={`/admin/soal/butir/${id}/pilgan/${prevNumberIdentity?.iqid}`}
              >
                Ke nomor sebelumnya
              </Link>
            </Button>
          ) : null}

          {isNextNumberExist ? (
            <Button asChild variant="outline">
              <Link
                href={`/admin/soal/butir/${id}/pilgan/${nextNumberIdentity?.iqid}`}
              >
                Ke nomor selanjutnya
              </Link>
            </Button>
          ) : (
            <Button>Tambah Nomor Baru</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Pilihan Ganda Nomor {currentNumber}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Judul Soal: {parentQuestion.title}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div>
            <MainEditor
              cursorColor={cursorColor}
              roomName={`q-choice-parent_${id}-${choiceId}`}
              username={identity.user.name!}
              showName
            >
              <p>Pokok soal.</p>
            </MainEditor>
          </div>

          <AnswerOptions
            cursorColor={cursorColor}
            choiceId={choiceId}
            username={identity.user.name!}
            options={Array.from({
              length: parentQuestion.multipleChoiceOptions,
            }).map((_, idx) => ({
              idx,
              roomName: `q-choice-opt_${id}-${choiceId}-${idx}`,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
