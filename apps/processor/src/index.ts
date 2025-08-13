import type { QueueValue } from "@enpitsu/redis";
import { eq } from "@enpitsu/db";
import { db, preparedQuestionForCheck } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";
import { QUEUE_KEY } from "@enpitsu/redis";
import { Worker } from "bullmq";
import IORedis from "ioredis";

import { checkEssays, checkMultipleChoices } from "./checker";
import { env } from "./env";
import { initLogger } from "./logger";

const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export interface DetailedError {
  type: "choice" | "essay";
  iqid: number;
  errorMessage: string;
}

export type TQuestionForCheck = NonNullable<
  Awaited<ReturnType<typeof preparedQuestionForCheck.execute>>
>;

export const validateQuestionFromQueue = async (loggerDirectory: string) => {
  const logger = initLogger(loggerDirectory);

  const worker = new Worker<QueueValue>(
    QUEUE_KEY,
    async (job) => {
      let errorInMC = false;
      let errorInEssays = false;

      let errors: DetailedError[] = [];

      const questionData = await preparedQuestionForCheck.execute({
        questionId: job.data.questionId,
      });

      if (!questionData) return;

      logger.info(`[WORKER] New job for questionId: ${questionData.id}`);

      if (
        questionData.multipleChoices.length === 0 &&
        questionData.essays.length === 0
      ) {
        await db
          .update(schema.questions)
          .set({
            eligible: "NOT_ELIGIBLE",
            notEligibleReason:
              "Minimal terdapat satu soal pilihan ganda atau soal esai.",
            detailedNotEligible: [],
          })
          .where(eq(schema.questions.id, job.data.questionId));

        return;
      }

      if (questionData.multipleChoices.length > 0) {
        const allMCErr = checkMultipleChoices(questionData.multipleChoices);
        errorInMC = allMCErr.length > 0;
        errors = [...errors, ...allMCErr];
      }

      if (questionData.essays.length > 0) {
        const allEssaysErr = checkEssays(questionData.essays);
        errorInEssays = allEssaysErr.length > 0;
        errors = [...errors, ...allEssaysErr];
      }

      if (!errorInMC && !errorInEssays) {
        await db
          .update(schema.questions)
          .set({ eligible: "ELIGIBLE" })
          .where(eq(schema.questions.id, questionData.id));

        return;
      }

      await db
        .update(schema.questions)
        .set({
          eligible: "NOT_ELIGIBLE",
          notEligibleReason: `Terdapat error pada soal ${errorInMC && errorInEssays ? "pilihan ganda dan esai" : errorInMC ? "pilihan ganda" : "esai"}. Selengkapnya, mohon cek detail kesalahan dibawah ini untuk segera diperbaiki.`,
          detailedNotEligible: errors,
        })
        .where(eq(schema.questions.id, questionData.id));

      logger.info(
        `[WORKER] Done processing for questionId: ${questionData.id}`,
      );
    },
    {
      connection,
      autorun: false,
      concurrency: 10,
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 24 * 3600, // keep up to 24 hours
      },
    },
  );

  worker.on("ready", () => logger.info("[WORKER] Ready to process queue"));
  worker.on("error", (err) => logger.error(err));

  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, closing worker...`);
    await worker.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));

  try {
    logger.debug(`[DB] Database URL: ${env.DATABASE_URL}`);
    logger.debug(`[REDIS] Redis URL: ${env.REDIS_URL}`);

    logger.info("[WORKER] Spun up worker");

    await worker.run();
  } catch (error) {
    logger.error(error);
  }
};
