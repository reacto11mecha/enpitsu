"use server";

import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { revalidatePath } from "next/cache";
import { eq } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";
import { cache, correctionQueue } from "@enpitsu/redis";

interface Question {
  id: number;
  multipleChoiceOptions: number;
}

const updateQuestionToProcessing = (
  tx: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
  questionId: number,
) =>
  tx
    .update(schema.questions)
    .set({
      eligible: "PROCESSING",
    })
    .where(eq(schema.questions.id, questionId));

const addQuestionToQueueForProcessing = async (questionId: number) => {
  try {
    await correctionQueue.add(
      "check_question",
      { questionId },
      {
        removeOnComplete: true,
        removeOnFail: true,
        deduplication: {
          id: `question-${questionId}`,
        },
        attempts: 3,
      },
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    console.error({
      code: "BULLMQ_ERR",
      message:
        "Gagal menambahkan queue ke bullmq, mohon periksa konektivitas redis",
    });
  }
};

export async function createNewChoice(_formData: FormData, question: Question) {
  "use server";

  await db.transaction(async (tx) => {
    try {
      await cache.del(`trpc-get-question-slug-${question.id}`);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      console.error({
        code: "REDIS_ERR",
        message:
          "Terjadi masalah terhadap konektivitas dengan redis, mohon di cek 🙏💀",
      });
    }

    await updateQuestionToProcessing(tx, question.id);

    return await tx.insert(schema.multipleChoices).values({
      questionId: question.id,
      question: "",
      correctAnswerOrder: 0,
      options: Array.from({
        length: question.multipleChoiceOptions,
      }).map((_, idx) => ({
        order: idx + 1,
        answer: "",
      })),
    });
  });

  await addQuestionToQueueForProcessing(question.id);

  revalidatePath(`/admin/soal/butir/${question.id}`);
}

export async function createNewEssay(_formData: FormData, question: Question) {
  "use server";

  await db.transaction(async (tx) => {
    try {
      await cache.del(`trpc-get-question-slug-${question.id}`);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      console.error({
        code: "REDIS_ERR",
        message:
          "Terjadi masalah terhadap konektivitas dengan redis, mohon di cek 🙏💀",
      });
    }

    await updateQuestionToProcessing(tx, question.id);

    return await tx.insert(schema.essays).values({
      question: "",
      answer: "",
      questionId: question.id,
    });
  });

  await addQuestionToQueueForProcessing(question.id);

  revalidatePath(`/admin/soal/butir/${question.id}`);
}
