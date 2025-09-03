import Form from "next/form";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@enpitsu/auth";
import { and, asc, eq } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";

import { MainEditor } from "~/_components/Editor/MainEditor";
import { TextareaEditor } from "~/_components/Editor/TextareaEditor";
import { NewQuestionButtonInsideEditing } from "~/_components/Soal/QuestionItems/QuestionButton";
import { createNewEssay } from "~/_components/Soal/QuestionItems/server-actions";
import { badgeVariants } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { SetStrictEqual } from "./set-strict-equal";

const getRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export default async function EssayEditor({
  params,
}: {
  params: {
    subId: string;
    id: string;
  };
}) {
  const identity = await auth();

  if (!identity) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id: _id, subId: _essayId } = await params;

  const id = parseInt(_id);
  const essayId = parseInt(_essayId);

  if (isNaN(id) || isNaN(essayId)) redirect("/admin/soal");

  const parentQuestion = await db.query.questions.findFirst({
    where: eq(schema.questions.id, id),
    columns: {
      id: true,
      title: true,
      multipleChoiceOptions: true,
    },
  });

  if (!parentQuestion) redirect("/admin/soal");

  const currentEssayQuestion = await db.query.essays.findFirst({
    where: and(
      eq(schema.essays.questionId, id),
      eq(schema.essays.iqid, essayId),
    ),
  });

  if (!currentEssayQuestion) redirect(`/admin/soal/butir/${id}`);

  // @ts-expect-error expect aj lah
  const newEssayAction = createNewEssay.bind(null, null, parentQuestion);

  const essayIds = await db.query.essays.findMany({
    where: eq(schema.essays.questionId, id),
    orderBy: [asc(schema.essays.iqid)],
    columns: {
      iqid: true,
    },
  });

  const currentIdx = essayIds.findIndex(
    (q) => q.iqid === currentEssayQuestion.iqid,
  );
  const currentNumber = currentIdx + 1;

  const isNextNumberExist = !!essayIds[currentNumber];
  const nextNumberIdentity = isNextNumberExist ? essayIds[currentNumber] : null;

  const isPrevNumberExist = !!essayIds[currentIdx - 1];
  const prevNumberIdentity = isPrevNumberExist
    ? essayIds[currentIdx - 1]
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
                href={`/admin/soal/butir/${id}/essay/${prevNumberIdentity?.iqid}`}
              >
                Ke nomor sebelumnya
              </Link>
            </Button>
          ) : null}

          {isNextNumberExist ? (
            <Button asChild variant="outline">
              <Link
                href={`/admin/soal/butir/${id}/essay/${nextNumberIdentity?.iqid}`}
              >
                Ke nomor selanjutnya
              </Link>
            </Button>
          ) : (
            <Form action={newEssayAction}>
              <NewQuestionButtonInsideEditing />
            </Form>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Esai Nomor {currentNumber}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Judul Soal: {parentQuestion.title}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div>
            <MainEditor
              cursorColor={cursorColor}
              roomName={`q-essay-question_${id}-${essayId}`}
              username={identity.user.name!}
              showName
            >
              <p>Pokok pertanyaan.</p>
            </MainEditor>
          </div>

          <div>
            <TextareaEditor
              cursorColor={cursorColor}
              roomName={`q-essay-answer_${id}-${essayId}`}
              username={identity.user.name!}
            >
              <SetStrictEqual essayId={essayId} />
            </TextareaEditor>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
