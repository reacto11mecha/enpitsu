import "./env";

import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { Server } from "@hocuspocus/server";
import { yTextToSlateElement } from "@slate-yjs/core";
import { createSlateEditor, serializeHtml } from "platejs";
import * as Y from "yjs";

import { and, eq } from "@enpitsu/db";
import { db, preparedYjsDocumentSelect } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";
import { cache, correctionQueue } from "@enpitsu/redis";

import { createDebounceById } from "./debouncer";

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
    console.error({
      code: "BULLMQ_ERR",
      message:
        "Gagal menambahkan queue ke bullmq, mohon periksa konektivitas redis",
    });
  }
}, 250);

export const yjsServer = async () => {
  const server = new Server({
    port: 1234,

    // Add logging
    extensions: [
      new Logger(),
      new Database({
        fetch: async ({ documentName }) => {
          const result = await preparedYjsDocumentSelect.execute({
            documentName,
          });

          if (!result) return null;

          return result.data;
        },

        store: async ({ documentName, state }) => {
          await db
            .insert(schema.yjsDocuments)
            .values({ name: documentName, data: state })
            .onConflictDoUpdate({
              target: schema.yjsDocuments.name,
              set: { data: state },
            });

          let questionId = 0;

          await db.transaction(async (tx) => {
            const tempDoc = new Y.Doc();
            Y.applyUpdate(tempDoc, state);

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
                const [_questionId, _choiceId, _optIdx] = type[1]!.split("-");

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

          try {
            const parentQuestion = await db.query.questions.findFirst({
              where: eq(schema.questions.id, questionId),
              columns: {
                slug: true,
              },
            });

            await cache.del(`trpc-get-question-slug-${parentQuestion?.slug}`);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err: unknown) {
            console.error({
              code: "CACHE_DEL_ERR",
              message: `Terjadi masalah saat reset cache untuk questionId: ${questionId}`,
            });
          }

          debouncedMessageQueue(String(questionId));
        },
      }),
    ],

    async onAuthenticate(data) {
      const cookie = data.requestHeaders.cookie;

      const cookies = (
        cookie !== ""
          ? Object.fromEntries(
              cookie!
                .split("; ")
                .map((v) => v.split(/=(.*)/s).map(decodeURIComponent)),
            )
          : {}
      ) as { "authjs.session-token"?: string };

      if (
        !cookies["authjs.session-token"] ||
        cookies["authjs.session-token"] === ""
      )
        throw new Error("Unauthorized");

      const token = cookies["authjs.session-token"];

      if (
        !(await db.query.sessions.findFirst({
          where: eq(schema.sessions.sessionToken, token),
        }))
      )
        throw new Error("You aint logged in bruv");
    },
  });

  await server.listen();
};
