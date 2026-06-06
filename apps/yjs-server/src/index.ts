import "./env";

import { createRequire } from "module";
import type pinoType from "pino";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { Server } from "@hocuspocus/server";
import { trace } from "@opentelemetry/api";
import { yTextToSlateElement } from "@slate-yjs/core";
import { createSlateEditor, serializeHtml } from "platejs";
import * as Y from "yjs";

import { and, eq } from "@enpitsu/db";
import { db, preparedYjsDocumentSelect } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";
import { cache, correctionQueue } from "@enpitsu/redis";

import { createDebounceById } from "./debouncer";

// Open telemetry monkey patching.
// Honestly, wtf
const require = createRequire(import.meta.url);

const pino = require("pino") as typeof pinoType;

export const logger = pino();

const tracer = trace.getTracer("yjs-server-tracer");

const debouncedMessageQueue = createDebounceById((id: string) => {
  const questionId = parseInt(id);

  try {
    void correctionQueue.add(
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
    logger.error(
      { code: "BULLMQ_ERR" },
      "Gagal menambahkan queue ke bullmq, mohon periksa konektivitas redis",
    );
  }
}, 250);

export const yjsServer = async () => {
  const server = new Server({
    port: 1234,

    extensions: [
      new Logger({
        log: (...args) => {
          logger.info(args.join(" "));
        },
        onChange: false,
      }),
      new Database({
        fetch: async ({ documentName }) => {
          const result = await preparedYjsDocumentSelect.execute({
            documentName,
          });

          if (!result) return null;

          return result.data;
        },

        store: async ({ documentName: realDocumentName, state }) => {
          return tracer.startActiveSpan(`store-document`, async (span) => {
            span.setAttribute("document.name", realDocumentName);

            try {
              await db
                .insert(schema.yjsDocuments)
                .values({ name: realDocumentName, data: state })
                .onConflictDoUpdate({
                  target: schema.yjsDocuments.name,
                  set: { data: state },
                });

              let questionId = 0;

              logger.info(
                { documentName: realDocumentName },
                "Saving document...",
              );

              await db.transaction(async (tx) => {
                const tempDoc = new Y.Doc();
                Y.applyUpdate(tempDoc, state);

                const documentName = realDocumentName.split("|")[1]!;
                const type = documentName.split("_");

                if (documentName.startsWith("q-essay-answer")) {
                  const answer = tempDoc.getText("essay-answer").toJSON();

                  const [_questionId, _essayId] = type[1]!.split("-");

                  questionId = parseInt(_questionId!);
                  const essayId = parseInt(_essayId!);

                  const currentEssayData = await tx
                    .select({
                      id: schema.essays.iqid,
                    })
                    .from(schema.essays)
                    .where(eq(schema.essays.iqid, essayId))
                    .for("update");

                  if (currentEssayData.length > 0) {
                    await tx
                      .update(schema.essays)
                      .set({
                        answer,
                      })
                      .where(
                        and(
                          eq(schema.essays.questionId, questionId),
                          eq(schema.essays.iqid, essayId),
                        ),
                      );
                  }

                  return tx
                    .update(schema.questions)
                    .set({
                      eligible: "PROCESSING",
                    })
                    .where(eq(schema.questions.id, questionId));
                }

                const { children: content } = yTextToSlateElement(
                  tempDoc.get("content", Y.XmlText),
                );

                const editor = createSlateEditor({
                  plugins: BaseEditorKit,
                  // @ts-expect-error masuk kok ini dia
                  value: content,
                });

                const html = await serializeHtml(editor);

                switch (type[0]) {
                  case "q-choice-parent": {
                    const [_questionId, _choiceId] = type[1]!.split("-");

                    questionId = parseInt(_questionId!);
                    const choiceId = parseInt(_choiceId!);

                    const currentChoiceData = await tx
                      .select({
                        id: schema.multipleChoices.iqid,
                      })
                      .from(schema.multipleChoices)
                      .where(eq(schema.multipleChoices.iqid, choiceId))
                      .for("update");

                    if (currentChoiceData.length > 0) {
                      await tx
                        .update(schema.multipleChoices)
                        .set({
                          question: html,
                          isQuestionEmpty: editor.api.isEmpty(),
                        })
                        .where(
                          and(
                            eq(schema.multipleChoices.questionId, questionId),
                            eq(schema.multipleChoices.iqid, choiceId),
                          ),
                        );
                    }

                    break;
                  }

                  case "q-choice-opt": {
                    const [_questionId, _choiceId, _optIdx] =
                      type[1]!.split("-");

                    questionId = parseInt(_questionId!);
                    const choiceId = parseInt(_choiceId!);
                    const optIdx = parseInt(_optIdx!);

                    /**
                     * WAJIB PAKAI ROW LOCK UNTUK
                     * MENCEGAH PERUBAHAN YANG MASUK
                     * SECARA BERSAMAAN
                     *
                     * contoh:
                     * User paste 5 baris yang otomatis trigger 5 field,
                     * secara bersamaan menyimpan data ke hocuspocus. Supaya operasi
                     * write berjalan dengan benar, lock row satu persatu supaya
                     * semua perubahan tersimpan dengan benar.
                     */
                    const currentChoiceData = await tx
                      .select({
                        options: schema.multipleChoices.options,
                      })
                      .from(schema.multipleChoices)
                      .where(eq(schema.multipleChoices.iqid, choiceId))
                      .for("update");

                    if (currentChoiceData[0]) {
                      const { options } = currentChoiceData[0];

                      const newOptions = options.map((d, idx) => {
                        if (idx === optIdx)
                          return {
                            ...d,
                            answer: html,
                            isEmpty: editor.api.isEmpty(),
                          };

                        return d;
                      });

                      await tx
                        .update(schema.multipleChoices)
                        .set({
                          options: newOptions,
                        })
                        .where(
                          and(
                            eq(schema.multipleChoices.questionId, questionId),
                            eq(schema.multipleChoices.iqid, choiceId),
                          ),
                        );
                    }

                    break;
                  }

                  case "q-essay-question": {
                    const [_questionId, _essayId] = type[1]!.split("-");

                    questionId = parseInt(_questionId!);
                    const essayId = parseInt(_essayId!);

                    const currentEssayData = await tx
                      .select({
                        id: schema.essays.iqid,
                      })
                      .from(schema.essays)
                      .where(eq(schema.essays.iqid, essayId))
                      .for("update");

                    if (currentEssayData.length > 0) {
                      await tx
                        .update(schema.essays)
                        .set({
                          question: html,
                          isQuestionEmpty: editor.api.isEmpty(),
                        })
                        .where(
                          and(
                            eq(schema.essays.questionId, questionId),
                            eq(schema.essays.iqid, essayId),
                          ),
                        );
                    }

                    break;
                  }
                }

                tx.update(schema.questions)
                  .set({
                    eligible: "PROCESSING",
                  })
                  .where(eq(schema.questions.id, questionId));
              });

              debouncedMessageQueue(String(questionId));

              const parentQuestion = await db.query.questions.findFirst({
                where: eq(schema.questions.id, questionId),
                columns: {
                  slug: true,
                },
              });

              logger.info(
                { documentName: realDocumentName },
                "Save success, removing cache....",
              );

              await cache.del(`trpc-get-question-slug-${parentQuestion?.slug}`);

              logger.info(
                { documentName: realDocumentName },
                "All operation success",
              );
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: unknown) {
              logger.error({ error }, "Some operation failed");
              // @ts-expect-error raw error capture
              span.recordException(error); // Logs the error in the Trace view too
            } finally {
              span.end();
            }
          });
        },
      }),
    ],

    async onAuthenticate(data) {
      return tracer.startActiveSpan("onAuthenticate", async (span) => {
        try {
          const cookieString = data.requestHeaders.cookie || "";

          const cookies = (
            cookieString !== ""
              ? Object.fromEntries(
                  cookieString
                    .split("; ")
                    .map((v) => v.split(/=(.*)/s).map(decodeURIComponent)),
                )
              : {}
          ) as {
            "authjs.session-token"?: string;
            "__Secure-authjs.session-token"?: string;
          };

          const token =
            cookies["authjs.session-token"] ||
            cookies["__Secure-authjs.session-token"];

          if (!token || token === "") {
            throw new Error("Unauthorized");
          }

          const session = await db.query.sessions.findFirst({
            where: eq(schema.sessions.sessionToken, token),
          });

          if (!session) {
            throw new Error("You aint logged in bruv");
          }
        } catch (error) {
          logger.error({ err: error }, "Authentication failed");

          // @ts-ignore for debugging purposes
          span.recordException(error);

          throw error;
        } finally {
          span.end();
        }
      });
    },
  });

  await server.listen();
};
