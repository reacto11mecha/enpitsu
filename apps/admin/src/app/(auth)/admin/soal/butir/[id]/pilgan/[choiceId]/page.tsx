import { redirect } from "next/navigation";
import { db } from "@enpitsu/db/client";
import { and, asc, eq } from "@enpitsu/db";
import * as schema from "@enpitsu/db/schema";

import Link from "next/link"
import { badgeVariants } from "~/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MainEditor } from "~/_components/Editor/MainEditor";
import { auth } from "@enpitsu/auth";

export default async function ChoiceEditor({ params }: {
  params: {
    choiceId: string;
    id: string;
  }
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
    where: and(eq(schema.multipleChoices.questionId, id), eq(schema.multipleChoices.iqid, choiceId)),
    orderBy: [asc(schema.multipleChoices.iqid)],
  });

  if (!currentChoiceQuestion) redirect(`/admin/soal/butir/${id}`);

  const multipleChoiceIds = await db.query.multipleChoices.findMany({
    where: eq(schema.multipleChoices.questionId, id),
    columns: {
      iqid: true
    }
  });

  const currentIdx = multipleChoiceIds.findIndex(q => q.iqid === currentChoiceQuestion.iqid);
  // const isFirstNumber = currentIdx === 0;
  const currentNumber = currentIdx + 1;

  const isNextNumberExist = !!multipleChoiceIds[currentNumber];
  const nextNumberIdentity = isNextNumberExist ? multipleChoiceIds[currentNumber] : null;

  const isPrevNumberExist = !!multipleChoiceIds[currentIdx - 1];
  const prevNumberIdentity = isPrevNumberExist ? multipleChoiceIds[currentIdx - 1] : null;

  return (
    <div className="p-5 space-y-4">
      <div className="flex flex-col gap-3 md:gap-0 md:flex-row justify-between">
        <Link href={`/admin/soal/butir/${id}`} className={badgeVariants({ variant: "secondary" })}>
          <ArrowLeft className="mr-2" />Kembali ke halaman butir soal
        </Link>

        <div className="flex flex-row justify-between md:justify-normal md:gap-3">
          {isPrevNumberExist ? <Button asChild variant="outline"><Link href={`/admin/soal/butir/${id}/pilgan/${prevNumberIdentity?.iqid}`}>Ke nomor sebelumnya</Link></Button> : null}

          {isNextNumberExist ? <Button asChild variant="outline"><Link href={`/admin/soal/butir/${id}/pilgan/${nextNumberIdentity?.iqid}`}>Ke nomor selanjutnya</Link></Button> : <Button>Tambah Nomor Baru</Button>}
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
            <MainEditor roomName={`q-${id}-choice-parent-${choiceId}`} username={identity.user.name!} />
          </div>

          <p className="scroll-m-10">Opsi Jawaban :</p>

          <RadioGroup defaultValue="">
            {Array.from({ length: parentQuestion.multipleChoiceOptions }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 rounded px-2 py-3"
              >
                <RadioGroupItem
                  disabled
                  value={String(idx)}
                  id={`choice-${idx}`}
                />
                <div className="w-full">
                  <MainEditor roomName={`q-${id}-choice-${choiceId}-opt-${idx}`} username={identity.user.name!} />
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
